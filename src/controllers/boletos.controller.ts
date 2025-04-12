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
    function parseCSV(fileBuffer: Buffer) {
      const content = fileBuffer.toString("utf-8");

      const registros: RegistroCSV[] = parse(content, {
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

        const existingBoleto = await boletoRepository.existsBy({
          linha_digitavel: boleto.linha_digitavel,
        });

        if (existingBoleto) {
          results.duplicated.push(boleto.linha_digitavel);
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

      res.status(201).json({ results, boletos: insertedBoletos.raw });
    } catch (err) {
      console.error("Erro ao processar CSV", err);
      res.status(500).json({ error: "Erro ao processar CSV", details: err });
    }
  }
}

export default new BoletosController();
