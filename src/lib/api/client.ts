const DEFAULT_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
};

const HTTP_STATUS_NO_CONTENT = 204;

type NextDataWindow = typeof window & {
  readonly __NEXT_DATA__?: {
    readonly props?: {
      readonly pageProps?: {
        readonly apiBaseUrl?: string;
      };
    };
  };
};

const getApiBaseUrl = (): string => {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:3001";
  }
  const typedWindow = window as NextDataWindow;
  const injected = typedWindow.__NEXT_DATA__?.props?.pageProps?.apiBaseUrl;
  return (
    injected ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:3001"
  );
};

export const apiBaseUrl = getApiBaseUrl();

export type ApiFetchOptions = RequestInit & {
  readonly accessToken?: string;
};

export const apiFetch = async <T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> => {
  const { accessToken, headers, ...rest } = options;
  const mergedHeaders: Record<string, string> = {
    ...DEFAULT_HEADERS,
    ...(headers as Record<string, string> | undefined),
  };

  if (accessToken !== undefined && accessToken !== "") {
    mergedHeaders.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${apiBaseUrl}/api/${path}`, {
    ...rest,
    headers: mergedHeaders,
  });

  if (!response.ok) {
    const message = await safeReadError(response);
    throw new Error(message);
  }

  // 对于 204 No Content 响应,不尝试解析 JSON
  if (
    response.status === HTTP_STATUS_NO_CONTENT ||
    response.headers.get("content-length") === "0"
  ) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

const safeReadError = async (response: Response): Promise<string> => {
  try {
    const payload = await response.json();
    if (typeof payload?.message === "string") {
      return payload.message;
    }
    if (Array.isArray(payload?.message) && payload.message.length > 0) {
      const first = payload.message.at(0);
      if (typeof first === "string") {
        return first;
      }
    }
  } catch (_error) {
    // ignore parse failure and fall back to generic message
  }
  return `Request failed with status ${response.status}`;
};
