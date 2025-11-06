"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { USER_TOKEN } from "@/src/utils/constants";

const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [isGeofenceEnabled, setIsGeofenceEnabled] = useState(false);

  useEffect(() => {    
    const checkAuth = () => {
      if (pathname?.includes('/auth/azure/success')) {
        setIsChecking(false);
        return;
      }

      const token = localStorage.getItem(USER_TOKEN) || sessionStorage.getItem(USER_TOKEN);      
      
      if (!token) {
        const recheckTimer = setTimeout(() => {
          const recheckToken = localStorage.getItem(USER_TOKEN) || sessionStorage.getItem(USER_TOKEN);
          if (!recheckToken) {
            router.replace("/");
          }
          setIsChecking(false);
        }, 500);
        
        return () => clearTimeout(recheckTimer);
      }

      try {
        let finalEmployeeId: number | null = null;
        let finalUserInfo: any = null;
        let finalUserRole = '';
        let geofenceStatus = false;

        const decodedToken = decodeJWT(token);
        
        if (decodedToken) {
          if (decodedToken.id) finalEmployeeId = Number(decodedToken.id);
          if (decodedToken.role) finalUserRole = String(decodedToken.role);
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
              let userData = parsedData.user && typeof parsedData.user === 'object' ? parsedData.user : parsedData;
              
              if (userData.employeenumber && !finalEmployeeId) finalEmployeeId = Number(userData.employeenumber);
              if (userData.role && !finalUserRole) finalUserRole = String(userData.role);
              if (!finalUserInfo || (userData.employeename && Object.keys(userData).length >= Object.keys(finalUserInfo).length)) {
                finalUserInfo = userData;
              }
              if (userData.hasOwnProperty('isGeofence')) geofenceStatus = Boolean(userData.isGeofence);
            } catch (parseError) {
              console.error(`Error parsing ${key}:`, parseError);
            }
          }
        }

        const geofenceData = localStorage.getItem('isGeofence') || sessionStorage.getItem('isGeofence');
        if (geofenceData && geofenceStatus === false) {
          try {
            geofenceStatus = Boolean(JSON.parse(geofenceData));
          } catch {
            geofenceStatus = geofenceData === 'true';
          }
        }

        setEmployeeId(finalEmployeeId);
        setUserInfo(finalUserInfo);
        setUserRole(finalUserRole);
        setIsGeofenceEnabled(geofenceStatus);
        setIsAuthenticated(true);
        
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace("/");
      }
      
      setIsChecking(false);
    };

    const initTimer = setTimeout(checkAuth, 100);
    return () => clearTimeout(initTimer);
  }, [pathname, router]);

  return { 
    isAuthenticated, 
    isChecking, 
    employeeId, 
    userInfo,
    userRole,
    isGeofenceEnabled
  };
}