import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { sseManager } from "@/lib/sse-manager";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    console.log("SSE Stream: Unauthorized - No session found");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const role = session.user.role;

  const stream = new ReadableStream({
    start(controller) {
      // Add client to manager
      const clientId = sseManager.addClient(userId, role, controller);

      // Send initial connection success event to keep connection alive
      try {
        controller.enqueue(new TextEncoder().encode("event: connected\ndata: {}\n\n"));
      } catch (e) {
        console.error("Error sending initial SSE payload", e);
      }

      // Handle disconnect when client closes the connection
      req.signal.addEventListener("abort", () => {
        sseManager.removeClient(clientId);
        try {
          controller.close();
        } catch (e) {
          // ignore error if already closed
        }
      });
    },
    cancel() {
      // Optional cleanup on cancel
    }
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "Content-Encoding": "none",
    },
  });
}
