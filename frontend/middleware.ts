"use server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { cookies } from "next/headers";

export const config = {
  matcher: ["/"],
};

export function middleware(request: NextRequest) {
  const authToken = cookies().get("authToken")?.value;



  if (!authToken) {

    const loginUrl = new URL("/auth", request.url);
    return NextResponse.redirect(loginUrl);
  }



  return NextResponse.next();
}