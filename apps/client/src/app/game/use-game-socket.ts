"use client";

import { useEffect, useRef } from "react";
import type { GameState } from "@qtime/game";
import { readGameSocketMessage, type GameSocketCommand } from "./multiplayer-socket";

type GameSocketOptions = {
  matchId: number | null;
  websocketUrl: string | null;
  onCommandRejected: (reason: string) => void;
  onSnapshot: (state: GameState, version: number) => void;
  onConnectionError: () => void;
};

type GameSocket = {
  sendCommand: (command: GameSocketCommand) => boolean;
};

export function useGameSocket(options: GameSocketOptions): GameSocket {
  const { matchId, onCommandRejected, onConnectionError, onSnapshot, websocketUrl } = options;
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!matchId || !websocketUrl) {
      socketRef.current = null;
      return;
    }

    const socket = new WebSocket(websocketUrl);
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      socket.send(JSON.stringify({ type: "ping" }));
    });
    socket.addEventListener("message", (event) => {
      if (typeof event.data !== "string") return;

      const input = readGameSocketMessage(event.data);
      if (!input) return;
      if (input.type === "command_rejected") onCommandRejected(input.reason);
      if (input.type !== "snapshot" || input.matchId !== matchId) return;

      onSnapshot(input.state, input.version);
    });
    socket.addEventListener("error", () => {
      onConnectionError();
    });
    socket.addEventListener("close", () => {
      socketRef.current = null;
    });

    return () => {
      socketRef.current = null;
      socket.close();
    };
  }, [matchId, onCommandRejected, onConnectionError, onSnapshot, websocketUrl]);

  function sendCommand(command: GameSocketCommand): boolean {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return false;

    socketRef.current.send(JSON.stringify(command));
    return true;
  }

  return { sendCommand };
}
