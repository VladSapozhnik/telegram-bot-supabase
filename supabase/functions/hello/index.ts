import "@supabase/functions-js/edge-runtime.d.ts";

Deno.serve((req) => {
  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({
        error: "Method not allowed",
      }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  return new Response(
    JSON.stringify({
      message: "hello, it-incubator",
      studentId: '#6254'
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
});
