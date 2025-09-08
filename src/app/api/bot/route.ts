import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { message } = await req.json()
  const input = message?.toLowerCase()

  let reply = "Sorry, I didn’t understand that."

  switch (input) {
    case 'yes':
      reply = "Your permission request has been submitted."
      break
    case 'no':
      reply = "Thank you! Do you need any other support?"
      break
    case 'ok':
      reply = `Hey Sree,\n\nHappy Morning\n\nYou were absent yesterday. Do you want me to apply for a leave?`
      break
    default:
      reply = `Thanks for your message: "${message}".`
      break
  }

  return NextResponse.json({ reply })
}
