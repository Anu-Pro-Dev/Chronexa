import { NextRequest, NextResponse } from "next/server";
import { fetchWithLogging } from "@/lib/fetchWithLogging";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const { status, body } = await fetchWithLogging(
      `${process.env.NEXT_PUBLIC_API_URL}/api/main/punchin`,
      {
        method: "POST",
        body: formData,
        logLabel: "Punch-in/out API",
      }
    );

    // Forward backend response and status
    return NextResponse.json(body, { status });

  } catch (error: unknown) {
    let errorMessage = "Punch-in failed";

    try {
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: Response; message?: string };
        const errorData = await err.response?.json();
        errorMessage = errorData?.message || errorData?.error || "Unknown error";
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
