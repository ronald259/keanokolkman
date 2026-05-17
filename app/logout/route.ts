import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export async function POST() {
  await clearSession();
  return NextResponse.redirect(new URL("/login", "http://placeholder"), 303);
}

export async function GET(request: Request) {
  await clearSession();
  return NextResponse.redirect(new URL("/login", request.url), 303);
}
