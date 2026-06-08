import webpush from "web-push";
import { env } from "@/env";

// Configure web-push
webpush.setVapidDetails(
  env.WEB_PUSH_EMAIL,
  env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY,
  env.WEB_PUSH_PRIVATE_KEY
);

export { webpush };
