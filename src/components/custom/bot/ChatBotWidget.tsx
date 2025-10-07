'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X as XIcon, Check, XCircle } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";

interface Message {
  from: 'You' | 'Chronexa'
  text: string
  buttons?: boolean
}

export default function ChatBotWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [stage, setStage] = useState<'start' | 'late' | 'support' | 'absent' | 'done'>('start')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const toggle = () => {
    setOpen(o => {
      const newOpen = !o
      if (newOpen && messages.length === 0) {
        setMessages([{
          from: 'Chronexa',
          text: `Hey Sree,\n\nHappy Morning\n\nYou were late by 00:10 minutes today. Do you want me to apply for a permission?`,
          buttons: true
        }])
        setStage('late')
      }
      return newOpen
    })
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendToApi(msg: string) {
    const res = await fetch('/api/bot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg }),
    })
    const data = await res.json()
    return data.reply as string
  }

  const handleUserReply = async (reply: string) => {
    setMessages(prev => {
    const updated = [...prev]
    const lastIndex = updated.map(m => m.from).lastIndexOf('Chronexa')
    if (lastIndex !== -1 && updated[lastIndex].buttons) {
        updated[lastIndex] = { ...updated[lastIndex], buttons: false }
    }
    return [...updated, { from: 'You', text: reply }]
    })

    if (stage === 'late') {
      if (reply.toLowerCase() === 'yes' || reply.toLowerCase() === 'no') {
        const botReply = await sendToApi(reply)
        setMessages(prev => [...prev, { from: 'Chronexa', text: botReply }])
        setStage('support')
      }
    } else if (stage === 'support') {
        if (reply.toLowerCase() === 'ok') {
            const botReply = await sendToApi('ok')
            setMessages(prev => [
            ...prev,
            { from: 'Chronexa', text: botReply, buttons: true }
            ])
            setStage('absent')
        }
    } else if (stage === 'absent') {
      if (reply.toLowerCase() === 'yes' || reply.toLowerCase() === 'no') {
        const finalReply = reply.toLowerCase() === 'yes'
          ? 'Your leave request has been submitted.'
          : 'Alright, no problem!'
        setMessages(prev => [...prev, { from: 'Chronexa', text: finalReply }])
        setStage('done')
      }
    } else {
      setMessages(prev => [...prev, { from: 'You', text: reply }])
    }
  }

  const onSendText = () => {
    const trimmed = input.trim()
    if (!trimmed) return

    if (stage === 'support' && trimmed.toLowerCase() === 'ok') {
      handleUserReply('ok')
    } else if (stage === 'late' || stage === 'absent') {
      return
    } else {
      setMessages(prev => [...prev, { from: 'You', text: trimmed }])
    }

    setInput('')
  }

  return (
    <>
      <button
        onClick={toggle}
        className="fixed bottom-5 right-5 bg-primary hover:bg-primary-100 text-white p-3 rounded-full shadow-lg z-50"
        aria-label="Open ChatBot"
      >
        <MessageCircle />
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 w-72 bg-white border rounded-lg shadow-xl z-50 flex flex-col">
          <div className="p-3 border-b font-semibold bg-primary text-white flex justify-between items-center">
            <span>ChatBot</span>
            <button onClick={toggle} aria-label="Close" className="text-white">
              <XIcon size={20} />
            </button>
          </div>
          <div className="p-2 h-64 overflow-y-auto scrollbar-hide text-sm space-y-2 flex-1">
            {messages.map((msg, idx) => (
              <div key={idx} className={`text-${msg.from === 'You' ? 'right' : 'left'}`}>
                <strong>{msg.from}:</strong> <span className="whitespace-pre-line">{msg.text}</span>
                {msg.buttons && (
                  <div className="flex gap-2 mt-2 justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUserReply('Yes')}
                      className="flex items-center gap-1"
                    >
                      <Check size={14} /> Yes
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUserReply('No')}
                      className="flex items-center gap-1"
                    >
                      <XCircle size={14} /> No
                    </Button>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-2 flex gap-1 border-t">
            <Input
              type="text"
              value={input}
              placeholder="Type a message"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSendText()}
              disabled={stage === 'late' || stage === 'absent'}
            />
            <Button onClick={onSendText} size="sm" className="px-2 py-1" disabled={!input.trim()}>
              Send
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
