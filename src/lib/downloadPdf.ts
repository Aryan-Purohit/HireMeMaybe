'use client';

/**
 * Trigger a PDF download for the supplied résumé text.
 */
export async function downloadResumePDF(resumeText: string) {
  const res = await fetch('/api/download-resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tailoredResume: resumeText }),
  });

  if (!res.ok) throw new Error('PDF generation failed');

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tailored-resume.pdf';
  a.click();
  window.URL.revokeObjectURL(url);
}
