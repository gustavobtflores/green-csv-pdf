import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Boleto } from "../entities/Boleto";

export async function generateBoletosReportAsBase64(boletos: Boleto[]): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  const fontSize = 10;

  let y = height - 50;

  page.drawText("Relatório de Boletos", {
    x: 50,
    y,
    size: 14,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  y -= 30;

  const headers = ["ID", "Nome Sacado", "ID Lote", "Valor", "Linha Digitável"];
  const headerPositions = [50, 100, 300, 350, 400];

  headers.forEach((text, i) => {
    page.drawText(text, {
      x: headerPositions[i],
      y,
      size: fontSize,
      font: fontBold,
    });
  });

  y -= 20;

  for (const boleto of boletos) {
    const row = [boleto.id.toString(), boleto.nome_sacado, boleto.lote?.id?.toString() ?? "-", boleto.valor.toString(), boleto.linha_digitavel];

    row.forEach((text, i) => {
      page.drawText(text, {
        x: headerPositions[i],
        y,
        size: fontSize,
        font,
      });
    });

    y -= 18;

    if (y < 50) {
      y = height - 50;
      page.setSize(width, height);
    }
  }

  const pdfBytes = await pdfDoc.save();
  const base64 = Buffer.from(pdfBytes).toString("base64");
  return base64;
}
