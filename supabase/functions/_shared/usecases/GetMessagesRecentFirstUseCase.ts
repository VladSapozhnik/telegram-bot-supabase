import { MessageEntity } from "../domain/entities.ts";
import { IBotDatabaseRepository } from "../ports/index.ts";

export class GetMessagesRecentFirstUseCase {
  constructor(private dbRepo: IBotDatabaseRepository) {}

  async execute(): Promise<MessageEntity[]> {
    return await this.dbRepo.getAllMessagesRecentFirst();
  }
}
