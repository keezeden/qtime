import { redirect } from "next/navigation";
import { AuthPageShell } from "@/app/components/auth/auth-page-shell";
import { getCurrentUser } from "@/app/lib/auth";
import {
  DEFAULT_AUTH_NEXT_PATH,
  sanitizeNextPath,
} from "@/app/lib/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const nextPath = sanitizeNextPath(
    (await searchParams).next ?? DEFAULT_AUTH_NEXT_PATH,
  );
  const user = await getCurrentUser();

  if (user) {
    redirect(nextPath);
  }

  return <AuthPageShell mode="login" nextPath={nextPath} />;
}
