"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchCurrentMatch, joinMatchmaking, leaveMatchmaking, type MatchSummary } from "./multiplayer-api";

export type QueueStatus = "idle" | "queued" | "matched";

type MatchmakingQueueOptions = {
  onMatchFound: (match: MatchSummary) => Promise<void>;
  onQueueStarted: () => void;
};

export type MatchmakingQueue = {
  cancelQueue: () => Promise<void>;
  match: MatchSummary | null;
  queueStatus: QueueStatus;
  startMatchmaking: (force: boolean) => Promise<void>;
};

export function useMatchmakingQueue(options: MatchmakingQueueOptions): MatchmakingQueue {
  const { onMatchFound, onQueueStarted } = options;
  const [queueStatus, setQueueStatus] = useState<QueueStatus>("idle");
  const [match, setMatch] = useState<MatchSummary | null>(null);
  const [queuedAfter, setQueuedAfter] = useState<string | null>(null);
  const queueJobIdRef = useRef<string | null>(null);

  const cancelQueue = useCallback(async (): Promise<void> => {
    setQueueStatus("idle");
    setQueuedAfter(null);
    const queueJobId = queueJobIdRef.current;
    if (!queueJobId) return;
    queueJobIdRef.current = null;
    await leaveMatchmaking(queueJobId);
  }, []);

  const refreshCurrentMatch = useCallback(async (startedAfter: string | null): Promise<void> => {
    const currentMatch = await fetchCurrentMatch(startedAfter);
    if (!currentMatch) return;

    queueJobIdRef.current = null;
    setMatch(currentMatch);
    setQueueStatus("matched");
    await onMatchFound(currentMatch);
  }, [onMatchFound]);

  const startMatchmaking = useCallback(async (force: boolean): Promise<void> => {
    if (!force && (queueStatus === "queued" || queueStatus === "matched")) return;

    const startedAfter = new Date().toISOString();
    setMatch(null);
    setQueuedAfter(startedAfter);
    setQueueStatus("queued");
    onQueueStarted();

    const queue = await joinMatchmaking();
    queueJobIdRef.current = queue.jobId;
    await refreshCurrentMatch(startedAfter);
  }, [onQueueStarted, queueStatus, refreshCurrentMatch]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (queueStatus === "queued") void refreshCurrentMatch(queuedAfter);
    }, 2000);

    return () => window.clearInterval(interval);
  }, [queueStatus, queuedAfter, refreshCurrentMatch]);

  return {
    cancelQueue,
    match,
    queueStatus,
    startMatchmaking,
  };
}
