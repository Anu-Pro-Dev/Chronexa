"use client";
import { UserAxiosInstance } from "@/src/lib/axios";
import { useUserStore } from "@/src/store/userStore";
import React, { useEffect, useState } from "react";
import { setAuthToken } from "@/src/utils/authToken";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getFirstAccessibleRoute } from "@/src/lib/getFirstAccessibleRoute";
import { useDashboardStore } from "@/src/store/useDashboardStore";

interface AuthMeResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    roleId?: number;
    role_id?: number;
    [key: string]: any;
  };
}

function Page() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const router = useRouter();
  const setRole = useDashboardStore((s) => s.setRole);

  useEffect(() => {
    const extractAndSaveToken = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const employeeId = params.get("employeeId");

        if (!token) {
          setStatus("error");
          toast.error("No authentication token found");
          setTimeout(() => router.push("/"), 2000);
          return;
        }

        setAuthToken(token, true);

        if (employeeId) {
          localStorage.setItem("employeeId", employeeId);
        }

        const res = await UserAxiosInstance.post<AuthMeResponse>(
          "/auth/me",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        if (res.status === 200 && res.data?.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
          useUserStore.getState().setUser(res.data.user);

          setStatus("success");

          // ── Privilege-based redirect ─────────────────────────────────
          const roleId = res.data.user?.roleId ?? res.data.user?.role_id ?? null;
          let destination = "/dashboard";

          if (roleId) {
            try {
              // Persist role in store for the rest of the app
              setRole(Number(roleId));

              const privRes = await UserAxiosInstance.get<{ data: any }>(
                `/secRolePrivilege?roleId=${roleId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );

              const raw = privRes.data?.data;
              const data = Array.isArray(raw) ? raw[0] : raw;

              if (data) {
                const privilegeMap: Record<string, any> = {};

                Object.keys(data).forEach((moduleKey) => {
                  const moduleData = data[moduleKey];
                  if (typeof moduleData !== "object" || !moduleData) return;

                  privilegeMap[moduleKey] = {
                    ...moduleData,
                    hasView: moduleData.allowed === true,
                    subModules: (moduleData.subModules || []).map((sub: any) => ({
                      ...sub,
                      hasView: sub.privileges?.view === true,
                      tabs: (sub.tabs || []).map((tab: any) => ({
                        ...tab,
                        hasView: tab.privileges?.view === true,
                      })),
                    })),
                  };
                });

                destination = getFirstAccessibleRoute(privilegeMap);
              }
            } catch (e) {
              console.error("Privilege fetch failed, using fallback route", e);
            }
          }

          setTimeout(() => {
            router.push(destination);
          }, 500);
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (error) {
        console.error("Error during authentication:", error);
        setStatus("error");
        toast.error("Authentication failed. Please try again.");

        localStorage.removeItem("token");
        localStorage.removeItem("employeeId");
        localStorage.removeItem("user");

        setTimeout(() => router.push("/"), 2000);
      }
    };

    if (typeof window !== "undefined") {
      extractAndSaveToken();
    }
  }, [router, setRole]);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-background">
      <div className="bg-accent p-8 flex flex-col items-center shadow-card rounded-[10px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-5"></div>
        <h1 className="text-2xl font-bold text-primary mb-2">
          Azure Authentication Success
        </h1>
        <p className="text-sm text-text-primary mb-1">
          You are being redirected to your dashboard...
        </p>
        <p className="text-sm text-text-secondary">
          If you are not redirected automatically,{" "}
          <a href="/dashboard" className="text-primary underline">
            click here
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default Page;