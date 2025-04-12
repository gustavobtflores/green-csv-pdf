import { Request, Response } from "express";
import { boletoRepository } from "../repositories/BoletoRepository";
import { generateBoletosReportAsBase64 } from "../services/pdf-report.service";
import importPdfService from "../services/import-pdf.service";
import importCsvService from "../services/import-csv.service";

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
    try {
      const fileBuffer = req.file?.buffer;

      if (!fileBuffer) {
        res.status(400).json({ error: "Arquivo ausente" });
        return;
      }

      const results = await importCsvService.execute(fileBuffer);

      res.status(201).json(results);
    } catch (err) {
      console.error("Erro ao processar CSV", err);
      res.status(500).json({ error: "Erro ao processar CSV", details: err });
    }
  }

  /* POST /boletos/import/pdf */
  async importWithPDF(req: Request, res: Response) {
    try {
      const fileBuffer = req.file?.buffer;

      if (!fileBuffer) {
        res.status(400).json({ error: "Arquivo ausente" });
        return;
      }

      await importPdfService.execute(fileBuffer);

      res.status(201).json({ message: "Boletos salvos com sucesso" });
    } catch (err) {
      console.error("Erro ao processar PDF", err);
      res.status(500).json({ error: "Erro ao processar PDF", details: err });
    }
  }
}

export default new BoletosController();
