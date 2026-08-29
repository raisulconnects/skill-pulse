import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, getStrapiUrl } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const strapiUrl = getStrapiUrl();
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${strapiUrl}/api/blogs/${id}?populate[0]=author&populate[1]=cover_image`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch blog post.", details: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const strapiUrl = getStrapiUrl();
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required to edit blog post." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const res = await fetch(`${strapiUrl}/api/blogs/${id}`, {
      method: "PUT",
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
      { error: "Failed to update blog post.", details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const strapiUrl = getStrapiUrl();
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required to delete blog post." },
        { status: 401 }
      );
    }

    const res = await fetch(`${strapiUrl}/api/blogs/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete blog post.", details: err.message },
      { status: 500 }
    );
  }
}
