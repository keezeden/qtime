"use client";

import { useEffect } from "react";
import type { GameState } from "@qtime/game";
import { readGameSocketMessage } from "./multiplayer-api";

type GameSocketOptions = {
  matchId: number | null;
  websocketUrl: string | null;
  onSnapshot: (state: GameState, version: number) => void;
  onConnectionError: () => void;
};

export function useGameSocket(options: GameSocketOptions): void {
  const { matchId, onConnectionError, onSnapshot, websocketUrl } = options;

  useEffect(() => {
    if (!matchId || !websocketUrl) return;

    const socket = new WebSocket(websocketUrl);

    socket.addEventListener("open", () => {
      socket.send(JSON.stringify({ type: "ping" }));
    });
    socket.addEventListener("message", (event) => {
      if (typeof event.data !== "string") return;

      const input = readGameSocketMessage(event.data);
      if (!input || input.type !== "snapshot" || input.matchId !== matchId) return;

      onSnapshot(input.state, input.version);
    });
    socket.addEventListener("error", () => {
      onConnectionError();
    });

    return () => socket.close();
  }, [matchId, onConnectionError, onSnapshot, websocketUrl]);
}
