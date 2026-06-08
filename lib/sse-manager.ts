import { Notification } from "@/app/generated/prisma/client";

export interface SSEClient {
  id: string;
  userId: string;
  role: string;
  controller: ReadableStreamDefaultController;
}

class SSEManager {
  private clients: Map<string, SSEClient> = new Map();

  // Add a new client connection
  addClient(userId: string, role: string, controller: ReadableStreamDefaultController): string {
    const id = crypto.randomUUID();
    this.clients.set(id, { id, userId, role, controller });
    console.log(`SSE Client added: ${id} (User: ${userId}, Role: ${role})`);
    return id;
  }

  // Remove a disconnected client
  removeClient(clientId: string) {
    if (this.clients.has(clientId)) {
      this.clients.delete(clientId);
      console.log(`SSE Client removed: ${clientId}`);
    }
  }

  // Send raw data to a specific controller
  private send(controller: ReadableStreamDefaultController, eventName: string, data: any) {
    try {
      const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
      controller.enqueue(new TextEncoder().encode(payload));
    } catch (err) {
      console.error("Error sending SSE to client", err);
    }
  }

  // Send an event to a specific user (can be multiple tabs open for the same user)
  sendToUser(userId: string, notification: Notification) {
    for (const client of this.clients.values()) {
      if (client.userId === userId) {
        this.send(client.controller, "notification", notification);
      }
    }
  }

  // Broadcast to all Super Admins
  broadcastToAdmins(notification: Notification) {
    for (const client of this.clients.values()) {
      if (client.role === "SUPER_ADMIN") {
        this.send(client.controller, "notification", notification);
      }
    }
  }

  // Send heartbeat to all clients to keep connections alive
  sendHeartbeat() {
    const payload = new TextEncoder().encode(`: heartbeat\n\n`);
    for (const client of this.clients.values()) {
      try {
        client.controller.enqueue(payload);
      } catch (err) {
        // If sending fails, client likely disconnected ungracefully
        this.removeClient(client.id);
      }
    }
  }
}

// Singleton instance
export const sseManager = new SSEManager();

// Setup global heartbeat interval (every 30 seconds)
if (typeof global !== "undefined") {
  if (!(global as any).sseHeartbeatInterval) {
    (global as any).sseHeartbeatInterval = setInterval(() => {
      sseManager.sendHeartbeat();
    }, 30000);
  }
}
