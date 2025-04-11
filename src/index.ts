import express, { Request, Response } from "express";
import { getDataSource } from "./database";
import { Boleto } from "./entities/Boleto";
import { upload } from "./config/multer";
import { parse } from "csv-parse/sync";
import { Lote } from "./entities/Lote";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", async (req: Request, res: Response) => {
  const db = await getDataSource();

  const boletos = await db.getRepository(Boleto).find();

  res.send({ data: boletos });
});

interface RegistroCSV {
  nome: string;
  valor: string;
  linha_digitavel: string;
  unidade: string;
}

app.post("/boletos/import/csv", upload.single("file"), async (req: Request, res: Response) => {
  try {
    const db = await getDataSource();

    const fileBuffer = req.file?.buffer;
    if (!fileBuffer) {
      res.status(400).json({ erro: "Arquivo ausente" });
      return;
    }

    const content = fileBuffer.toString("utf-8");

    const registros: RegistroCSV[] = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      delimiter: ";",
    });

    let boletos = [];

    for (const boleto of registros) {
      const loteId = boleto.unidade.padStart(4, "0");
      const lote = await db.getRepository(Lote).findOne({ where: { nome: loteId } });

      if (!lote) {
        throw new Error(`Lote com nome ${loteId} não encontrado`);
      }

      boletos.push({
        nome_sacado: boleto.nome,
        valor: parseFloat(boleto.valor),
        linha_digitavel: boleto.linha_digitavel,
        ativo: true,
        lote,
      });
    }

    const insertedBoletos = await db.createQueryBuilder().insert().into(Boleto).values(boletos).execute();

    res.json({ insertedBoletos });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao processar CSV", detalhes: err });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
