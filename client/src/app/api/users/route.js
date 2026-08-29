import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, getStrapiUrl } from "@/lib/auth";

export async function GET(request) {
  try {
    const strapiUrl = getStrapiUrl();
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required to access platform users." },
        { status: 401 }
      );
    }

    // Forward ALL query parameters from the frontend to Strapi
    // e.g. ?page=1&pageSize=10&search=john&role=student
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const strapiEndpoint = queryString
      ? `${strapiUrl}/api/users?${queryString}`
      : `${strapiUrl}/api/users`;

    const res = await fetch(strapiEndpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch platform users.", details: err.message },
      { status: 500 }
    );
  }
}
