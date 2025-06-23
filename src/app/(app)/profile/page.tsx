
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/contexts/app-context";
import type { ChangeEvent } from 'react';
import { Save, UploadCloud } from "lucide-react";

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().optional().nullable(),
  address: z.object({
    street: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    zip: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
  }).optional().nullable(),
  linkedinUrl: z.string().url({ message: "Please enter a valid URL." }).optional().nullable(),
  githubUrl: z.string().url({ message: "Please enter a valid URL." }).optional().nullable(),
  portfolioUrl: z.string().url({ message: "Please enter a valid URL." }).optional().nullable(),
  resumeFileName: z.string().optional().nullable(),
  resumeContent: z.string().optional().nullable(),
  preferences: z.object({
    location: z.string().optional(),
    jobTitles: z.string().optional(),
  }),
  coverLetterTemplate: z.string().optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const { userProfile, updateUserProfile, isInitialized } = useAppContext();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: userProfile || {
      name: "",
      email: "",
      phone: null,
      address: null,
      linkedinUrl: null,
      githubUrl: null,
      portfolioUrl: null,
      resumeFileName: null,
      resumeContent: null,
      preferences: { location: "", jobTitles: "" },
      coverLetterTemplate: null,
    },
    values: userProfile || undefined, // Ensure form updates when context changes
  });

  const handleResumeUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        form.setValue("resumeContent", content);
        form.setValue("resumeFileName", file.name);
        toast({ title: "Resume Uploaded", description: file.name });
      };
      reader.readAsText(file);
    }
  };

  function onSubmit(data: ProfileFormValues) {
    updateUserProfile(data);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved.",
    });
  }

  if (!isInitialized) {
    return <div className="flex justify-center items-center h-full"><p>Loading profile...</p></div>;
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Profile Configuration</CardTitle>
          <CardDescription>
            Manage your personal information, resume, job preferences, and autofill data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john.doe@example.com" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="(123) 456-7890" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Card>
                <CardHeader><CardTitle className="text-lg">Address</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Anytown" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State / Province</FormLabel>
                          <FormControl>
                            <Input placeholder="CA" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address.zip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip / Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="90210" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="address.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="United States" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <FormField
                control={form.control}
                name="linkedinUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn Profile URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/in/yourprofile" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="githubUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub Profile URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/yourusername" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="portfolioUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://yourportfolio.com" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormItem>
                <FormLabel>Resume</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    <Button type="button" variant="outline" asChild>
                      <label htmlFor="resume-upload" className="cursor-pointer">
                        <UploadCloud className="mr-2 h-4 w-4" /> Upload Resume
                      </label>
                    </Button>
                    <input id="resume-upload" type="file" accept=".txt,.md,.pdf,.docx" className="hidden" onChange={handleResumeUpload} />
                    {form.watch("resumeFileName") && (
                      <span className="text-sm text-muted-foreground">{form.watch("resumeFileName")}</span>
                    )}
                  </div>
                </FormControl>
                <FormDescription>Upload your resume (TXT, MD, PDF, DOCX). PDF and DOCX will be text-extracted.</FormDescription>
                 <FormMessage />
              </FormItem>

              <FormField
                control={form.control}
                name="resumeContent"
                render={({ field }) => (
                  <FormItem className={field.value ? "" : "hidden"}>
                    <FormLabel>Resume Content (Preview)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Your resume content will appear here..." {...field} value={field.value ?? ""} rows={10} readOnly className="bg-muted/50"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferences.location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Location(s)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., San Francisco, CA; Remote" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>Enter comma-separated locations.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferences.jobTitles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Job Titles</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Software Engineer, Product Manager" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>Enter comma-separated job titles.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="coverLetterTemplate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Cover Letter Template</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Write or paste your generic cover letter template here. You can use placeholders like [Company Name] and [Job Title]." {...field} value={field.value ?? ""} rows={10} />
                    </FormControl>
                    <FormDescription>This template will be used as a base for tailoring.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
                <Save className="mr-2 h-4 w-4" /> Save Profile
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
