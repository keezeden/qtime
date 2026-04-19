import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.QTIME_API_URL ?? "http://localhost:3000";
const AUTH_ACTIONS = new Set(["signup", "login", "refresh", "logout", "me"]);

type RouteParams = {
  params: Promise<{
    action: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteParams) {
  const { action } = await context.params;

  if (action === "refresh") {
    const response = await forwardAuthRequest(request, action, "POST");
    const nextPath = sanitizeNextPath(
      request.nextUrl.searchParams.get("next") ?? "/dashboard",
    );

    if (response.ok) {
      return redirectWithCookies(response, nextPath, request.url);
    }

    return redirectWithCookies(response, "/login", request.url);
  }

  if (action === "me") {
    return forwardAuthRequest(request, action, "GET");
  }

  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}

export async function POST(request: NextRequest, context: RouteParams) {
  const { action } = await context.params;
  return forwardAuthRequest(request, action, "POST");
}

async function forwardAuthRequest(
  request: NextRequest,
  action: string,
  method: "GET" | "POST",
): Promise<NextResponse> {
  if (!AUTH_ACTIONS.has(action)) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const headers = new Headers();
  const cookie = request.headers.get("cookie");

  if (cookie) {
    headers.set("Cookie", cookie);
  }

  let body: BodyInit | undefined;

  if (method !== "GET" && request.body) {
    headers.set("Content-Type", "application/json");
    body = await request.text();
  }

  const upstream = await fetch(`${API_URL}/auth/${action}`, {
    method,
    headers,
    body,
    cache: "no-store",
  });
  const response = await toJsonResponse(upstream);
  copySetCookieHeaders(upstream, response);

  return response;
}

async function toJsonResponse(upstream: Response): Promise<NextResponse> {
  const contentType = upstream.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return NextResponse.json(await upstream.json(), { status: upstream.status });
  }

  return new NextResponse(await upstream.text(), { status: upstream.status });
}

function copySetCookieHeaders(upstream: Response, response: NextResponse): void {
  const cookieHeaders =
    (
      upstream.headers as Headers & {
        getSetCookie?: () => string[];
      }
    ).getSetCookie?.() ?? [];

  for (const cookie of cookieHeaders) {
    response.headers.append("Set-Cookie", cookie);
  }
}

function redirectWithCookies(
  source: NextResponse,
  destination: string,
  requestUrl: string,
): NextResponse {
  const response = NextResponse.redirect(new URL(destination, requestUrl));

  for (const cookie of source.headers.getSetCookie()) {
    response.headers.append("Set-Cookie", cookie);
  }

  return response;
}

function sanitizeNextPath(nextPath: string): string {
  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/dashboard";
  }

  return nextPath;
}
