import { requireUser } from "@/app/lib/auth";
import { MultiplayerWordDuel } from "./multiplayer-word-duel";

export default async function GamePage() {
  const user = await requireUser("/game");

  return <MultiplayerWordDuel user={user} />;
}
