
"use client";

import axios from "axios";
import { getSession, signOut } from "next-auth/react";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15_000,
});

apiClient.interceptors.request.use(
  async (config) => {
    const session = await getSession();
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
