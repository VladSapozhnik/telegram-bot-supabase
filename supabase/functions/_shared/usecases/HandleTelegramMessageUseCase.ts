import { TelegramUpdate } from "../domain/entities.ts";
import { IBotDatabaseRepository, ITelegramSender } from "../ports/index.ts";
import { GetCurrencyRateUseCase } from "./GetCurrencyRateUseCase.ts";

export class HandleTelegramMessageUseCase {
  constructor(
    private dbRepo: IBotDatabaseRepository,
    private telegramSender: ITelegramSender,
    private getCurrencyRateUseCase: GetCurrencyRateUseCase,
  ) {}

  async execute(update: TelegramUpdate): Promise<{ handled: boolean; replyText?: string }> {
    const message = update.message || update.edited_message;
    if (!message || !message.from || !message.text) {
      return { handled: false };
    }

    const clientUser = message.from;
    const clientId = clientUser.id;
    const incomingText = message.text.trim();
    const chatId = message.chat.id;
    const now = new Date();

    // 1. Сохранить/обновить клиента и дату последнего взаимодействия (входящее сообщение)
    await this.dbRepo.upsertClientActivity({
      id: clientId,
      firstName: clientUser.first_name,
      lastName: clientUser.last_name,
      username: clientUser.username,
      activityAt: now,
    });

    // 2. Записать каждое входящее сообщение клиента
    await this.dbRepo.saveMessage({
      clientId: clientId,
      sender: "client",
      text: incomingText,
      createdAt: now,
    });

    // 3. Вызвать Use Case получения курса валюты относительно USD
    const rateResult = await this.getCurrencyRateUseCase.execute(incomingText);
    const replyText = rateResult.messageText;

    // 4. Отправить ответ в Telegram
    await this.telegramSender.sendMessage(chatId, replyText);

    // 5. Записать обновление даты активности клиента (система отправила клиенту)
    const botSentTime = new Date();
    await this.dbRepo.upsertClientActivity({
      id: clientId,
      firstName: clientUser.first_name,
      lastName: clientUser.last_name,
      username: clientUser.username,
      activityAt: botSentTime,
    });

    // 6. Записать исходящее сообщение бота
    await this.dbRepo.saveMessage({
      clientId: clientId,
      sender: "bot",
      text: replyText,
      createdAt: botSentTime,
    });

    return { handled: true, replyText };
  }
}
