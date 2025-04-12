import { Boleto } from "./entities/Boleto";
import { Lote } from "./entities/Lote";
import { AppDataSource } from "./providers/data-source.provider";

async function seed() {
  const db = await AppDataSource.initialize();

  await db.getRepository(Boleto).delete({});
  await db.getRepository(Lote).delete({});

  const lotes: Partial<Lote>[] = [
    {
      id: 1,
      nome: "0017",
      ativo: true,
    },
    {
      id: 2,
      nome: "0018",
      ativo: true,
    },
    {
      id: 10,
      nome: "0019",
      ativo: true,
    },
  ];

  await db.getRepository(Lote).insert(lotes);

  console.log("Seed completed");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error during seed:", err);
  process.exit(1);
});
