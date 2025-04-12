import "dotenv/config";
import { SetupServer } from "./server";

enum ExitStatus {
  Success = 0,
  Failure = 1,
}

(async () => {
  try {
    const server = new SetupServer(3000);
    await server.init();
    server.start();

    const exitSignals: NodeJS.Signals[] = ["SIGINT", "SIGTERM", "SIGQUIT"];

    for (const signal of exitSignals) {
      process.on(signal, async () => {
        try {
          await server.close();
          process.exit(ExitStatus.Success);
        } catch (err) {
          process.exit(ExitStatus.Failure);
        }
      });
    }
  } catch (err) {
    process.exit(ExitStatus.Failure);
  }
})();
