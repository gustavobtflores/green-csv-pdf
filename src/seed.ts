import { getDataSource } from "./database";
import { Boleto } from "./entities/Boleto";
import { Lote } from "./entities/Lote";

async function seed() {
  const db = await getDataSource();

  await db.getRepository(Boleto).delete({});
  await db.getRepository(Lote).delete({});

  const lotes: Partial<Lote>[] = [
    {
      nome: "0017",
      ativo: true,
    },
    {
      nome: "0018",
      ativo: true,
    },
    {
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
