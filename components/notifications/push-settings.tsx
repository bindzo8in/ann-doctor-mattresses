"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { env } from "@/env";
import { Bell, BellOff } from "lucide-react";

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

export function PushSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    setIsSubscribed(!!subscription);
  };

  const handleSubscribe = async () => {
    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== "granted") {
        toast.error("Notification permission denied");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const applicationServerKey = urlBase64ToUint8Array(env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      }

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      setIsSubscribed(true);
      toast.success("Push notifications enabled!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to enable push notifications");
    }
  };

  const handleUnsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
        setIsSubscribed(false);
        toast.success("Push notifications disabled");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to disable push notifications");
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 border rounded-xl bg-slate-50 text-slate-500 text-sm">
        Push notifications are not supported in this browser.
      </div>
    );
  }

  return (
    <div className="p-5 border border-slate-100 shadow-sm rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          {isSubscribed ? <Bell className="w-5 h-5 text-emerald-600" /> : <BellOff className="w-5 h-5 text-slate-400" />}
          Browser Notifications
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Receive updates about your orders even when the website is closed.
        </p>
        <p className="text-xs text-slate-400 mt-1">Status: {permission === "granted" ? (isSubscribed ? "Active" : "Ready") : (permission || "Unknown")}</p>
      </div>

      <Button
        variant={isSubscribed ? "outline" : "default"}
        onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
      >
        {isSubscribed ? "Disable Notifications" : "Enable Notifications"}
      </Button>
    </div>
  );
}
