import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v2 as cloudinary } from "cloudinary";
import { AUTH_COOKIE_NAME, getStrapiUrl } from "@/lib/auth";

export async function POST(request) {
  try {
    const strapiUrl = getStrapiUrl();
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required to upload videos." },
        { status: 401 }
      );
    }

    // Verify user role with Strapi
    const meRes = await fetch(`${strapiUrl}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!meRes.ok) {
      return NextResponse.json(
        { error: "Failed to authenticate session." },
        { status: 401 }
      );
    }

    const user = await meRes.json();
    if (user.user_role === "student") {
      return NextResponse.json(
        { error: "Students are not permitted to upload lesson videos." },
        { status: 403 }
      );
    }

    // Cloudinary Credentials Check
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        {
          error:
            "Cloudinary credentials are missing. Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in environment variables.",
        },
        { status: 500 }
      );
    }

    // Configure Cloudinary SDK server-side
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    // Parse formData from request
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "No video file provided in upload request." },
        { status: 400 }
      );
    }

    // Convert File object to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Stream upload to Cloudinary as video
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: "skillpulse/lessons",
          allowed_formats: ["mp4", "mov", "webm", "avi", "mkv", "ogv"],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      duration: uploadResult.duration,
      format: uploadResult.format,
      original_filename: file.name,
    });
  } catch (err) {
    console.error("Cloudinary Video Upload Error:", err);
    return NextResponse.json(
      {
        error: "Failed to upload video to Cloudinary.",
        details: err.message || err,
      },
      { status: 500 }
    );
  }
}
