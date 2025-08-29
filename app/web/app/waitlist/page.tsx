import { Waitlist } from "@clerk/nextjs";

import { Header } from "components/header";

export default function WaitlistPage() {
  return (
    <Header>
      <Waitlist signInUrl="/sign-in" />
    </Header>
  );
}
