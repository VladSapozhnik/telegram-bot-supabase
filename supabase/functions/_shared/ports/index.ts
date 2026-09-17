import { ClientEntity, MessageEntity } from "../domain/entities.ts";

export interface IExchangeRateProvider {
  getUsdRate(currency: string): Promise<number | null>;
  getSupportedCurrencies(): Promise<string[]>;
}

export interface IBotDatabaseRepository {
  upsertClientActivity(client: {
    id: number;
    firstName?: string;
    lastName?: string;
    username?: string;
    activityAt?: Date;
  }): Promise<void>;

  saveMessage(message: {
    clientId: number;
    sender: "client" | "bot";
    text: string;
    createdAt?: Date;
  }): Promise<void>;

  getAllClientsRecentFirst(): Promise<ClientEntity[]>;
  getAllMessagesRecentFirst(): Promise<MessageEntity[]>;
}

export interface ITelegramSender {
  sendMessage(chatId: number, text: string): Promise<void>;
}
