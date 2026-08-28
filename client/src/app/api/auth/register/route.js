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
    const { username, email, password, role, user_role } = body || {};

    const selectedRole = user_role || role;

    // 1. Validate required fields
    if (!username || !email || !password || !selectedRole) {
      return NextResponse.json(
        { error: "Username, email, password, and role are required." },
        { status: 400 }
      );
    }

    // 2. Server-side role validation - strictly allow ONLY 'student' or 'instructor'
    const allowedRoles = ["student", "instructor"];
    if (!allowedRoles.includes(selectedRole)) {
      return NextResponse.json(
        {
          error: "Invalid role selected. Public registration is restricted to 'student' and 'instructor' only.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // 3. Forward registration to Strapi
    const strapiUrl = getStrapiUrl();
    const strapiResponse = await fetch(`${strapiUrl}/api/auth/local/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        user_role: selectedRole,
      }),
    });

    const data = await strapiResponse.json();

    if (!strapiResponse.ok) {
      const errorMessage =
        data?.error?.message ||
        data?.message ||
        "Registration failed. Please check your information.";
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

    // 4. Store tokens in secure HTTP-only cookies
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, jwt, COOKIE_OPTIONS);

    if (refreshToken) {
      cookieStore.set(REFRESH_COOKIE_NAME, refreshToken, COOKIE_OPTIONS);
    }

    // 5. Return safe user data to client (NO raw JWT or refreshToken returned)
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          documentId: user.documentId,
          username: user.username,
          email: user.email,
          user_role: user.user_role || selectedRole,
          confirmed: user.confirmed,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration Route Handler Error:", error);
    return NextResponse.json(
      { error: "An unexpected server error occurred during registration." },
      { status: 500 }
    );
  }
}
