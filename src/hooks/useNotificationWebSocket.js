import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getStoredAccessToken } from "../auth/storageBridge";

function resolveSockJsUrl() {
  const explicit = import.meta.env.VITE_NOTIFICATION_WS_URL;
  if (explicit && String(explicit).trim()) return String(explicit).trim();
  const base = import.meta.env.VITE_API_BASE_URL || "";
  try {
    const u = new URL(
      base,
      typeof window !== "undefined" ? window.location.href : undefined,
    );
    return `${u.origin}/ws`;
  } catch {
    return typeof window !== "undefined"
      ? `${window.location.origin}/ws`
      : "/ws";
  }
}

/**
 * Subscribes to the Spring STOMP user queue and refreshes notification queries.
 * Requires backend JWT-on-connect (or cookie session) compatible with your gateway.
 */
export function useNotificationWebSocket(userId, enabled = true) {
  const queryClient = useQueryClient();
  const clientRef = useRef(null);

  useEffect(() => {
    if (!enabled || !userId) return undefined;

    const token = getStoredAccessToken();
    const sockUrl = resolveSockJsUrl();

    const client = new Client({
      webSocketFactory: () => new SockJS(sockUrl),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        client.subscribe("/user/queue/notifications", () => {
          queryClient.invalidateQueries({
            queryKey: ["notifications", "user", userId],
          });
          queryClient.invalidateQueries({
            queryKey: ["notifications", "unread", userId],
          });
        });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [enabled, queryClient, userId]);
}
