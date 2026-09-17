import "@supabase/functions-js/edge-runtime.d.ts";
import { createBotContainer } from "../_shared/factory.ts";

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { getMessagesRecentFirstUseCase } = createBotContainer();
    const messages = await getMessagesRecentFirstUseCase.execute();

    return new Response(JSON.stringify(messages), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
});
