"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";
import {
  StatusMessage,
  type StatusMessageColor,
} from "@/components/molecules/status-message/status-message";
import { STATUS_MESSAGE_DURATION_MS, type StatusMessageDuration } from "./status-message-duration";

export type StatusMessageRequest = {
  color?: StatusMessageColor;
  content: ReactNode;
  duration: StatusMessageDuration;
  icon?: LucideIcon;
};

type StatusMessageEntry = StatusMessageRequest & { id: number };
type StatusMessageContextValue = {
  dismissMessage: (id: number) => void;
  showMessage: (request: StatusMessageRequest) => number;
};

const StatusMessageContext = createContext<StatusMessageContextValue | undefined>(undefined);

export function StatusMessageProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<StatusMessageEntry[]>([]);
  const nextIdRef = useRef(1);
  const timersRef = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const orderedMessages = [
    ...messages.filter((message) => message.duration !== "persistent"),
    ...messages.filter((message) => message.duration === "persistent"),
  ];

  const dismissMessage = useCallback((id: number) => {
    const timer = timersRef.current.get(id);
    if (timer) clearTimeout(timer);
    timersRef.current.delete(id);
    setMessages((current) => current.filter((message) => message.id !== id));
  }, []);

  const showMessage = useCallback(
    (request: StatusMessageRequest) => {
      const id = nextIdRef.current;
      nextIdRef.current += 1;
      setMessages((current) => [...current, { ...request, id }]);
      if (request.duration !== "persistent") {
        const timer = setTimeout(
          () => dismissMessage(id),
          STATUS_MESSAGE_DURATION_MS[request.duration],
        );
        timersRef.current.set(id, timer);
      }
      return id;
    },
    [dismissMessage],
  );

  useEffect(
    () => () => {
      for (const timer of timersRef.current.values()) clearTimeout(timer);
      timersRef.current.clear();
    },
    [],
  );

  return (
    <StatusMessageContext.Provider value={{ dismissMessage, showMessage }}>
      {children}
      {messages.length > 0 ? (
        <div className="pointer-events-none fixed right-5 bottom-5 z-20 flex w-[calc(100%-2.5rem)] max-w-sm flex-col gap-2">
          {orderedMessages.map((message) => (
            <StatusMessage color={message.color} icon={message.icon} key={message.id}>
              {message.content}
            </StatusMessage>
          ))}
        </div>
      ) : null}
    </StatusMessageContext.Provider>
  );
}

export function useStatusMessage(): StatusMessageContextValue {
  const context = useContext(StatusMessageContext);
  if (!context) throw new Error("useStatusMessage must be used within StatusMessageProvider.");
  return context;
}
