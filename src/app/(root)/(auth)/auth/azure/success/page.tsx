"use client";
import { UserAxiosInstance } from "@/src/lib/axios";
import { useUserStore } from "@/src/stores/userStore";
import React, { useEffect } from "react";
import { setAuthToken } from "@/src/utils/authToken";

interface AuthMeResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    [key: string]: any;
  };
}

function Page() {
  useEffect(() => {
    const extractAndSaveToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const employeeId = params.get("employeeId");

      if (token) {
        setAuthToken(token, true);

        if (employeeId) {
          localStorage.setItem("employeeId", employeeId);
        }

        try {
          const res = await UserAxiosInstance.post<AuthMeResponse>("/auth/me", {}, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          });

          if (res.status === 200 && res.data?.user) {
            localStorage.setItem("user", JSON.stringify(res.data.user));
            useUserStore.getState().setUser(res.data.user);

            setTimeout(() => {
              window.location.replace("/dashboard");
            }, 100);
          }
        } catch (error) {
          console.error("Error during authentication:", error);
        }
      }
    };

    if (typeof window !== "undefined") {
      extractAndSaveToken();
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="bg-card rounded-xl shadow-lg p-8 flex flex-col items-center border border-border">
        <svg
          className="animate-spin h-8 w-8 text-primary mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        <h1 className="text-2xl font-bold text-primary mb-2">
          Azure Authentication Success
        </h1>
        <p className="text-muted-foreground mb-2">
          You are being redirected to your dashboard...
        </p>
        <p className="text-xs text-muted-foreground">
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