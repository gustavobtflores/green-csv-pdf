import express, { Request, Response } from "express";
import { upload } from "./config/multer";
import BoletosController from "./controllers/boletos.controller";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Base route")
});

app.get("/boletos", BoletosController.getAll);

app.post("/boletos/import/csv", upload.single("file"), BoletosController.importWithCSV);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
