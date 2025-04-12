import { Repository } from "typeorm";
import { Lote } from "../entities/Lote";
import { AppDataSource } from "../providers/data-source.provider";
import { LoteMapping } from "../entities/LoteMapping";

class LoteMappingRepository extends Repository<LoteMapping> {
  async findOneByExternalId(id: string): Promise<LoteMapping | null> {
    return this.findOne({ where: { id_externo: id } });
  }
}

export const loteMappingRepository = AppDataSource.getRepository(Lote).extend(LoteMappingRepository) as unknown as LoteMappingRepository;
