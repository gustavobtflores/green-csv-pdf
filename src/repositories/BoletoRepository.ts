import { FindOneOptions, Repository } from "typeorm";
import { Boleto } from "../entities/Boleto";
import { AppDataSource } from "../providers/data-source.provider";

class BoletoRepository extends Repository<Boleto> {
  async find(options: FindOneOptions<Boleto>): Promise<Boleto[]> {
    return this.find(options);
  }

  async findById(id: number): Promise<Boleto | null> {
    return this.findOne({ where: { id } });
  }
}

export const boletoRepository = AppDataSource.getRepository(Boleto).extend(BoletoRepository);
