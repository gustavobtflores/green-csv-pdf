import { Repository } from "typeorm";
import { AppDataSource } from "../providers/data-source.provider";
import { LoteMapping } from "../entities/LoteMapping";

class LoteMappingRepository extends Repository<LoteMapping> {
  async findOneByExternalId(id: string): Promise<LoteMapping | null> {
    return this.findOne({ where: { id_externo: id } });
  }
}

export const loteMappingRepository = AppDataSource.getRepository(LoteMapping).extend({
  findOneByExternalId: async (id: string): Promise<LoteMapping | null> => {
    return AppDataSource.getRepository(LoteMapping).findOne({ where: { id_externo: id } });
  },
}) as unknown as LoteMappingRepository;
