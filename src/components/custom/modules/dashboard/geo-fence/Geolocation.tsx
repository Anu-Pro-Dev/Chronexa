"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { useShowToast } from "@/src/utils/toastHelper";
import dynamic from "next/dynamic";
import { useQuery, useMutation } from "@tanstack/react-query";
import { serverTimeRequest, serverTimeZoneRequest, addEventTransaction } from "@/src/lib/apiHandler";

const DynamicMap = dynamic(() => import('./LeafletMapWrapper'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-200 flex items-center justify-center rounded-lg">
      <p>Loading map...</p>
    </div>
  )
});

const markerIcon = new L.Icon({
  iconUrl: "/icons/marker-icon.png",
  shadowUrl: "/icons/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371e3;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const safeLocalStorage = {
  getItem: (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
};

export default function Geolocation() {
  const router = useRouter();
  const { dir, translations } = useLanguage();
  const showToast = useShowToast();
  const t = translations?.modules?.dashboard || {};
  const locationErrorShown = useRef(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [officeCoordinates, setOfficeCoordinates] = useState<{ lat: number; lng: number }[]>([]);
  const [tobevalidated, setTobeValidated] = useState<string | null>(null);
  const [radius, setRadius] = useState<number>(500);
  const [transactionDate, setTransactionDate] = useState("");
  const [transactionTime, setTransactionTime] = useState("");
  const [minimumpunchgap, setMinimumpunchgap] = useState<number | null>(null);
  const [isOutsideGeofence, setIsOutsideGeofence] = useState(false);
  const [transactionType, setTransactionType] = useState<"IN" | "OUT">("IN");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [liveServerTime, setLiveServerTime] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const handleCloseModal = () => setShowSuccessModal(false);

  const { data: serverTimeData, refetch: refetchServerTime } = useQuery({
    queryKey: ['serverTime'],
    queryFn: serverTimeZoneRequest,
    refetchInterval: 60000,
    enabled: isMounted,
  });

  const punchMutation = useMutation({
    mutationFn: (punchData: {
      employee_id: number;
      transaction_time: string;
      reason: string;
      user_entry_flag: boolean;
      transaction_type: string;
      is_geo_validated: string;
      original_coordinates: string;
      matching_coordinates: string;
    }) => addEventTransaction(punchData),
    onSuccess: (result) => {
      setShowSuccessModal(true);
      const newTransactionType = userData.lastpunchtype === "IN" ? "OUT" : "IN";
      setTransactionType(newTransactionType === "IN" ? "OUT" : "IN");

      const updatedUser = {
        ...userData,
        lastpunchtype: newTransactionType,
        lastpunchtime: new Date().toISOString(),
      };
      setUserData(updatedUser);
      safeLocalStorage.setItem("userData", JSON.stringify(updatedUser));
      safeLocalStorage.setItem("lastpunchtime", new Date().toISOString());

      showToast("success", "punch_success");
    },
    onError: (error: any) => {
      showToast("error", "punch_error");
    }
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (safeLocalStorage.getItem("showLocationToast")) {
      showToast("error", "location_cache_cleared");
      safeLocalStorage.removeItem("showLocationToast");
    }

    const storedUserData = safeLocalStorage.getItem("userData");

    try {
      if (!storedUserData) return;
      const parsedUserData = JSON.parse(storedUserData);
      setUserData(parsedUserData);

      setTobeValidated(parsedUserData?.tobevalidated ?? null);
      if (parsedUserData.minimumpunchgap !== null) {
        setMinimumpunchgap(parseInt(parsedUserData.minimumpunchgap, 10));
      }

      const sanitized = parsedUserData.geocoordinates?.replace(/\u00A0/g, " ");
      let parsedCoordinates: [number, number][] = [];
      try {
        parsedCoordinates = JSON.parse(sanitized);
      } catch {
        showToast("error", "invalid_coordinates_format");
        return;
      }

      setOfficeCoordinates(parsedCoordinates.map(([lat, lng]) => ({ lat, lng })));
      setRadius(Number(parsedUserData.radius) || 500);
      const lastPunch = parsedUserData.lastpunchtype;
      setTransactionType(lastPunch === "IN" ? "OUT" : "IN");
    } catch {
      showToast("error", "user_data_processing_error");
    }
  }, [isMounted, router, showToast]);

  useEffect(() => {
    if (!isMounted || typeof navigator === 'undefined' || !navigator.geolocation) {
      if (isMounted) {
        showToast("error", "geolocation_not_supported");
      }
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        const newLoc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(newLoc);
        setLocationAccuracy(position.coords.accuracy);
        if (tobevalidated === "1" && officeCoordinates.length) {
          const isInside = officeCoordinates.some(
            (office) => getDistance(newLoc.lat, newLoc.lng, office.lat, office.lng) <= radius
          );
          setIsOutsideGeofence(!isInside);
        } else {
          setIsOutsideGeofence(false);
        }
      },
      (error: GeolocationPositionError) => {
        if (!locationErrorShown.current) {
          let toastKey = "geolocation_error";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              toastKey = "location_permission_denied";
              break;
            case error.POSITION_UNAVAILABLE:
              toastKey = "location_unavailable";
              break;
            case error.TIMEOUT:
              toastKey = "location_timeout";
              break;
            default:
              toastKey = "geolocation_error";
          }
          
          console.error("Geolocation error:", {
            code: error.code,
            message: error.message,
            timestamp: new Date().toISOString()
          });
          
          showToast("error", toastKey);
          locationErrorShown.current = true;
        }
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );

    return () => {
      if (watcher) {
        navigator.geolocation.clearWatch(watcher);
      }
    };

  }, [isMounted, tobevalidated, officeCoordinates, radius, showToast]);

  useEffect(() => {
    if (!isMounted || !serverTimeData) return;

    try {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = now.toLocaleTimeString('en-GB', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      if (serverTimeData?.currentDate && serverTimeData?.currentTime) {
        setTransactionDate(serverTimeData.currentDate);
        const time24Hour = new Date(`1970-01-01T${serverTimeData.currentTime}Z`).toLocaleTimeString('en-GB', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        setTransactionTime(time24Hour);
        setLiveServerTime(new Date(serverTimeData.serverTime || serverTimeData.currentTime));
      } else {
        setTransactionDate(currentDate);
        setTransactionTime(currentTime);
        setLiveServerTime(now);
        console.warn("Server time not available, using client time");
      }
    } catch (error) {
      showToast("error", "time_setup_error");
      console.error("Time setup error:", error);
    }
  }, [isMounted, serverTimeData, showToast]);

  useEffect(() => {
    if (!liveServerTime) return;

    const interval = setInterval(() => {
      setLiveServerTime((prev) => {
        if (!prev) return new Date();
        const newTime = new Date(prev.getTime() + 1000);
        setTransactionTime(newTime.toLocaleTimeString('en-GB', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }));
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [liveServerTime]);

  const handlePunch = async () => {
    if (!userLocation) {
      showToast("error", "location_not_available");
      return;
    }

    if (!userData?.employeenumber) {
      showToast("error", "user_data_not_found");
      return;
    }

    let matchedOffice = null;
  
    if (tobevalidated === "1") {
      if (!officeCoordinates || officeCoordinates.length === 0) {
        showToast("error", "no_coordinates_found");
        return;
      }

      matchedOffice = officeCoordinates.find(office => {
        const distance = getDistance(userLocation.lat, userLocation.lng, office.lat, office.lng);
        return distance <= radius;
      });

      if (!matchedOffice) {
        showToast("error", "outside_geofence");
        setIsOutsideGeofence(true);
        return;
      }
    }

    const lastPunchTimeStr = safeLocalStorage.getItem("lastpunchtime");
    const lastPunchTime = lastPunchTimeStr ? new Date(lastPunchTimeStr) : null;
    const currentTime = new Date();

    const timeDiff = lastPunchTime
      ? (currentTime.getTime() - lastPunchTime.getTime()) / 60000
      : Infinity;

    if (minimumpunchgap !== null && timeDiff < minimumpunchgap) {
      showToast("error", "minimum_gap_required");
      return;
    }

    const newTransactionType = userData.lastpunchtype === "IN" ? "OUT" : "IN";

    const punchData = {
      employee_id: parseInt(userData.employeenumber), 
      transaction_time: `${transactionDate} ${transactionTime}`,
      reason: `${newTransactionType} punch via geolocation`,
      user_entry_flag: false,
      transaction_type: newTransactionType,
      is_geo_validated: userData.tobevalidated,
      original_coordinates: JSON.stringify([userLocation.lat, userLocation.lng]),
      matching_coordinates: JSON.stringify(matchedOffice ? [matchedOffice.lat, matchedOffice.lng] : [])
    };

    punchMutation.mutate(punchData);
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center relative">
        <div className="w-full" style={{ height: "500px", width: "100%" }}>
          <div className="h-full w-full bg-gray-200 flex items-center justify-center rounded-lg">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="w-full z-10" style={{ height: "500px", width: "100%" }}>
        <DynamicMap
          userLocation={userLocation}
          locationAccuracy={locationAccuracy}
          radius={radius}
          markerIcon={markerIcon}
        />

        <PunchForm
          transactionType={transactionType}
          transactionDate={transactionDate}
          transactionTime={transactionTime}
          isLoading={punchMutation.isPending}
          handlePunch={handlePunch}
          isOutsideGeofence={isOutsideGeofence}
        />

        {showSuccessModal && (
          <SuccessModal
            transactionType={transactionType}
            handleCloseModal={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
}

interface PunchFormProps {
  transactionType: "IN" | "OUT";
  transactionDate: string;
  transactionTime: string;
  isLoading: boolean;
  handlePunch: () => void;
  isOutsideGeofence: boolean;
}

const PunchForm = ({
  transactionType,
  transactionDate,
  transactionTime,
  isLoading,
  handlePunch,
}: PunchFormProps) => {
  const { dir, translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};
  return (
    <form
      dir={dir}
      className="absolute bottom-0 sm:bottom-4 right-0 sm:right-4 bg-white bg-opacity-80 border p-5 rounded-md shadow-md w-full sm:w-[350px]"
      style={{ zIndex: 1000 }}
    >
      <div className="mb-2">
        <Label className="font-normal text-text-primary">
          {t?.trans_date}
        </Label>
        <Input
          type="date"
          value={transactionDate}
          disabled
          className={`bg-white bg-opacity-70 mb-2 ${
            dir === "rtl" ? "flex-row-reverse justify-start text-right" : ""
          }`}
        />
      </div>

      <div className="mb-2">
        <Label className="font-normal text-text-primary">
          {t?.trans_time}
        </Label>
        <Input
          type="text"
          placeholder="__:__:__"
          value={transactionTime}
          disabled
          className="bg-white bg-opacity-70 mb-2"
        />
      </div>

      <Button
        type="button"
        size="lg"
        onClick={handlePunch}
        className="w-full mx-auto mt-2"
        disabled={isLoading}
      >
        {isLoading
          ? t?.processing || 'Processing...'
          : transactionType === 'IN'
            ? translations?.buttons?.punch_in
            : translations?.buttons?.punch_out}
      </Button>
    </form>
  );
};

const SuccessModal = ({
  transactionType,
  handleCloseModal,
}: {
  transactionType: "IN" | "OUT";
  handleCloseModal: () => void;
}) => {
  const { dir, translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};
  return(
    <div className="fixed top-0 left-0 flex justify-center items-center bg-opacity-50 bg-black w-full h-full z-[1000]">
      <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-sm mx-auto">
        <h2 className="text-lg font-bold mb-2">
          {transactionType === "OUT" ? "Punched In" : "Punched Out"} {t?.successfully}!
        </h2>
        <p className="text-gray-600 mb-4">
          {transactionType === "OUT" ? 
            t?.punch_in_success : t?.punch_out_success
          }
        </p>
        <Button onClick={handleCloseModal} size="lg" className="w-full">
          {translations?.buttons?.close}
        </Button>
      </div>
    </div>
  )
};