import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCoverLetter } from "@/actions/cover-letter";
import CoverLetterPreview from "../_components/cover-letter-preview";

export default async function EditCoverLetterPage({ params }) {
  const { id } = params;

  console.log("Fetching cover letter with ID:", id);

  const coverLetter = await getCoverLetter(id);

  console.log("Data received from database:", coverLetter);

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-2">
        <Link href="/ai-cover-letter">
          <Button variant="link" className="gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Cover Letters
          </Button>
        </Link>

        <h1 className="text-6xl font-bold gradient-title mb-6">
          {coverLetter?.jobTitle} at {coverLetter?.companyName}
        </h1>
      </div>

      {/* A message to show if no data is found */}
      {!coverLetter && (
        <p className="text-center text-muted-foreground">
          Could not find a cover letter with that ID.
        </p>
      )}

      <CoverLetterPreview content={coverLetter?.content} />
    </div>
  );
}