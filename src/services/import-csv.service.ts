import { parse } from "csv-parse/sync";
import { boletoRepository } from "../repositories/BoletoRepository";
import { loteMappingRepository } from "../repositories/LoteMappingRepository";
import { loteRepository } from "../repositories/LoteRepository";
import { Registro } from "../types/registro";
import { Boleto } from "../entities/Boleto";

class ImportCSVService {
  public async execute(fileBuffer: Buffer) {
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

    const registros = parseCSV(fileBuffer);

    const boletos = [];

    const results = { processed: 0, duplicated: [] as Partial<Boleto>[] };

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
        results.duplicated.push({
          linha_digitavel: boleto.linha_digitavel,
          nome_sacado: boleto.nome,
        });
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

    return { results, boletos: insertedBoletos.raw };
  }
}

export default new ImportCSVService();
