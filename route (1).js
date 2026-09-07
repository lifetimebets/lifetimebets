export async function GET() {
  return Response.json({ ok: true, service: "LIFETIMEBETS", version: "2.0.0" });
}