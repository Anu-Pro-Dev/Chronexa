"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { USER_TOKEN } from "@/utils/constants";

// Utility function to decode JWT token (if your token is JWT)
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export function useAuthGuard() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isGeofenceEnabled, setIsGeofenceEnabled] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem(USER_TOKEN) || sessionStorage.getItem(USER_TOKEN);
      
      if (!token) {
        router.replace("/");  // redirect to login if not authenticated
        setIsChecking(false);
        return;
      }

      try {
        // Method 1: Get employee ID from JWT token (contains "id" field)
        const decodedToken = decodeJWT(token);
        if (decodedToken && decodedToken.id) {
          setEmployeeId(Number(decodedToken.id));
        }

        // Check for geofence status from various storage locations
        let geofenceStatus = false;
        
        // Method 2: Get user data from stored login response
        const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          setUserInfo(parsedUserData);
          
          // Check if it's the full login response structure
          if (parsedUserData.user && parsedUserData.user.employeenumber) {
            setEmployeeId(Number(parsedUserData.user.employeenumber));
            setUserInfo(parsedUserData.user);
          }
          // Or if just the user object is stored
          else if (parsedUserData.employeenumber) {
            setEmployeeId(Number(parsedUserData.employeenumber));
            setUserInfo(parsedUserData);
          }
          
          // Check for geofence in userData
          if (parsedUserData.isGeofence !== undefined) {
            geofenceStatus = parsedUserData.isGeofence;
          }
        }

        // Method 3: Check if login response is stored under 'loginResponse' key
        const loginResponse = localStorage.getItem('loginResponse') || sessionStorage.getItem('loginResponse');
        if (loginResponse) {
          const parsedLoginResponse = JSON.parse(loginResponse);
          if (parsedLoginResponse.user && parsedLoginResponse.user.employeenumber) {
            setEmployeeId(Number(parsedLoginResponse.user.employeenumber));
            setUserInfo(parsedLoginResponse.user);
          }
          
          // Check for geofence in loginResponse
          if (parsedLoginResponse.isGeofence !== undefined) {
            geofenceStatus = parsedLoginResponse.isGeofence;
          }
        }

        // Method 4: If only user object is stored separately
        const userObject = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userObject) {
          const parsedUser = JSON.parse(userObject);
          if (parsedUser.employeenumber) {
            setEmployeeId(Number(parsedUser.employeenumber));
            setUserInfo(parsedUser);
          }
        }

        // Method 5: Check if geofence status is stored separately
        const geofenceData = localStorage.getItem('isGeofence') || sessionStorage.getItem('isGeofence');
        if (geofenceData) {
          try {
            geofenceStatus = JSON.parse(geofenceData);
          } catch {
            // If it's stored as string 'true'/'false'
            geofenceStatus = geofenceData === 'true';
          }
        }

        setIsGeofenceEnabled(geofenceStatus);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        // If there's an error parsing user data, redirect to login
        router.replace("/");
      }
      
      setIsChecking(false);
    };

    // Only run once
    checkAuth();
  }, []); // Empty dependency array to prevent re-execution

  return { 
    isAuthenticated, 
    isChecking, 
    employeeId, 
    userInfo,
    isGeofenceEnabled
  };
}