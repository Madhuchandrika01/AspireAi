"use client"; // This page now manages state

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterGenerator from "../_components/cover-letter-generator";
import ResumeInputStep from "../_components/resume-input-step";

export default function NewCoverLetterPage() {
  const [step, setStep] = useState(1);
  const [resumeContent, setResumeContent] = useState("");

  const handleResumeSubmit = (content) => {
    setResumeContent(content);
    setStep(2); // Move to the next step
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-2">
        <Link href="/ai-cover-letter">
          <Button variant="link" className="gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Cover Letters
          </Button>
        </Link>

        <div className="pb-6">
          <h1 className="text-6xl font-bold gradient-title">
            Create Cover Letter
          </h1>
          <p className="text-muted-foreground">
            Generate a tailored cover letter for your job application
          </p>
        </div>
      </div>

      {/* Conditionally render the current step */}
      {step === 1 && <ResumeInputStep onNext={handleResumeSubmit} />}
      {step === 2 && <CoverLetterGenerator resumeContent={resumeContent} />}
    </div>
  );
}