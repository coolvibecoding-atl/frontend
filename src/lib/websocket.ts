import { useEffect, useState, useCallback, useRef } from 'react';

interface WebSocketMessage {
  type: string;
  trackId: string;
  progress?: number;
  status?: string;
  step?: string;
  error?: string;
  data?: unknown;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  onClose?: () => void;
  reconnect?: boolean;
  reconnectInterval?: number;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const {
    onMessage,
    onError,
    onClose,
    reconnect = true,
    reconnectInterval = 5000,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionError, setConnectionError] = useState<Event | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError(error);
        onError?.(error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        onClose?.();

        // Attempt to reconnect if enabled
        if (reconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, reconnectInterval);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError(error as Event);
    }
  }, [url, onMessage, onError, onClose, reconnect, reconnectInterval]);

  useEffect(() => {
    connect();

    return () => {
      // Cleanup
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  return {
    isConnected,
    lastMessage,
    connectionError,
    sendMessage,
  };
}

// Track progress subscription hook
export function useTrackProgress(trackId: string) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle');
  const [step, setStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { isConnected, lastMessage } = useWebSocket(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/ws/progress`,
    {
      onMessage: (message) => {
        if (message.trackId === trackId) {
          if (message.progress !== undefined) {
            setProgress(message.progress);
          }
          if (message.status) {
            setStatus(message.status);
          }
          if (message.step) {
            setStep(message.step);
          }
          if (message.error) {
            setError(message.error);
          }
        }
      },
    }
  );

  return {
    progress,
    status,
    step,
    error,
    isConnected,
  };
}

// Broadcast channel for cross-tab communication
export function useBroadcastChannel(channelName: string) {
  const [message, setMessage] = useState<unknown>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(channelName);

    channelRef.current.onmessage = (event) => {
      setMessage(event.data);
    };

    return () => {
      channelRef.current?.close();
    };
  }, [channelName]);

  const postMessage = useCallback((data: unknown) => {
    channelRef.current?.postMessage(data);
  }, []);

  return { message, postMessage };
}