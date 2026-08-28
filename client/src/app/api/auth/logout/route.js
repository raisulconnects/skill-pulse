import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
    cookieStore.delete(REFRESH_COOKIE_NAME);

    return NextResponse.json(
      { success: true, message: "Logged out successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout Route Handler Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during logout." },
      { status: 500 }
    );
  }
}
