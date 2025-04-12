import path from "path";
import { PDFDocument } from "pdf-lib";
import { boletoRepository } from "../repositories/BoletoRepository";
import pdf from "pdf-parse";
import fs from "fs";

class ImportPDFService {
  private async splitPdfInPages(fileBuffer: Buffer) {
    const pdfDoc = await PDFDocument.load(fileBuffer);

    let pages = [];

    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);

      newPdf.addPage(copiedPage);

      const pdfBytes = await newPdf.save();

      pages.push(pdfBytes);
    }

    return pages;
  }

  public async execute(fileBuffer: Buffer) {
    const pages = await this.splitPdfInPages(fileBuffer);
    const results = { processed_pages: 0, not_found: [] as string[] };

    for (const page of pages) {
      results.processed_pages++;
      const data = await pdf(page as Buffer);
      const name = data.text.trim();

      const boleto = await boletoRepository.findOneBy({ nome_sacado: name });

      if (!boleto) {
        results.not_found.push(name);
        continue;
      }

      if (!fs.existsSync(path.resolve(__dirname, "../../boletos"))) {
        fs.mkdirSync(path.resolve(__dirname, "../../boletos"), { recursive: true });
      }

      fs.writeFileSync(path.resolve(__dirname, "../../boletos", `${boleto.id}.pdf`), page);
    }

    return results;
  }
}

export default new ImportPDFService();
