'use server';

/**
 * @fileOverview Automatically searches for relevant job postings on job boards.
 *
 * - searchRelevantJobs - A function that handles the job search process.
 * - SearchRelevantJobsInput - The input type for the searchRelevantJobs function.
 * - SearchRelevantJobsOutput - The return type for the searchRelevantJobs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SearchRelevantJobsInputSchema = z.object({
  userProfile: z
    .string()
    .describe("The user's profile, including resume and job preferences."),
  jobBoard: z.enum(['Indeed', 'LinkedIn']).describe('The job board to search on.'),
  keywords: z.string().optional().describe('Keywords to refine the search.'),
});
export type SearchRelevantJobsInput = z.infer<typeof SearchRelevantJobsInputSchema>;

const JobPostingSchema = z.object({
  title: z.string().describe('The title of the job posting.'),
  company: z.string().describe('The company offering the job.'),
  location: z.string().describe('The location of the job.'),
  url: z.string().url().describe('The URL of the job posting.'),
  description: z.string().describe('The description of the job posting.'),
  relevanceScore: z.number().describe('A numerical score indicating how relevant the job is to the user profile'),
});

const SearchRelevantJobsOutputSchema = z.array(JobPostingSchema).describe('A list of relevant job postings.');
export type SearchRelevantJobsOutput = z.infer<typeof SearchRelevantJobsOutputSchema>;

export async function searchRelevantJobs(
  input: SearchRelevantJobsInput
): Promise<SearchRelevantJobsOutput> {
  return searchRelevantJobsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'searchRelevantJobsPrompt',
  input: {schema: SearchRelevantJobsInputSchema},
  output: {schema: SearchRelevantJobsOutputSchema},
  prompt: `You are an AI job search assistant. Your task is to find relevant job postings on various job boards based on a user's profile and preferences.

  User Profile: {{{userProfile}}}
  Job Board: {{{jobBoard}}}
  Keywords: {{{keywords}}}

  Return a JSON array of job postings, each with the following fields:
  - title: The title of the job posting.
  - company: The company offering the job.
  - location: The location of the job.
  - url: The URL of the job posting.
  - description: The description of the job posting.
  - relevanceScore: A numerical score indicating how relevant the job is to the user profile.  This should be a number between 0 and 1, with 1 being a perfect match.

  Ensure that the output is a valid JSON array.`,
});

const searchRelevantJobsFlow = ai.defineFlow(
  {
    name: 'searchRelevantJobsFlow',
    inputSchema: SearchRelevantJobsInputSchema,
    outputSchema: SearchRelevantJobsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
