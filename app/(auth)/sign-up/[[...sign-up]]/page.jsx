import { SignUp } from "@clerk/nextjs";

export default function Page() {
  // use the *new* prop name
  return <SignUp fallbackRedirectUrl="/onboarding" />;
}
