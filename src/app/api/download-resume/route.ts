// src/app/api/download-resume/route.ts
export const runtime = 'nodejs';

import { PDFDocument, StandardFonts } from 'pdf-lib';

interface ReqBody { tailoredResume: string }

export async function POST(req: Request) {
  try {
    const { tailoredResume } = (await req.json()) as ReqBody;

    const pdfDoc  = await PDFDocument.create();
    const page    = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font    = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const fontSize = 12;
    const margin   = 40;

    /* ─── NEW ─── */
    // Replace the Unicode bullet (•) with a plain dash and strip any
    // character outside the 0-255 (WinAnsi) range that TimesRoman supports.
    const safe = tailoredResume
      .replace(/\u2022/g, '- ')        // bullet → dash-space
      .replace(/[^\u0000-\u00FF]/g, ''); // drop other unsupported chars

    /* drawText with maxWidth + lineHeight automatically wraps */
    page.drawText(safe, {
      x: margin,
      y: height - margin,
      size: fontSize,
      font,
      maxWidth: width - margin * 2,
      lineHeight: fontSize + 2,
    });

    const pdfBytes = await pdfDoc.save();

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="tailored-resume.pdf"',
      },
    });
  } catch (err) {
    console.error('❌ /api/download-resume error:', err);
    return new Response('PDF generation failed', { status: 500 });
  }
}
