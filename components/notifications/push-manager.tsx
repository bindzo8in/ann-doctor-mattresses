"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { env } from "@/env";

// Helper to convert base64 to Uint8Array for VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushManager() {
  return <PushManagerInner />;
}

function PushManagerInner() {
  const { data: session } = useSession();
  const [permissionState, setPermissionState] = useState<NotificationPermission>("default");
  const hasSynced = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermissionState(Notification.permission);
    }
  }, []);

  const userId = session?.user?.id;

  useEffect(() => {
    // Only attempt to register and subscribe if user is logged in,
    // permission is granted, and we haven't already synced this session.
    if (userId && permissionState === "granted" && !hasSynced.current) {
      registerAndSubscribe();
    }
  }, [userId, permissionState]);

  const registerAndSubscribe = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }

    try {
      // 1. Register SW
      const registration = await navigator.serviceWorker.register("/sw.js");

      // 2. Wait for SW to be ready
      await navigator.serviceWorker.ready;

      // 3. Check for existing subscription
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // 4. Subscribe
        const applicationServerKey = urlBase64ToUint8Array(env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      }

      // 5. Send to our server
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      if (res.ok) {
        hasSynced.current = true;
      }

    } catch (error) {
      console.error("Error during service worker registration or subscription:", error);
    }
  };

  const requestPermission = async () => {
    const permission = await Notification.requestPermission();
    setPermissionState(permission);
    if (permission === "granted") {
      registerAndSubscribe();
    }
  };

  // Banner UI if permission is strictly "default" (unasked) and user is logged in
  if (session?.user?.id && permissionState === "default") {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-xl max-w-sm flex flex-col gap-3">
        <div className="text-sm">
          <strong>Enable Notifications</strong>
          <p className="text-slate-300 mt-1">Get real-time updates about your orders and important alerts.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={requestPermission}
            className="flex-1 bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-100"
          >
            Enable
          </button>
          <button 
            onClick={() => setPermissionState("denied")} // Temporarily dismiss by setting state
            className="flex-1 bg-slate-800 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return null;
}
