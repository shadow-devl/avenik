import { getSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type ApiOptions = RequestInit & {
  auth?: boolean;
};

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const {
    auth = true,
    headers,
    ...requestOptions
  } = options;

  const finalHeaders = new Headers(headers);

  finalHeaders.set("Content-Type", "application/json");

  if (auth) {
    const session = await getSession();

    const token = (session?.user as {
      token?: string;
    } | undefined)?.token;

    if (token) {
      finalHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...requestOptions,
      headers: finalHeaders,
    }
  );

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";

  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = new Error(
      typeof body === "object" &&
      body !== null &&
      "message" in body
        ? String((body as { message?: unknown }).message)
        : `API request failed with status ${response.status}`
    );

    Object.assign(error, {
      status: response.status,
      body,
    });

    throw error;
  }

  return body as T;
}

export async function apiGet<T>(
  path: string,
  options: Omit<ApiOptions, "method" | "body"> = {}
): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    method: "GET",
  });
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  options: Omit<ApiOptions, "method" | "body"> = {}
): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function apiPut<T>(
  path: string,
  body?: unknown,
  options: Omit<ApiOptions, "method" | "body"> = {}
): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    method: "PUT",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function apiPatch<T>(
  path: string,
  body?: unknown,
  options: Omit<ApiOptions, "method" | "body"> = {}
): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    method: "PATCH",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function apiDelete<T>(
  path: string,
  options: Omit<ApiOptions, "method" | "body"> = {}
): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    method: "DELETE",
  });
}
