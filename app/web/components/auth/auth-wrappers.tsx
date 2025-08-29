import { SignedIn, SignedOut } from "@clerk/nextjs";

export function Authenticated({ children }: { children: React.ReactNode }) {
  return <SignedIn>{children}</SignedIn>;
}

export function Unauthenticated({ children }: { children: React.ReactNode }) {
  return <SignedOut>{children}</SignedOut>;
}
