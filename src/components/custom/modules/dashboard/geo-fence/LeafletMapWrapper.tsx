import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LeafletMapWrapperProps {
  userLocation: { lat: number; lng: number } | null;
  locationAccuracy: number | null;
  radius: number;
  markerIcon: L.Icon;
}

const LeafletMapWrapper = ({ 
  userLocation, 
  locationAccuracy, 
  radius, 
  markerIcon 
}: LeafletMapWrapperProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up existing map if it exists
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Create new map
    const map = L.map(containerRef.current, {
      center: userLocation || [0, 0],
      zoom: 13,
      attributionControl: false,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapRef.current = map;

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Only run once

  // Update map when user location changes
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    // Remove existing marker and circle
    if (markerRef.current) {
      mapRef.current.removeLayer(markerRef.current);
    }
    if (circleRef.current) {
      mapRef.current.removeLayer(circleRef.current);
    }

    // Add new marker
    const marker = L.marker([userLocation.lat, userLocation.lng], { icon: markerIcon })
      .bindPopup(`Latitude: ${userLocation.lat}<br>Longitude: ${userLocation.lng}`);
    
    marker.addTo(mapRef.current);
    markerRef.current = marker;

    // Add accuracy circle
    const circle = L.circle([userLocation.lat, userLocation.lng], {
      radius: locationAccuracy || radius,
      color: '#0078d4',
      fillOpacity: 0.3
    });
    
    circle.addTo(mapRef.current);
    circleRef.current = circle;

    // Fly to location
    mapRef.current.flyTo([userLocation.lat, userLocation.lng], 13, {
      animate: true,
      duration: 1.5
    });

  }, [userLocation, locationAccuracy, radius, markerIcon]);

  return (
    <div
      ref={containerRef}
      style={{
        height: "500px",
        width: "100%",
        margin: "0 auto",
        borderRadius: "10px",
      }}
      className="shadow-lg rounded-lg overflow-hidden border border-gray-300"
    />
  );
};

export default LeafletMapWrapper;