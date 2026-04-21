import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.QTIME_API_URL ?? "http://localhost:3000";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const upstream = await fetch(`${API_URL}/matchmaking`, {
    method: "POST",
    headers: createForwardHeaders(request, true),
    body: await request.text(),
    cache: "no-store",
  });

  return toJsonResponse(upstream);
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const upstream = await fetch(`${API_URL}/matchmaking/leave`, {
    method: "POST",
    headers: createForwardHeaders(request, true),
    body: await request.text(),
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
