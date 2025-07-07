import { NextResponse } from 'next/server';
import { tailorResume, TailorResumeInput } from '../../../ai/flows/tailor-resume';

export async function POST(req: Request) {
  const input = (await req.json()) as TailorResumeInput;
  const output = await tailorResume(input);          // ← Genkit flow
  return NextResponse.json(output);                  // { tailoredResume, … }
}
