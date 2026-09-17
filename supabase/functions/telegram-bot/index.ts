import "@supabase/functions-js/edge-runtime.d.ts";
import { createBotContainer } from "../_shared/factory.ts";
import { TelegramUpdate } from "../_shared/domain/entities.ts";

Deno.serve(async (req) => {
  if (req.method === "GET") {
    return new Response(
      JSON.stringify({ status: "ok", message: "Telegram Webhook Endpoint is running" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const update = (await req.json()) as TelegramUpdate;
    const { handleTelegramMessageUseCase } = createBotContainer();

    const result = await handleTelegramMessageUseCase.execute(update);

    return new Response(
      JSON.stringify({
        status: "ok",
        ...result,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error handling webhook update:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});
