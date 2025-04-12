import { Repository } from "typeorm";
import { Lote } from "../entities/Lote";
import { AppDataSource } from "../providers/data-source.provider";

class LoteRepository extends Repository<Lote> {
  async findOneByName(name: string): Promise<Lote | null> {
    return this.findOne({ where: { nome: name } });
  }
}

export const loteRepository = AppDataSource.getRepository(Lote).extend(LoteRepository) as unknown as LoteRepository;
