"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { USER_TOKEN } from "@/src/utils/constants";

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
        router.replace("/");
        setIsChecking(false);
        return;
      }

      try {
        let finalEmployeeId: number | null = null;
        let finalUserInfo: any = null;
        let geofenceStatus = false;

        const decodedToken = decodeJWT(token);
        
        if (decodedToken && decodedToken.id) {
          finalEmployeeId = Number(decodedToken.id);
        }

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
        }

        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
        }

        const storageKeys = [
          'loginResponse',
          'userData', 
          'user',
          'currentUser',
          'authUser',
          'employee',
          'userProfile'
        ];

        for (const key of storageKeys) {
          const localData = localStorage.getItem(key);
          const sessionData = sessionStorage.getItem(key);
          const data = localData || sessionData;
                    
          if (data) {
            try {
              const parsedData = JSON.parse(data);
              
              let userData = parsedData;
              
              if (parsedData.user && typeof parsedData.user === 'object') {
                userData = parsedData.user;
              }
              
              if (userData.employeenumber && !finalEmployeeId) {
                finalEmployeeId = Number(userData.employeenumber);
              }
              
              if (!finalUserInfo || (userData.employeename && Object.keys(userData).length >= Object.keys(finalUserInfo).length)) {
                finalUserInfo = userData;
              }
              
              if (userData.hasOwnProperty('isGeofence')) {
                geofenceStatus = Boolean(userData.isGeofence);
              } else if (parsedData.hasOwnProperty('isGeofence')) {
                geofenceStatus = Boolean(parsedData.isGeofence);
              }
              
            } catch (parseError) {
              console.error(`Error parsing ${key}:`, parseError);
            }
          }
        }

        const geofenceData = localStorage.getItem('isGeofence') || sessionStorage.getItem('isGeofence');
        if (geofenceData) {
          try {
            const standaloneGeofence = JSON.parse(geofenceData);
            if (geofenceStatus === false) {
              geofenceStatus = Boolean(standaloneGeofence);
            }
          } catch {
            if (geofenceStatus === false) {
              geofenceStatus = geofenceData === 'true';
            }
          }
        }

        setEmployeeId(finalEmployeeId);
        setUserInfo(finalUserInfo);
        setIsGeofenceEnabled(geofenceStatus);
        setIsAuthenticated(true);
        
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace("/");
      }
      
      setIsChecking(false);
    };

    checkAuth();
  }, []);

  return { 
    isAuthenticated, 
    isChecking, 
    employeeId, 
    userInfo,
    isGeofenceEnabled
  };
}