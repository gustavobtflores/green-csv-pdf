import { Request, Response } from "express";
import { parse } from "csv-parse/sync";
import { boletoRepository } from "../repositories/BoletoRepository";
import { loteRepository } from "../repositories/LoteRepository";
import { loteMappingRepository } from "../repositories/LoteMappingRepository";
import { PDFDocument } from "pdf-lib";
import pdf from "pdf-parse";
import fs from "fs";
import path from "path";
import { generateBoletosReportAsBase64 } from "../services/pdf-report.service";

interface Registro {
  nome: string;
  valor: string;
  linha_digitavel: string;
  unidade: string;
}

class BoletosController {
  constructor() {}

  /* GET /boletos */
  async getAll(req: Request, res: Response) {
    try {
      const { nome, valor_inicial, valor_final, id_lote, relatorio } = req.query;

      const queryBuilder = boletoRepository.createQueryBuilder("boleto").leftJoinAndSelect("boleto.lote", "lote");

      if (nome) {
        queryBuilder.andWhere("boleto.nome_sacado ILIKE :nome", { nome: `%${nome}%` });
      }

      if (valor_inicial) {
        queryBuilder.andWhere("boleto.valor >= :min", { min: parseFloat(valor_inicial as string) });
      }

      if (valor_final) {
        queryBuilder.andWhere("boleto.valor <= :max", { max: parseFloat(valor_final as string) });
      }

      if (id_lote) {
        queryBuilder.andWhere("lote.id = :loteId", { loteId: id_lote });
      }

      const boletos = await queryBuilder.getMany();

      if (relatorio === "1") {
        const base64 = await generateBoletosReportAsBase64(boletos);
        res.status(200).json({ base64 });
        return;
      }

      res.json({ data: boletos });
    } catch (error) {
      console.error("Erro ao buscar boletos", error);
      res.status(500).json({ error: "Erro ao buscar boletos", details: error });
    }
  }

  /* POST /boletos/import/csv */
  async importWithCSV(req: Request, res: Response) {
    function parseCSV(fileBuffer: Buffer) {
      const content = fileBuffer.toString("utf-8");

      const registros: Registro[] = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        delimiter: ";",
      });

      return registros;
    }

    try {
      const fileBuffer = req.file?.buffer;

      if (!fileBuffer) {
        res.status(400).json({ error: "Arquivo ausente" });
        return;
      }

      const registros = parseCSV(fileBuffer);

      const boletos = [];

      const results = { processed: 0, duplicated: [] as string[] };

      for (const boleto of registros) {
        results.processed++;

        const mappedLote = await loteMappingRepository.findOneByExternalId(boleto.unidade);

        const loteId: string = mappedLote?.lote.nome.toString() || boleto.unidade.padStart(4, "0");

        const lote = await loteRepository.findOneByName(loteId);

        const existingBoleto = await boletoRepository.existsBy({
          nome_sacado: boleto.nome,
          linha_digitavel: boleto.linha_digitavel,
        });

        if (existingBoleto) {
          results.duplicated.push(boleto.linha_digitavel);
          continue;
        }

        if (!lote) {
          throw new Error(`Lote com nome ${loteId} não encontrado`);
        }

        if (!mappedLote)
          await loteMappingRepository.save({
            id_externo: boleto.unidade,
            lote,
          });

        boletos.push({
          nome_sacado: boleto.nome,
          valor: parseFloat(boleto.valor),
          linha_digitavel: boleto.linha_digitavel,
          ativo: true,
          lote,
        });
      }

      const insertedBoletos = await boletoRepository.insert(boletos);

      res.status(201).json({ results, boletos: insertedBoletos.raw });
    } catch (err) {
      console.error("Erro ao processar CSV", err);
      res.status(500).json({ error: "Erro ao processar CSV", details: err });
    }
  }

  /* POST /boletos/import/pdf */
  async importWithPDF(req: Request, res: Response) {
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

    try {
      const fileBuffer = req.file?.buffer;

      if (!fileBuffer) {
        res.status(400).json({ error: "Arquivo ausente" });
        return;
      }

      const pages = await splitPdf(fileBuffer);

      for (const page of pages) {
        const data = await pdf(page as Buffer);
        const name = data.text.trim();

        const boleto = await boletoRepository.findOneBy({ nome_sacado: name });

        if (!boleto) {
          continue;
        }

        fs.writeFileSync(path.resolve(__dirname, "../../boletos", `${boleto.id}.pdf`), page);
      }

      res.status(201).json({ message: "Boletos salvos com sucesso" });
    } catch (err) {
      console.error("Erro ao processar PDF", err);
      res.status(500).json({ error: "Erro ao processar PDF", details: err });
    }
  }
}

export default new BoletosController();
