"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeTokens = useMutation(api.google.storeGoogleTokens);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        setError("Authorization was denied or failed");
        return;
      }

      if (!code) {
        setError("No authorization code received");
        return;
      }

      try {
        // Exchange code for tokens
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        const clientSecret = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET;
        const redirectUri = `${window.location.origin}/auth/google/callback`;

        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: clientId!,
            client_secret: clientSecret!,
            code,
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error("Failed to exchange code for tokens");
        }

        const tokens = await tokenResponse.json();

        // Store tokens in Convex
        await storeTokens({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: Date.now() + (tokens.expires_in * 1000),
        });

        // Redirect to main app
        router.push("/");
      } catch (err) {
        console.error("Error handling Google callback:", err);
        setError("Failed to complete authorization");
      }
    };

    handleCallback();
  }, [searchParams, storeTokens, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-600">Authorization Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="text-blue-600 hover:underline"
            >
              Return to Home
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Connecting to Google</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            Please wait while we complete the authorization...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}