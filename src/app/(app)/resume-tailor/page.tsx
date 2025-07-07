"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/contexts/app-context";
import {
  tailorResume,
  type TailorResumeInput,
  type TailorResumeOutput,
} from "@/ai/flows/tailor-resume";
import React, { useState, useEffect } from "react";
import { Wand2, Loader2, Copy, FileText } from "lucide-react"; // ← added FileText
import { downloadResumePDF } from "@/lib/downloadPdf";        // ← NEW helper

const resumeTailorFormSchema = z.object({
  resume: z.string().min(50, { message: "Resume content is too short." }),
  jobDescription: z
    .string()
    .min(50, { message: "Job description is too short." }),
  coverLetter: z.string().optional(),
  jobTitle: z.string().optional(),
});

type ResumeTailorFormValues = z.infer<typeof resumeTailorFormSchema>;

export default function ResumeTailorPage() {
  const { toast } = useToast();
  const { userProfile, isInitialized } = useAppContext();
  const [tailoredResult, setTailoredResult] =
    useState<TailorResumeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [downloading, setDownloading] = useState(false); // ← NEW state

  const form = useForm<ResumeTailorFormValues>({
    resolver: zodResolver(resumeTailorFormSchema),
    defaultValues: {
      resume: userProfile?.resumeContent || "",
      jobDescription: "",
      coverLetter: userProfile?.coverLetterTemplate || "",
      jobTitle: "",
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        resume: userProfile.resumeContent || "",
        jobDescription: form.getValues("jobDescription") || "",
        coverLetter:
          userProfile.coverLetterTemplate ||
          form.getValues("coverLetter") ||
          "",
        jobTitle: form.getValues("jobTitle") || "",
      });
    }
  }, [userProfile, form]);

  async function onSubmit(data: ResumeTailorFormValues) {
    setIsLoading(true);
    setTailoredResult(null);

    const input: TailorResumeInput = {
      resume: data.resume,
      jobDescription: data.jobDescription,
      coverLetter: data.coverLetter || undefined,
      jobTitle: data.jobTitle || undefined,
    };

    try {
      const result = await tailorResume(input);
      setTailoredResult(result);
      toast({
        title: "Resume Tailored",
        description:
          "Your resume and cover letter have been tailored successfully.",
      });
    } catch (error) {
      console.error("Resume tailoring failed:", error);
      toast({
        title: "Tailoring Failed",
        description:
          "An error occurred while tailoring your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!isInitialized && !userProfile) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Loading resume tailor...</p>
      </div>
    );
  }

  const copyToClipboard = (text: string | undefined, fieldName: string) => {
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast({
          title: `${fieldName} Copied`,
          description: `${fieldName} has been copied to your clipboard.`,
        });
      })
      .catch((err) => {
        toast({
          title: `Copy Failed`,
          description: `Could not copy ${fieldName}.`,
          variant: "destructive",
        });
        console.error("Failed to copy: ", err);
      });
  };

  return (
    <div className="container mx-auto py-8">
      {/* ---------------- Form card ---------------- */}
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">AI Resume Tailor</CardTitle>
          <CardDescription>
            Customize your resume and cover letter to match specific job
            descriptions using AI. Your current resume and cover letter template
            from your profile are pre-filled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* resume textarea */}
              <FormField
                control={form.control}
                name="resume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Resume</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your resume here or it will be pre-filled from your profile."
                        {...field}
                        rows={15}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* job description textarea */}
              <FormField
                control={form.control}
                name="jobDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste the job description here."
                        {...field}
                        rows={15}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* cover letter */}
              <FormField
                control={form.control}
                name="coverLetter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Cover Letter (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your cover letter here or use the template from your profile."
                        {...field}
                        rows={10}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* job title */}
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Senior Software Engineer"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Tailor Resume & Cover Letter
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* ---------------- Result cards ---------------- */}
      {tailoredResult && (
        <div className="space-y-8">
          {/* -------- Résumé -------- */}
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tailored Resume</CardTitle>
                <CardDescription>
                  Review, copy, or download your AI-tailored resume.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {/* copy */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    copyToClipboard(tailoredResult.tailoredResume, "Tailored Resume")
                  }
                >
                  <Copy className="h-5 w-5" />
                </Button>
                {/* download */}
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={downloading}
                  onClick={async () => {
                    try {
                      setDownloading(true);
                      await downloadResumePDF(tailoredResult.tailoredResume);
                    } finally {
                      setDownloading(false);
                    }
                  }}
                >
                  {downloading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={tailoredResult.tailoredResume}
                readOnly
                rows={20}
                className="bg-muted/50"
              />
            </CardContent>
          </Card>

          {/* -------- Cover letter (optional) -------- */}
          {tailoredResult.tailoredCoverLetter && (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Tailored Cover Letter</CardTitle>
                  <CardDescription>
                    Review, copy, or download your AI-tailored cover letter.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {/* copy */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      copyToClipboard(
                        tailoredResult.tailoredCoverLetter,
                        "Tailored Cover Letter"
                      )
                    }
                  >
                    <Copy className="h-5 w-5" />
                  </Button>
                  {/* download */}
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={downloading}
                    onClick={async () => {
                      try {
                        setDownloading(true);
                        await downloadResumePDF(
                          tailoredResult.tailoredCoverLetter!
                        );
                      } finally {
                        setDownloading(false);
                      }
                    }}
                  >
                    {downloading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={tailoredResult.tailoredCoverLetter}
                  readOnly
                  rows={15}
                  className="bg-muted/50"
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
