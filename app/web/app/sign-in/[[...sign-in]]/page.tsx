"use client";

import { useSearchParams } from "next/navigation";

import { SignIn } from "@clerk/nextjs";

import { Header } from "components/header";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/";

  return (
    <Header>
      <SignIn waitlistUrl="/waitlist" forceRedirectUrl={redirectUrl} />
    </Header>
  );
}
