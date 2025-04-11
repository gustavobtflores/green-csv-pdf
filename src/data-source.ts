import "reflect-metadata";
import { DataSource } from "typeorm";
import { Lote } from "./entities/Lote";
import { Boleto } from "./entities/Boleto";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 4321,
  username: "postgres",
  password: "postgres",
  database: "green",
  synchronize: true,
  logging: false,
  entities: [Lote, Boleto],
  migrations: [],
  subscribers: [],
});
