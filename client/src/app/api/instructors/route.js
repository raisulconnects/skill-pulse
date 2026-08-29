import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, getStrapiUrl } from "@/lib/auth";

export async function GET() {
  try {
    const strapiUrl = getStrapiUrl();
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Query users with user_role = 'instructor'
    const res = await fetch(
      `${strapiUrl}/api/users?filters[user_role][$eq]=instructor&fields[0]=id&fields[1]=username&fields[2]=email&fields[3]=user_role`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch instructors.", details: err.message },
      { status: 500 }
    );
  }
}
