
"use client";

import axios from "axios";
import { getSession, signOut } from "next-auth/react";

export const apiClient = axios.create({
  // Same-origin requests work with the backend's single configured CORS origin.
  baseURL: "/backend",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 75_000,
});

// A catalog loads multiple queries in parallel; reuse its in-flight session request.
let pendingSession: ReturnType<typeof getSession> | undefined;
function requestSession() {
  if (!pendingSession) pendingSession = getSession().finally(() => { pendingSession = undefined; });
  return pendingSession;
}

apiClient.interceptors.request.use(
  async (config) => {
    if (!process.env.NEXT_PUBLIC_API_URL) throw new Error("Не настроен NEXT_PUBLIC_API_URL.");
    const session = await requestSession();
    const token = session?.accessToken;

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      config.headers.delete("Authorization");
    }

    return config;
  },
  (error) => Promise.reject(error),
);

let handlingUnauthorized = false;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const config = error.config;

    const hasBearerToken = Boolean(
      config?.headers?.get("Authorization"),
    );

    if (
      status === 401 &&
      hasBearerToken &&
      typeof window !== "undefined" &&
      !handlingUnauthorized
    ) {
      handlingUnauthorized = true;

      try {
        await signOut({ redirect: false });

        if (!window.location.pathname.startsWith("/login")) {
          const currentPath =
            window.location.pathname + window.location.search;

          window.location.replace(
            `/login?reason=session-expired&callbackUrl=${encodeURIComponent(currentPath)}`,
          );
        }
      } finally {
        handlingUnauthorized = false;
      }
    }

    return Promise.reject(error);
  },
);
