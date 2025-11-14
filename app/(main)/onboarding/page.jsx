import { industries } from "@/data/industries";
import { getUserOnboardingStatus } from "@/actions/user";
import OnboardingForm from "./_components/onboarding-form";
import { redirect } from "next/navigation";

const OnboardingPage = async () => {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (isOnboarded) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <div className="grid-background absolute inset-0 z-0"></div>
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <OnboardingForm industries={industries} />
      </div>
    </main>
  );
};

export default OnboardingPage;