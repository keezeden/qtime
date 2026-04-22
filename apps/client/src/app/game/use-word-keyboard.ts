"use client";

import { useEffect } from "react";

type WordKeyboardOptions = {
  enabled: boolean;
  onBackspace: () => void;
  onCommit: () => void;
  onLetter: (letter: string) => void;
};

export function useWordKeyboard(options: WordKeyboardOptions): void {
  const { enabled, onBackspace, onCommit, onLetter } = options;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (!enabled) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      if (event.key === "Backspace") {
        event.preventDefault();
        onBackspace();
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        onCommit();
        return;
      }

      if (/^[a-z]$/i.test(event.key)) {
        event.preventDefault();
        onLetter(event.key);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onBackspace, onCommit, onLetter]);
}
