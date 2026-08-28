import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME, COOKIE_OPTIONS, getStrapiUrl } from "@/lib/auth";

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body." },
        { status: 400 }
      );
    }
    const { identifier, password } = body || {};

    // 1. Validate required fields
    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Email or username and password are required." },
        { status: 400 }
      );
    }

    // 2. Forward login request to Strapi
    const strapiUrl = getStrapiUrl();
    const strapiResponse = await fetch(`${strapiUrl}/api/auth/local`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: identifier.trim(),
        password,
      }),
    });

    const data = await strapiResponse.json();

    if (!strapiResponse.ok) {
      const errorMessage =
        data?.error?.message ||
        data?.message ||
        "Invalid email/username or password.";
      return NextResponse.json(
        { error: errorMessage },
        { status: strapiResponse.status || 400 }
      );
    }

    const { jwt, refreshToken, user } = data;

    if (!jwt || !user) {
      return NextResponse.json(
        { error: "Invalid response from authentication server." },
        { status: 500 }
      );
    }

    // 3. Store tokens in secure HTTP-only cookies
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, jwt, COOKIE_OPTIONS);

    if (refreshToken) {
      cookieStore.set(REFRESH_COOKIE_NAME, refreshToken, COOKIE_OPTIONS);
    }

    // 4. Return safe user data to client (NO raw JWT or refreshToken returned)
    return NextResponse.json(
      {
        success: true,
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
    console.error("Login Route Handler Error:", error);
    return NextResponse.json(
      { error: "An unexpected server error occurred during login." },
      { status: 500 }
    );
  }
}
