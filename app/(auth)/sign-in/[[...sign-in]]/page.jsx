import { SignIn } from "@clerk/nextjs";

export default function Page() {
  // use the *new* prop name
  return <SignIn fallbackRedirectUrl="/dashboard" />;
}
