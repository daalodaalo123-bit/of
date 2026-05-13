import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const instanceId = process.env.WAWP_INSTANCE_ID
    const accessToken = process.env.WAWP_ACCESS_TOKEN
    const testNumber = '252634845067'

    if (!instanceId || !accessToken) {
      return NextResponse.json({ error: 'Please add your WAWP_ACCESS_TOKEN to .env.local first!' }, { status: 400 })
    }

    const message = `Asc, tani waa tijaabo ka socota FOD Clinic. Haddii aad farriintan heshay, nidaamka WhatsApp-kaagu si fiican ayuu u shaqeynayaa! ✅`

    const res = await fetch('https://api.wawp.net/v2/send/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instance_id: instanceId,
        access_token: accessToken,
        chatId: `${testNumber}@c.us`,
        message: message
      })
    })

    const data = await res.json()

    if (res.ok) {
      return NextResponse.json({ success: true, message: 'Test message sent to ' + testNumber, details: data })
    } else {
      return NextResponse.json({ success: false, error: 'WAWP Error', details: data }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
