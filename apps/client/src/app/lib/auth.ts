import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type AuthUser = {
  id: number;
  username: string;
  nametag: string | null;
};

type AuthResponse = {
  user: AuthUser;
};

const API_URL = process.env.QTIME_API_URL ?? "http://localhost:3000";

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  if (!cookieHeader) {
    return null;
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Cookie: cookieHeader,
    },
    cache: "no-store",
  }).catch(() => null);

  if (!response?.ok) {
    return null;
  }

  const body = (await response.json()) as AuthResponse;
  return body.user;
}

export async function requireUser(nextPath = "/dashboard"): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (user) {
    return user;
  }

  const cookieStore = await cookies();
  const hasRefreshSession =
    cookieStore.has("qtime_refresh") && cookieStore.has("qtime_session");

  if (hasRefreshSession) {
    redirect(`/api/auth/refresh?next=${encodeURIComponent(nextPath)}`);
  }

  redirect(`/login?next=${encodeURIComponent(nextPath)}`);
}
