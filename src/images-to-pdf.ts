import { readFileSync } from 'node:fs';
import { jsPDF } from 'jspdf';
import { imageSize } from 'image-size';
import type { ISizeCalculationResult } from 'image-size/dist/types/interface';

export function imagesToPdf(filePaths: string[], filename: string): void {
  //   const doc = new jsPDF({
  //     orientation: 'portrait',
  //     unit: 'mm',
  //   });

  let doc: jsPDF | null = null;
  let dimensions: ISizeCalculationResult | undefined;

  filePaths.forEach((filePath, i) => {
    const buffer = readFileSync(filePath);
    const imageUint8Array = new Uint8Array(buffer);

    if (i === 0) {
      dimensions = imageSize(buffer);
      // eslint-disable-next-line new-cap -- s
      doc = new jsPDF({
        orientation: 'portrait',
        format: [dimensions.width ?? 0, dimensions.height ?? 0],
      });
    }

    if (i > 0) {
      doc?.addPage(
        [dimensions?.width ?? 0, dimensions?.height ?? 0],
        'portrait',
      );
    }

    doc?.addImage(
      imageUint8Array,
      'PNG',
      0,
      0,
      dimensions?.width ?? 0,
      dimensions?.height ?? 0,
    );
  });

  (doc as jsPDF | null)?.save(filename);
}
