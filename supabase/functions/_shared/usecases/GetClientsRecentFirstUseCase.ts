import { ClientEntity } from "../domain/entities.ts";
import { IBotDatabaseRepository } from "../ports/index.ts";

export class GetClientsRecentFirstUseCase {
  constructor(private dbRepo: IBotDatabaseRepository) {}

  async execute(): Promise<ClientEntity[]> {
    return await this.dbRepo.getAllClientsRecentFirst();
  }
}
