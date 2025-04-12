import express, { Request, Response } from "express";
import BoletosController from "../controllers/boletos.controller";
import { upload } from "../config/multer";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.send("Base route");
});

router.get("/boletos", BoletosController.getAll);

router.post("/boletos/import/csv", upload.single("file"), BoletosController.importWithCSV);

export { router };
