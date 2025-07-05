"use client";

import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export function GoogleAuthButton() {
  const [isLoading, setIsLoading] = useState(false);
  const storeTokens = useMutation(api.google.storeGoogleTokens);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, you would use Google OAuth2
      // For now, we'll simulate the process
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        throw new Error("Google Client ID not configured");
      }

      // Redirect to Google OAuth
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const scope = "https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.readonly";
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent`;

      window.location.href = authUrl;
    } catch (error) {
      console.error("Error initiating Google auth:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleGoogleAuth} 
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? "Connecting..." : "Connect Google Docs"}
    </Button>
  );
}