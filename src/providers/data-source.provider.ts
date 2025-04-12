import "reflect-metadata";
import { DataSource } from "typeorm";
import { Boleto } from "../entities/Boleto";
import { Lote } from "../entities/Lote";
import { LoteMapping } from "../entities/LoteMapping";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 4321,
  username: "postgres",
  password: "postgres",
  database: "green",
  synchronize: true,
  logging: false,
  entities: [Lote, LoteMapping, Boleto],
  migrations: [],
  subscribers: [],
});
