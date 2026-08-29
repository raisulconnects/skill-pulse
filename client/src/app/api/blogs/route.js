import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, getStrapiUrl } from "@/lib/auth";

export async function GET(request) {
  try {
    const strapiUrl = getStrapiUrl();
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const strapiEndpoint = queryString
      ? `${strapiUrl}/api/blogs?${queryString}`
      : `${strapiUrl}/api/blogs`;

    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(strapiEndpoint, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch blog posts.", details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const strapiUrl = getStrapiUrl();
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required to create a blog post." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const res = await fetch(`${strapiUrl}/api/blogs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create blog post.", details: err.message },
      { status: 500 }
    );
  }
}
