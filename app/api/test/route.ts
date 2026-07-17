import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json(
      {
        success: false,
        message: "unauthorized",
      },
      { status: 401 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: "authorized",
      user: session.user,
    },
    { status: 200 }
  );
}