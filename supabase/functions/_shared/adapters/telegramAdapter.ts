import { ITelegramSender } from "../ports/index.ts";

export class TelegramApiAdapter implements ITelegramSender {
  private botToken: string;

  constructor(botToken: string) {
    this.botToken = botToken;
  }

  async sendMessage(chatId: number, text: string): Promise<void> {
    if (!this.botToken) {
      console.warn("TELEGRAM_BOT_TOKEN is not set. Skipping sending message to Telegram.");
      return;
    }

    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`Telegram API error (${res.status}): ${err}`);
      throw new Error(`Telegram API responded with ${res.status}: ${err}`);
    }
  }
}
