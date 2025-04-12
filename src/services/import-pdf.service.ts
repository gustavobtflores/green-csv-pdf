import path from "path";
import { PDFDocument } from "pdf-lib";
import { boletoRepository } from "../repositories/BoletoRepository";
import pdf from "pdf-parse";
import fs from "fs";

class ImportPDFService {
  public async execute(fileBuffer: Buffer) {
    async function splitPdf(fileBuffer: Buffer) {
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

    const pages = await splitPdf(fileBuffer);

    for (const page of pages) {
      const data = await pdf(page as Buffer);
      const name = data.text.trim();

      const boleto = await boletoRepository.findOneBy({ nome_sacado: name });

      if (!boleto) {
        continue;
      }

      if (!fs.existsSync(path.resolve(__dirname, "../../boletos"))) {
        fs.mkdirSync(path.resolve(__dirname, "../../boletos"), { recursive: true });
      }

      fs.writeFileSync(path.resolve(__dirname, "../../boletos", `${boleto.id}.pdf`), page);
    }
  }
}

export default new ImportPDFService();
