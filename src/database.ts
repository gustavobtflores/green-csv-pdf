import { AppDataSource } from "./data-source";

let initialized = false;

export const getDataSource = async () => {
  if (!initialized) {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    initialized = true;
  }
  return AppDataSource;
};
