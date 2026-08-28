import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME, getStrapiUrl } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { user: null, message: "Unauthenticated" },
        { status: 401 }
      );
    }

    // Call Strapi /api/users/me with Bearer token
    const strapiUrl = getStrapiUrl();
    const strapiResponse = await fetch(`${strapiUrl}/api/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!strapiResponse.ok) {
      // Token is invalid/expired - clear stale cookies
      cookieStore.delete(AUTH_COOKIE_NAME);
      cookieStore.delete(REFRESH_COOKIE_NAME);
      return NextResponse.json(
        { user: null, message: "Session expired or invalid" },
        { status: 401 }
      );
    }

    const user = await strapiResponse.json();

    return NextResponse.json(
      {
        user: {
          id: user.id,
          documentId: user.documentId,
          username: user.username,
          email: user.email,
          user_role: user.user_role || "student",
          confirmed: user.confirmed,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Auth Me Route Handler Error:", error);
    return NextResponse.json(
      { user: null, message: "Internal server error" },
      { status: 500 }
    );
  }
}
