"use client";

import { useEffect } from "react";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export const waitlistUrl = "/waitlist";
export const signInUrl = "/sign-in";

export function Redirect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirectUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const auth = useAuth();
  const isSignedIn = auth.isSignedIn;

  const handleMount = () => {
    if (
      isSignedIn === false &&
      pathname !== waitlistUrl &&
      pathname !== signInUrl
    ) {
      router.push(`${waitlistUrl}?redirect_url=${redirectUrl}`);
    }
  };
  useEffect(handleMount, [isSignedIn, redirectUrl, pathname, router]);

  return null;
}
