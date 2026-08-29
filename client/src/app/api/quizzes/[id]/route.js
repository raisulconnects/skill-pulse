import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, getStrapiUrl } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const strapiUrl = getStrapiUrl();
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const targetUrl = `${strapiUrl}/api/quizzes/${id}${queryString ? `?${queryString}` : ""}`;

    const res = await fetch(targetUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch quiz.", details: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const strapiUrl = getStrapiUrl();
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json();

    const res = await fetch(`${strapiUrl}/api/quizzes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update quiz.", details: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const strapiUrl = getStrapiUrl();
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const res = await fetch(`${strapiUrl}/api/quizzes/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });

    if (res.status === 204) {
      return NextResponse.json({ success: true });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete quiz.", details: err.message }, { status: 500 });
  }
}
