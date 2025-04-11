import express, { Request, Response } from "express";
import { getDataSource } from "./database";
import { Boleto } from "./entities/Boleto";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", async (req: Request, res: Response) => {
  const db = await getDataSource();

  const boletos = await db.getRepository(Boleto).find();

  res.send({ data: boletos });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
