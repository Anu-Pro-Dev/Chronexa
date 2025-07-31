import { NextResponse } from "next/server";
import { fetchWithLogging } from "@/lib/fetchWithLogging";

type ServerTimeResponse = {
  currentDate: string;
  currentTime: string;
  serverTime: string;
};

export async function GET() {
  try {
    const { status, body } = await fetchWithLogging(
      `${process.env.NEXT_PUBLIC_API_URL}/api/main/servertime`,
      {
        method: "GET",
        logLabel: "Server Time API",
      }
    );

    const timeData = body as ServerTimeResponse;

    if (!timeData.currentDate || !timeData.currentTime || !timeData.serverTime) {
      throw new Error("Invalid server time response");
    }

    return NextResponse.json(
      {
        currentDate: timeData.currentDate,
        currentTime: timeData.currentTime,
        serverTime: timeData.serverTime,
      },
      { status }
    );
  } catch (error: unknown) {
    let errorMessage = "Failed to fetch server time";

    try {
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: Response; message?: string };
        const errorData = await err.response?.json();
        errorMessage = errorData?.message || errorData?.error || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
    } catch {
      errorMessage = "Unknown error occurred.";
    }

    return NextResponse.json(
      { error: true, message: errorMessage },
      { status: 500 }
    );
  }
}
