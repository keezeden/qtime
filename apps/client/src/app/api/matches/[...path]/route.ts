import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.QTIME_API_URL ?? "http://localhost:3000";

type RouteParams = {
  params: Promise<{
    path: string[];
  }>;
};

export async function GET(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse> {
  return forwardMatchesRequest(request, context, "GET");
}

export async function POST(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse> {
  return forwardMatchesRequest(request, context, "POST");
}

async function forwardMatchesRequest(
  request: NextRequest,
  context: RouteParams,
  method: "GET" | "POST",
): Promise<NextResponse> {
  const { path } = await context.params;
  const target = new URL(`${API_URL}/matches/${path.join("/")}`);
  target.search = request.nextUrl.search;

  const upstream = await fetch(target, {
    method,
    headers: createForwardHeaders(request, method === "POST"),
    body: method === "POST" ? await request.text() : undefined,
    cache: "no-store",
  });

  return toJsonResponse(upstream);
}

function createForwardHeaders(
  request: NextRequest,
  includeContentType: boolean,
): Headers {
  const headers = new Headers();
  const cookie = request.headers.get("cookie");

  if (cookie) {
    headers.set("Cookie", cookie);
  }

  if (includeContentType) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

async function toJsonResponse(upstream: Response): Promise<NextResponse> {
  const contentType = upstream.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return NextResponse.json(await upstream.json(), { status: upstream.status });
  }

  return new NextResponse(await upstream.text(), { status: upstream.status });
}
