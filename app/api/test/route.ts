import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const GET = auth((req) => {
  if (!req.auth) {
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
      user: req.auth.user,
    },
    { status: 200 }
  );
});