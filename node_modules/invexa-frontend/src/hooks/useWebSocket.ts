import { useEffect, useRef, useState } from 'react'

export interface WebSocketMessage {
  type: string
  symbol?: string
  price?: number
  change?: number
  percent_change?: number
  timestamp?: number
  [key: string]: unknown
}

export function useWebSocket(url = 'ws://localhost:8000/api/v1/ws/stream') {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    let ws: WebSocket
    try {
      ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketMessage
          setLastMessage(data)
        } catch {
          // ignore
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
      }

      ws.onerror = () => {
        setIsConnected(false)
      }
    } catch {
      setIsConnected(false)
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [url])

  return { isConnected, lastMessage }
}
