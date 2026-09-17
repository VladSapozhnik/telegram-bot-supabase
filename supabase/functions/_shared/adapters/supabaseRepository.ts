import { SupabaseClient } from "npm:@supabase/supabase-js@^2.49.1";
import { ClientEntity, MessageEntity } from "../domain/entities.ts";
import { IBotDatabaseRepository } from "../ports/index.ts";

export class SupabaseBotRepository implements IBotDatabaseRepository {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async upsertClientActivity(clientData: {
    id: number;
    firstName?: string;
    lastName?: string;
    username?: string;
    activityAt?: Date;
  }): Promise<void> {
    const activityIso = (clientData.activityAt || new Date()).toISOString();

    const { error } = await this.client
      .from("clients")
      .upsert(
        {
          id: clientData.id,
          first_name: clientData.firstName ?? null,
          last_name: clientData.lastName ?? null,
          username: clientData.username ?? null,
          last_activity_at: activityIso,
        },
        { onConflict: "id" },
      );

    if (error) {
      console.error("Error upserting client activity:", error);
      throw error;
    }
  }

  async saveMessage(message: {
    clientId: number;
    sender: "client" | "bot";
    text: string;
    createdAt?: Date;
  }): Promise<void> {
    const createdIso = (message.createdAt || new Date()).toISOString();

    const { error } = await this.client
      .from("messages")
      .insert({
        client_id: message.clientId,
        sender: message.sender,
        text: message.text,
        created_at: createdIso,
      });

    if (error) {
      console.error("Error saving message:", error);
      throw error;
    }
  }

  async getAllClientsRecentFirst(): Promise<ClientEntity[]> {
    const { data, error } = await this.client
      .from("clients")
      .select("*")
      .order("last_activity_at", { ascending: false });

    if (error) {
      console.error("Error getting clients:", error);
      throw error;
    }

    return (data || []) as ClientEntity[];
  }

  async getAllMessagesRecentFirst(): Promise<MessageEntity[]> {
    const { data, error } = await this.client
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error getting messages:", error);
      throw error;
    }

    return (data || []) as MessageEntity[];
  }
}
