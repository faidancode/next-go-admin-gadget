import { NextRequest, NextResponse } from "next/server";

const DEFAULT_TARGET =
  process.env.API_PROXY_TARGET ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:3000/v1";

function buildUpstreamUrl(path: string[], search: string) {
  const base = DEFAULT_TARGET.replace(/\/$/, "");
  const suffix = path.length ? `/${path.join("/")}` : "";
  return `${base}${suffix}${search}`;
}

async function forward(request: NextRequest, path: string[]) {
  const targetUrl = buildUpstreamUrl(path, request.nextUrl.search);

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");

  const method = request.method;
  const body =
    method === "GET" || method === "HEAD"
      ? undefined
      : Buffer.from(await request.arrayBuffer());

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method,
      headers,
      body,
      redirect: "manual",
      credentials: "include",
    });

    console.log("✅ Upstream response:", {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
    });

    const response = new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
    });

    const setCookie = upstreamResponse.headers.get("set-cookie");
    if (setCookie) {
      response.headers.append("set-cookie", setCookie);
    }

    return response;
  } catch (error) {
    console.error("❌ Fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch from backend",
        details: error instanceof Error ? error.message : "Unknown error",
        targetUrl,
      },
      { status: 500 }
    );
  }
}

async function handler(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const resolved = await context.params;
  const path = resolved.path || [];
  return forward(request, path);
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
