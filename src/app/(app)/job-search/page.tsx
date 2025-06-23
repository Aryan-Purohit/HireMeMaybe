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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/contexts/app-context";
import { searchRelevantJobs, type SearchRelevantJobsInput, type SearchRelevantJobsOutput } from "@/ai/flows/search-relevant-jobs";
import type { JobPosting, JobPostingAi } from "@/types";
import React, { useState } from "react";
import { Briefcase, ExternalLink, Loader2, SearchIcon, Star } from "lucide-react";
import Link from "next/link";

const jobSearchFormSchema = z.object({
  jobBoard: z.enum(["Indeed", "LinkedIn"]),
  keywords: z.string().optional(),
});

type JobSearchFormValues = z.infer<typeof jobSearchFormSchema>;

export default function JobSearchPage() {
  const { toast } = useToast();
  const { userProfile, addTrackedApplication, isInitialized } = useAppContext();
  const [searchResults, setSearchResults] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<JobSearchFormValues>({
    resolver: zodResolver(jobSearchFormSchema),
    defaultValues: {
      jobBoard: "LinkedIn",
      keywords: "",
    },
  });

  async function onSubmit(data: JobSearchFormValues) {
    if (!userProfile || !userProfile.resumeContent) {
      toast({
        title: "Profile Incomplete",
        description: "Please upload your resume and complete your profile before searching for jobs.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSearchResults([]);

    const input: SearchRelevantJobsInput = {
      userProfile: `Resume: ${userProfile.resumeContent}\nPreferences: Location - ${userProfile.preferences.location}, Job Titles - ${userProfile.preferences.jobTitles}`,
      jobBoard: data.jobBoard,
      keywords: data.keywords,
    };

    try {
      const results: SearchRelevantJobsOutput = await searchRelevantJobs(input);
      const resultsWithIds: JobPosting[] = results.map(job => ({...job, id: crypto.randomUUID()}));
      setSearchResults(resultsWithIds);
      toast({
        title: "Search Complete",
        description: `Found ${results.length} potential jobs.`,
      });
    } catch (error) {
      console.error("Job search failed:", error);
      toast({
        title: "Search Failed",
        description: "An error occurred while searching for jobs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  if (!isInitialized) {
    return <div className="flex justify-center items-center h-full"><p>Loading job search...</p></div>;
  }

  const handleBookmarkJob = (job: JobPostingAi) => {
    const fullJob: JobPosting = {...job, id: job.id || crypto.randomUUID()};
    addTrackedApplication(fullJob, 'Bookmarked');
    toast({
        title: "Job Bookmarked",
        description: `${job.title} at ${job.company} has been added to your applications.`,
    });
  };


  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Automated Job Search</CardTitle>
          <CardDescription>
            Find relevant job postings based on your profile and preferences using AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="jobBoard"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Board</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a job board" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                          <SelectItem value="Indeed">Indeed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Keywords (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., React, Node.js, Remote" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <SearchIcon className="mr-2 h-4 w-4" />
                )}
                Search Jobs
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>Review the jobs found by the AI.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {searchResults.map((job, index) => (
                <AccordionItem value={`item-${index}`} key={job.id || index}>
                  <AccordionTrigger>
                    <div className="flex flex-col md:flex-row justify-between w-full pr-4">
                        <div className="text-left">
                            <h3 className="font-semibold">{job.title}</h3>
                            <p className="text-sm text-muted-foreground">{job.company} - {job.location}</p>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1 md:mt-0 md:text-right">
                            Relevance: {(job.relevanceScore * 100).toFixed(0)}%
                        </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <p className="text-sm whitespace-pre-line">{job.description.substring(0,500)}{job.description.length > 500 ? "..." : ""}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={job.url} target="_blank" rel="noopener noreferrer">
                          View Original <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="default" size="sm" onClick={() => handleBookmarkJob(job)} className="bg-primary hover:bg-primary/90">
                        <Star className="mr-2 h-4 w-4" /> Bookmark Job
                      </Button>
                       {/* Placeholder for "Easy Apply" if applicable. True auto-apply is complex. */}
                       <Button variant="secondary" size="sm" disabled>
                         <Briefcase className="mr-2 h-4 w-4" /> Simulate Apply (Coming Soon)
                       </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
