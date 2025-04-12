import { Request, Response } from "express";
import { parse } from "csv-parse/sync";
import { boletoRepository } from "../repositories/BoletoRepository";
import { loteRepository } from "../repositories/LoteRepository";
import { loteMappingRepository } from "../repositories/LoteMappingRepository";

interface RegistroCSV {
  nome: string;
  valor: string;
  linha_digitavel: string;
  unidade: string;
}

class BoletosController {
  constructor() {}

  /* GET /boletos */
  async getAll(req: Request, res: Response) {
    const boletos = await boletoRepository.find({});

    res.send({ data: boletos });
  }

  /* POST /boletos/import/csv */
  async importWithCSV(req: Request, res: Response) {
    try {
      const fileBuffer = req.file?.buffer;

      if (!fileBuffer) {
        res.status(400).json({ erro: "Arquivo ausente" });
        return;
      }

      const content = fileBuffer.toString("utf-8");

      const registros: RegistroCSV[] = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        delimiter: ";",
      });

      const boletos = [];

      const results = { processed: 0, duplicated: [] as string[] };

      for (const boleto of registros) {
        results.processed++;

        const existingBoleto = await boletoRepository.findOne({
          where: { linha_digitavel: boleto.linha_digitavel },
        });

        if (existingBoleto) {
          results.duplicated.push(existingBoleto.linha_digitavel);
          continue;
        }

        const mappedLote = await loteMappingRepository.findOneByExternalId(boleto.unidade);

        const loteId: string = mappedLote?.lote.id.toString() || boleto.unidade.padStart(4, "0");

        const lote = await loteRepository.findOneByName(loteId);

        if (!lote) {
          throw new Error(`Lote com nome ${loteId} não encontrado`);
        }

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

      res.json({ results, boletos: insertedBoletos.raw });
    } catch (err) {
      console.error("Erro ao processar CSV", err);
      res.status(500).json({ erro: "Erro ao processar CSV", detalhes: err });
    }
  }
}

export default new BoletosController();
