// src/ai/flows/tailor-resume.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for tailoring a resume and cover letter to match a specific job description.
 *
 * - tailorResume - A function that tailors the resume and cover letter based on the job description.
 * - TailorResumeInput - The input type for the tailorResume function.
 * - TailorResumeOutput - The return type for the tailorResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TailorResumeInputSchema = z.object({
  resume: z
    .string()
    .describe('The user provided resume.'),
  jobDescription: z.string().describe('The job description to tailor the resume and cover letter to.'),
  coverLetter: z.string().optional().describe('The user provided cover letter.'),
  jobTitle: z.string().optional().describe('The job title to tailor the resume and cover letter to.'),
});

export type TailorResumeInput = z.infer<typeof TailorResumeInputSchema>;

const TailorResumeOutputSchema = z.object({
  tailoredResume: z.string().describe('The tailored resume.'),
  tailoredCoverLetter: z.string().optional().describe('The tailored cover letter.'),
});

export type TailorResumeOutput = z.infer<typeof TailorResumeOutputSchema>;

export async function tailorResume(input: TailorResumeInput): Promise<TailorResumeOutput> {
  return tailorResumeFlow(input);
}

const tailorResumePrompt = ai.definePrompt({
  name: 'tailorResumePrompt',
  input: {schema: TailorResumeInputSchema},
  output: {schema: TailorResumeOutputSchema},
  prompt: `You are an expert resume and cover letter tailoring assistant.

  You will tailor the provided resume and cover letter to match the specific requirements and keywords of the job description.
  If the user does not provide the cover letter, you will skip tailoring the cover letter.

  Here is the resume:
  {{{resume}}}

  Here is the job description:
  {{{jobDescription}}}

  Here is the existing cover letter (if applicable):
  {{{coverLetter}}}

  Here is the job title (if applicable):
  {{{jobTitle}}}

  Please provide the tailored resume and cover letter.
  `,
});

const tailorResumeFlow = ai.defineFlow(
  {
    name: 'tailorResumeFlow',
    inputSchema: TailorResumeInputSchema,
    outputSchema: TailorResumeOutputSchema,
  },
  async input => {
    const {output} = await tailorResumePrompt(input);
    return output!;
  }
);
