import { PDFDocument } from "pdf-lib";

export type PageSize = {
  width: number;
  height: number;
};

export async function addCanvasAsPaginatedPdf(
  pdf: PDFDocument,
  canvas: HTMLCanvasElement,
  pageSize: PageSize,
  options?: {
    margin?: number;
    background?: string;
  }
) {
  const margin = options?.margin ?? 36;
  const bg = options?.background;

  const pageW = pageSize.width;
  const pageH = pageSize.height;
  const contentW = pageW - margin * 2;
  const contentH = pageH - margin * 2;

  // Scale to fit width.
  const scale = contentW / canvas.width;
  const sliceHeightPx = Math.floor(contentH / scale);

  let y = 0;
  while (y < canvas.height) {
    const sliceH = Math.min(sliceHeightPx, canvas.height - y);

    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceH;

    const ctx = sliceCanvas.getContext("2d");
    if (!ctx) break;

    // Optional background (useful when the source has transparency)
    if (bg) {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
    }

    ctx.drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

    const dataUrl = sliceCanvas.toDataURL("image/png");
    const img = await pdf.embedPng(dataUrl);

    const page = pdf.addPage([pageW, pageH]);
    const drawW = contentW;
    const drawH = sliceH * scale;
    const x = margin;
    const drawY = pageH - margin - drawH;

    page.drawImage(img, { x, y: drawY, width: drawW, height: drawH });

    y += sliceH;
  }
}
