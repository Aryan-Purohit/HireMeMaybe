
"use client";

import { BarChart, CheckCircle, Clock, FileText, Search, Target, UserCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAppContext } from "@/contexts/app-context";
import Image from "next/image";

export default function DashboardPage() {
  const { trackedApplications, userProfile, isInitialized } = useAppContext();

  if (!isInitialized) {
    return <div className="flex justify-center items-center h-full"><p>Loading dashboard...</p></div>;
  }

  const applicationsCount = trackedApplications.length;
  const appliedCount = trackedApplications.filter(app => app.status === 'Applied').length;
  const interviewingCount = trackedApplications.filter(app => app.status === 'Interviewing').length;

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome, {userProfile?.name || "User"}!</h1>
        <p className="text-muted-foreground">Here's an overview of your job application progress.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Target className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicationsCount}</div>
            <p className="text-xs text-muted-foreground">jobs you're tracking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actively Applied</CardTitle>
            <CheckCircle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appliedCount}</div>
            <p className="text-xs text-muted-foreground">applications submitted</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviewingCount}</div>
            <p className="text-xs text-muted-foreground">interviews scheduled or completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started or continue your job hunt.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-between space-y-4">
            <div className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/profile"><UserCircle className="mr-2 h-5 w-5" /> Update Your Profile</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/job-search"><Search className="mr-2 h-5 w-5" /> Find New Jobs</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/resume-tailor"><FileText className="mr-2 h-5 w-5" /> Tailor Your Resume</Link>
                </Button>
            </div>
            <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/applications"><BarChart className="mr-2 h-5 w-5" /> View All Applications</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Application Funnel</CardTitle>
            <CardDescription>Visualize your application stages.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            {/* Placeholder for a chart or visualization */}
            <div className="text-center text-muted-foreground">
              <Image src="https://placehold.co/300x200.png" alt="Application Funnel Placeholder" width={300} height={200} data-ai-hint="data chart graph" className="rounded-md" />
              <p className="mt-2 text-sm">Application funnel chart coming soon.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
