import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import webpush from "https://esm.sh/web-push@3.4.5";

webpush.setVapidDetails(
  "mailto:admin@yourapp.com",
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!
);

serve(async (req) => {
  const { subscription, title, body, url } = await req.json();

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title, body, url })
    );

    return new Response("ok");
  } catch (err) {
    return new Response(String(err), { status: 500 });
  }
});