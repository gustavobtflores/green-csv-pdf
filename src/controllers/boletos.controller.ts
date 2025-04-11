import { Request, Response } from "express";
import { parse } from "csv-parse/sync";
import { getDataSource } from "../database";
import { Boleto } from "../entities/Boleto";
import { Lote } from "../entities/Lote";
import { LoteMapping } from "../entities/LoteMapping";

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
    const db = await getDataSource();

    const boletos = await db.getRepository(Boleto).find();

    res.send({ data: boletos });
  }

  /* POST /boletos/import/csv */
  async importWithCSV(req: Request, res: Response) {
    try {
      const db = await getDataSource();

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

      for (const boleto of registros) {
        const mappedLote = await db.getRepository(LoteMapping).findOne({
          where: { id_externo: boleto.unidade },
        });

        const loteId: string = mappedLote?.lote.id.toString() || boleto.unidade.padStart(4, "0");

        const lote = await db.getRepository(Lote).findOne({ where: { nome: loteId } });

        if (!lote) {
          throw new Error(`Lote com nome ${loteId} não encontrado`);
        }

        await db.getRepository(LoteMapping).save({
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

      const insertedBoletos = await db.createQueryBuilder().insert().into(Boleto).values(boletos).execute();

      res.json({ insertedBoletos });
    } catch (err) {
      res.status(500).json({ erro: "Erro ao processar CSV", detalhes: err });
    }
  }
}

export default new BoletosController();
