'use client'

import { useState } from 'react'

interface Message {
  from: 'You' | 'Bot'
  text: string
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = { from: 'You', text: input }
    setMessages((prev) => [...prev, userMessage])

    const res = await fetch('/api/bot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    })

    const data: { reply: string } = await res.json()
    const botMessage: Message = { from: 'Bot', text: data.reply }

    setMessages((prev) => [...prev, botMessage])
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage()
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: 20, maxWidth: 400 }}>
      <div
        style={{
          minHeight: 200,
          maxHeight: 300,
          overflowY: 'auto',
          marginBottom: 10,
          padding: 10,
          background: '#f9f9f9',
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              textAlign: msg.from === 'You' ? 'right' : 'left',
              margin: '5px 0',
            }}
          >
            <strong>{msg.from}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        style={{ width: 'calc(100% - 70px)', marginRight: 10, padding: 8 }}
      />
      <button onClick={sendMessage} style={{ padding: '8px 12px' }}>
        Send
      </button>
    </div>
  )
}
