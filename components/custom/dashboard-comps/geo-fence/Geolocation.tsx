"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";

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

export default function Geolocation() {
  const router = useRouter();
  const { dir, translations } = useLanguage();
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
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [liveServerTime, setLiveServerTime] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const handleCloseModal = () => setShowSuccessModal(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (localStorage.getItem("showLocationToast")) {
      toast(
        "⚠️ You cleared the cache. To reset Location Permission, please check browser settings manually.",
        { duration: 5000 }
      );
      localStorage.removeItem("showLocationToast");
    }

    const storedUserData = localStorage.getItem("userData");

    try {
      if (!storedUserData) return;
      const userData = JSON.parse(storedUserData);

      setTobeValidated(userData?.tobevalidated ?? null);
      if (userData.minimumpunchgap !== null) {
        setMinimumpunchgap(parseInt(userData.minimumpunchgap, 10));
      }

      const sanitized = userData.geocoordinates?.replace(/\u00A0/g, " ");
      let parsedCoordinates: [number, number][] = [];
      try {
        parsedCoordinates = JSON.parse(sanitized);
      } catch {
        toast.error("Invalid geocoordinates format.");
        return;
      }

      setOfficeCoordinates(parsedCoordinates.map(([lat, lng]) => ({ lat, lng })));
      setRadius(Number(userData.radius) || 500);
      const lastPunch = userData.lastpunchtype;
      setTransactionType(lastPunch === "IN" ? "OUT" : "IN");
    } catch {
      toast.error("Error processing user data.");
    }
  }, [isMounted, router]);

  useEffect(() => {
    if (!isMounted || !navigator.geolocation) {
      if (isMounted) {
        toast.error("Geolocation is not supported.");
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
          let errorMessage = "Unknown geolocation error";
          let userMessage = "Unable to get location. Please check your browser settings.";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "User denied the request for Geolocation";
              userMessage = "Location access denied. Please enable location permissions in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable";
              userMessage = "Location information is unavailable. Please check your GPS settings.";
              break;
            case error.TIMEOUT:
              errorMessage = "The request to get user location timed out";
              userMessage = "Location request timed out. Please try again.";
              break;
            default:
              errorMessage = `Geolocation error: ${error.message}`;
              userMessage = "Unable to get location. Please check your browser settings.";
          }
          
          console.error("Geolocation error:", {
            code: error.code,
            message: error.message,
            timestamp: new Date().toISOString()
          });
          
          toast.error(userMessage);
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

  }, [isMounted, tobevalidated, officeCoordinates, radius]);

  useEffect(() => {
    if (!isMounted) return;

    const fetchServerTime = async () => {
      try {

        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];
        const currentTime = now.toLocaleTimeString('en-GB', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        try {
          const res = await fetch("/api/geofench/servertime");
          if (res.ok) {
            const data = await res.json();
            const { currentDate: serverDate, currentTime: serverTime, serverTime: fullServerTime } = data;
            setTransactionDate(serverDate);

            const time24Hour = new Date(`1970-01-01T${serverTime}Z`).toLocaleTimeString('en-GB', {
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });
            setTransactionTime(time24Hour);
            setLiveServerTime(new Date(fullServerTime));
          } else {
            setTransactionDate(currentDate);
            setTransactionTime(currentTime);
            setLiveServerTime(now);
            console.warn("Server time API not available, using client time");
          }
        } catch (serverError) {
          setTransactionDate(currentDate);
          setTransactionTime(currentTime);
          setLiveServerTime(now);
          console.warn("Failed to fetch server time, using client time:", serverError);
        }
      } catch (error) {
        toast.error("Error setting up time.");
        console.error("Time setup error:", error);
      }
    };

    fetchServerTime();
  }, [isMounted]);

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
      toast.error("Unable to get location.");
      return;
    }

    let matchedOffice = null;
  
    if (tobevalidated === "1") {

      if (!officeCoordinates || officeCoordinates.length === 0) {
        toast.error("No COORDINATES found.");
        return;
      }

      matchedOffice = officeCoordinates.find(office => {
        const distance = getDistance(userLocation.lat, userLocation.lng, office.lat, office.lng);
        return distance <= radius;
      });

      if (!matchedOffice) {
        toast.error("You are outside the geofenced area.");
        setIsOutsideGeofence(true);
        return;
      }
    }

    let serverTimeResponse;
    try {
      const res = await fetch("/api/geofench/servertime");
      if (res.ok) {
        serverTimeResponse = await res.json();
      } else {
        const now = new Date();
        serverTimeResponse = {
          serverTime: now.toISOString(),
          currentDate: now.toISOString().split('T')[0],
          currentTime: now.toLocaleTimeString()
        };
        console.warn("Using client time for punch");
      }
    } catch (error) {
      const now = new Date();
      serverTimeResponse = {
        serverTime: now.toISOString(),
        currentDate: now.toISOString().split('T')[0],
        currentTime: now.toLocaleTimeString()
      };
      console.warn("Server time fetch failed, using client time:", error);
    }

    const serverDate = new Date(serverTimeResponse.serverTime);
    const lastPunchTimeStr = localStorage.getItem("lastpunchtime");
    const lastPunchTime = lastPunchTimeStr ? new Date(lastPunchTimeStr) : null;

    const timeDiff = lastPunchTime
      ? (serverDate.getTime() - lastPunchTime.getTime()) / 60000
      : Infinity;

    if (minimumpunchgap !== null && timeDiff < minimumpunchgap) {
      toast.error(`Minimum gap of ${minimumpunchgap} minutes required.`);
      return;
    }

    localStorage.setItem("lastpunchtime", new Date(serverTimeResponse.serverTime).toISOString());

    const userDataStr = localStorage.getItem("userData");
    const userData = userDataStr ? JSON.parse(userDataStr) : {};
    if (!userData.employeenumber) {
      toast.error("User data not found.");
      return;
    }
  
    const newTransactionType = userData.lastpunchtype === "IN" ? "OUT" : "IN";

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("employeenumber", userData.employeenumber);
      formData.append("transactiondate", transactionDate);
      formData.append("transactiontime", transactionTime);
      formData.append("transactiontype", newTransactionType);
      formData.append("isgeovalidated", userData.tobevalidated);
      formData.append("originalcoordinates", JSON.stringify([userLocation.lat, userLocation.lng]));
      formData.append(
        "matchingcoordinates",
        JSON.stringify(matchedOffice ? [matchedOffice.lat, matchedOffice.lng] : [])
      );

      const response = await fetch("/api/geofench/punchin", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setTransactionTime(transactionTime);
        setShowSuccessModal(true);
        setTransactionType(newTransactionType === "IN" ? "OUT" : "IN");

        const updatedUser = {
          ...userData,
          lastpunchtype: newTransactionType,
          lastpunchtime: serverTimeResponse.serverTime,
        };
        localStorage.setItem("userData", JSON.stringify(updatedUser));

        toast.success(result.message || "Punch successful.");
      } else {
        toast.error(result.message || "Failed to record punch.");
      }
    } catch {
      toast.error("Error processing punch.");
    } finally {
      setIsLoading(false);
    }
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
          isLoading={isLoading}
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