import { redirect } from "next/navigation";
import { AuthPageShell } from "@/app/components/auth/auth-page-shell";
import { getCurrentUser } from "@/app/lib/auth";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const nextPath = sanitizeNextPath((await searchParams).next ?? "/dashboard");
  const user = await getCurrentUser();

  if (user) {
    redirect(nextPath);
  }

  return <AuthPageShell mode="signup" nextPath={nextPath} />;
}

function sanitizeNextPath(nextPath: string): string {
  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/dashboard";
  }

  return nextPath;
}
