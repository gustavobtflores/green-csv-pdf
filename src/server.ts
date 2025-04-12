import express, { Application } from "express";
import { router } from "./routes";
import { AppDataSource } from "./providers/data-source.provider";

export class SetupServer {
  private readonly app: Application;

  constructor(private port: number) {
    this.app = express();
  }

  private setupExpress() {
    this.app.use(express.json());
    this.app.use(router);
  }

  private async setupDabase() {
    await AppDataSource.initialize();
  }

  public async init() {
    this.setupExpress();
    await this.setupDabase();
  }

  public async start() {
    this.app.listen(this.port, () => {
      console.log(`Server is running on http://localhost:${this.port}`);
    });
  }

  public async close() {
    await AppDataSource.destroy();
  }
}
