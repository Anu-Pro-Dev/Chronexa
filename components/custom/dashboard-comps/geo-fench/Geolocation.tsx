"use client";
import { useRouter } from "next/navigation";
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from "react-leaflet";
import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

// Custom marker icon
const markerIcon = new L.Icon({
  iconUrl: "/icons/marker-icon.png",
  shadowUrl: "/icons/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Calculate distance between two coordinates in meters
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

// Center the map to user location smoothly
const CenterMap = ({ userLocation }: { userLocation: { lat: number; lng: number } | null }) => {
  const map = useMap();
  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 13, {
        animate: true,
        duration: 1.5, // seconds
      });
    }
  }, [userLocation, map]);
  return null;
};

export default function Geolocation() {
  const router = useRouter();
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

  const handleCloseModal = () => setShowSuccessModal(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (localStorage.getItem("showLocationToast")) {
      toast(
        "⚠️ You cleared the cache. To reset Location Permission, please check browser settings manually.",
        { duration: 5000 }
      );
      localStorage.removeItem("showLocationToast");
    }

    const storedUserData = localStorage.getItem("userData");
    // if (!storedUserData) {
    //   toast.error("No user data found.");
    //   router.push("/");
    //   return;
    // }

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
  }, [router]);

  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported.");
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
      (error) => {
        if (!locationErrorShown.current) {
          console.log(error);
          toast.error("User denied Geolocation. Enable it from browser settings.");
          locationErrorShown.current = true;
        }
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watcher);

  }, [tobevalidated, officeCoordinates, radius]);

  useEffect(() => {
    // Function to fetch the server time
    const fetchServerTime = async () => {
      try {
        const res = await fetch("/api/main/servertime");
        const data = await res.json();
        if (res.ok) {
        const { currentDate, currentTime, serverTime } = data;
        setTransactionDate(currentDate);
        // Convert time to 24-hour format
        const time24Hour = new Date(`1970-01-01T${currentTime}Z`).toLocaleTimeString('en-GB', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        setTransactionTime(time24Hour);
        // Set Date object for live ticking
        setLiveServerTime(new Date(serverTime));
        } else {
          toast.error("Failed to fetch server time.");
        }
      } catch {
        toast.error("Error fetching time.");
      }
    };

    // Fetch the server time initially
    fetchServerTime();
  }, []);

  useEffect(() => {
    if (!liveServerTime) return;

    const interval = setInterval(() => {
      setLiveServerTime((prev) => {
        if (!prev) return new Date();
        const newTime = new Date(prev.getTime() + 1000);
        setTransactionTime(newTime.toLocaleTimeString());
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
      const res = await fetch("/api/main/servertime");
      serverTimeResponse = await res.json();
    } catch {
      toast.error("Failed to get server time.");
      return;
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

      const response = await fetch("/api/main/punchin", {
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

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="w-full z-10" style={{ height: "500px", width: "100%" }}>
        <MapContainer
          // center={userLocation || (officeCoordinates[0] || { lat: 0, lng: 0 })}
          center={userLocation || { lat: 0, lng: 0 }}
          zoom={13}
          style={{
            height: "500px",
            width: "100%",
            margin: "0 auto",
            borderRadius: "10px",
          }}
          className="shadow-lg rounded-lg overflow-hidden border border-gray-300"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {userLocation && <CenterMap userLocation={userLocation} />}
          {userLocation && (
            <Marker position={userLocation} icon={markerIcon}>
              <Popup>
                <span>Latitude: {userLocation.lat}</span>
                <br />
                <span>Longitude: {userLocation.lng}</span>
              </Popup>
            </Marker>
          )}
          {/* {tobevalidated === "1" &&
            officeCoordinates.map((office, index) => (
              <Circle
                key={index}
                center={[office.lat, office.lng]}
                radius={radius}
                color="#0078d4"
                fillOpacity={0.3}
              />
            ))} */}
            {/* {tobevalidated === "1" && userLocation && ( */}
            {userLocation && (
              <Circle 
                center={[userLocation.lat, userLocation.lng]} 
                radius={locationAccuracy || radius}
                color="#0078d4" 
                fillOpacity={0.3} 
              />
            )}
        </MapContainer>

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
}: PunchFormProps) => (
  <form
    className="absolute bottom-0 sm:bottom-4 right-0 sm:right-4 bg-white bg-opacity-80 border p-5 rounded-md shadow-md w-full sm:w-[350px]"
    style={{ zIndex: 1000 }}
  >
    {/* <h2 className="uppercase text-lg font-extrabold text-primary mb-3">
      {transactionType === "IN" ? "Punch In" : "Punch Out"}
    </h2> */}
    <div className="mb-2">
      <Label className="font-normal text-text-primary">
        Transaction Date
      </Label>
      <Input type="date" value={transactionDate} disabled className="bg-white bg-opacity-70 mb-2" />
    </div>
    <div className="mb-2">
      <Label className="font-normal text-text-primary">
        Transaction Time
      </Label>
      <Input type="text" placeholder="__:__:__" value={transactionTime} disabled className="bg-white bg-opacity-70 mb-2" />
    </div>
    <Button
      type="button"
      size="lg"
      onClick={handlePunch}
      className="w-full mx-auto mt-2"
      // className={`w-full mx-auto mt-2 ${
      //   transactionType === "IN" ? "bg-success text-white" : "bg-error text-white"
      // }`}
      disabled={isLoading}
    >
      {isLoading ? "Processing..." : transactionType === "IN" ? "Punch In" : "Punch Out"}
    </Button>
  </form>
);

const SuccessModal = ({
  transactionType,
  handleCloseModal,
}: {
  transactionType: "IN" | "OUT";
  handleCloseModal: () => void;
}) => (
  <div className="fixed top-0 left-0 flex justify-center items-center bg-opacity-50 bg-black w-full h-full z-[1000]">
    <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-sm mx-auto">
      <h2 className="text-lg font-bold mb-2">
        {transactionType === "OUT" ? "Punched In" : "Punched Out"} Successfully!
      </h2>
      <p className="text-gray-600 mb-4">
        {transactionType === "OUT" ? "You have successfully punched in!" : "You have successfully punched out!"}
      </p>
      <Button onClick={handleCloseModal} size="lg" className="w-full">
        Close
      </Button>
    </div>
  </div>
);