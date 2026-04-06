import { create } from "zustand";
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
  } catch {
    return null;
  }
};

interface AuthState {
  isAuthenticated: boolean;
  isChecking: boolean;
  employeeId: number | null;
  userInfo: any;
  userRole: string;
  isGeofenceEnabled: boolean;
  _initialized: boolean;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isChecking: true,
  employeeId: null,
  userInfo: null,
  userRole: '',
  isGeofenceEnabled: false,
  _initialized: false,

  initialize: () => {
    if (get()._initialized) return;
    set({ _initialized: true });

    if (typeof window === 'undefined') {
      set({ isChecking: false });
      return;
    }

    const token = localStorage.getItem(USER_TOKEN) || sessionStorage.getItem(USER_TOKEN);

    if (!token) {
      set({ isChecking: false, isAuthenticated: false });
      return;
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
        const data = localStorage.getItem(key) || sessionStorage.getItem(key);

        if (data) {
          try {
            const parsedData = JSON.parse(data);
            const userData = parsedData.user && typeof parsedData.user === 'object' ? parsedData.user : parsedData;

            if (userData.employeenumber && !finalEmployeeId) finalEmployeeId = Number(userData.employeenumber);
            if (userData.role && !finalUserRole) finalUserRole = String(userData.role);
            if (!finalUserInfo || (userData.employeename && Object.keys(userData).length >= Object.keys(finalUserInfo).length)) {
              finalUserInfo = userData;
            }
            if (userData.hasOwnProperty('isGeofence')) geofenceStatus = Boolean(userData.isGeofence);
          } catch {
            // Skip unparseable key
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

      set({
        employeeId: finalEmployeeId,
        userInfo: finalUserInfo,
        userRole: finalUserRole,
        isGeofenceEnabled: geofenceStatus,
        isAuthenticated: true,
        isChecking: false,
      });
    } catch {
      set({ isChecking: false, isAuthenticated: false });
    }
  },
}));