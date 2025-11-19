import "./globals.css";

import type { Metadata } from "next";
import localFont from "next/font/local";

import { ConvexServer } from "components/providers/convex-server";
import { ConvexClient } from "components/providers/convex-client";
import { Themes } from "components/providers/themes";
import { Redirect } from "components/auth/auth-redirect";

const switzer = localFont({
  src: [
    {
      path: "./fonts/Switzer-Variable.woff2",
      style: "normal",
    },
    {
      path: "./fonts/Switzer-VariableItalic.woff2",
      style: "italic",
    },
  ],
  variable: "--font-switzer",
  display: "swap",
  preload: true,
});
const sentient = localFont({
  src: [
    {
      path: "./fonts/Sentient-Variable.woff2",
      style: "normal",
    },
    {
      path: "./fonts/Sentient-VariableItalic.woff2",
      style: "italic",
    },
  ],
  variable: "--font-sentient",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Wright",
  description: "Wright is a document editor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sentient.variable} ${switzer.variable} antialiased`}>
        <ConvexServer>
          <ConvexClient>
            <Themes>
              {children}
              {/* Uncomment this when in production */}
              {/* <Redirect /> */}
            </Themes>
          </ConvexClient>
        </ConvexServer>
      </body>
    </html>
  );
}
