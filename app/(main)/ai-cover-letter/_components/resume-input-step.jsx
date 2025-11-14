"use client";

import { useState } from "react";
import mammoth from "mammoth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export default function ResumeInputStep({ onNext }) {
  const [pastedResume, setPastedResume] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    toast.info("Processing your résumé...");

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        let textContent = "";
        const arrayBuffer = e.target.result;
        const name = (file.name || "").toLowerCase();
        const type = file.type || "";

        // --- PDF ---
        if (type === "application/pdf" || name.endsWith(".pdf")) {
          const pdfjsLib = await import("pdfjs-dist");
          
          pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

          const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
          let text = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const pageText = await page.getTextContent();
            text += pageText.items.map((item) => item.str).join(" ") + "\n";
          }
          textContent = text.trim();
        }
        // --- DOCX ---
        else if (
          type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          name.endsWith(".docx")
        ) {
          const result = await mammoth.extractRawText({ arrayBuffer });
          textContent = (result.value || "").trim();
        }
        // --- TXT ---
        else if (type === "text/plain" || name.endsWith(".txt")) {
          const decoder = new TextDecoder("utf-8");
          textContent = decoder.decode(new Uint8Array(arrayBuffer)).trim();
        }
        // --- Unsupported ---
        else {
          toast.error("Unsupported file type. Please use PDF, DOCX, or TXT.");
          setIsLoading(false);
          return;
        }

        if (textContent) {
          toast.success("Résumé processed successfully!");
          onNext(textContent);
        } else {
          toast.error("Could not extract text from the file.");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to process the file.");
      } finally {
        setIsLoading(false);
      }
    };

    
    reader.readAsArrayBuffer(file);
  };

  const handlePasteContinue = () => {
    if (!pastedResume.trim()) {
      toast.error("Please paste your résumé content first.");
      return;
    }
    onNext(pastedResume);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 1: Add Your Résumé</CardTitle>
        <CardDescription>
          Provide your résumé so the AI can tailor the cover letter to your experience.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Résumé</TabsTrigger>
            <TabsTrigger value="paste">Paste Content</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
              <p className="mb-2 text-sm text-muted-foreground">
                Accepted file formats: PDF, DOCX, TXT
              </p>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              <Button asChild variant="outline" disabled={isLoading}>
                <label htmlFor="file-upload">{isLoading ? "Processing..." : "Upload File"}</label>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="paste" className="mt-4 space-y-4">
            <Textarea
              className="h-48"
              placeholder="Paste the plain text of your résumé here..."
              value={pastedResume}
              onChange={(e) => setPastedResume(e.target.value)}
            />
            <Button onClick={handlePasteContinue} className="w-full">
              Continue
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
