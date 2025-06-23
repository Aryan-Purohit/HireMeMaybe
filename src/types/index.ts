
export interface UserProfile {
  name: string;
  email: string;
  resumeFileName: string | null;
  resumeContent: string | null;
  phone?: string | null;
  address?: {
    street?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    country?: string | null;
  } | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  preferences: {
    location: string;
    jobTitles: string; // Comma-separated string
  };
  coverLetterTemplate: string | null;
}

// This type comes from the AI flow output
export interface JobPostingAi {
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  relevanceScore: number;
}

export interface JobPosting extends JobPostingAi {
  id: string; // Add an ID for client-side tracking
}

export type ApplicationStatus = 'Draft' | 'Applied' | 'Viewed' | 'Interviewing' | 'Offer' | 'Rejected' | 'Bookmarked';

export interface TrackedApplication {
  id: string; // unique id for the application entry
  job: JobPosting;
  appliedDate: string | null; // ISO string date
  status: ApplicationStatus;
  notes?: string;
  tailoredResume?: string;
  tailoredCoverLetter?: string;
}
