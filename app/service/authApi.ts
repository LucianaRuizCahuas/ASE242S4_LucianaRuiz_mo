import { apiClient, setBasicCredentials, setBearerToken } from "./apiConfig";

export type LoginPayload = {
  usernameOrEmail: string;
  password: string;
};

const getTokenFromData = (data: any): string => {
  if (typeof data === "string") {
    return data;
  }

  return (
    data?.token ||
    data?.accessToken ||
    data?.jwt ||
    data?.bearerToken ||
    data?.data?.token ||
    data?.data?.accessToken ||
    data?.user?.token ||
    ""
  );
};

const getTokenFromHeader = (authorization?: string): string => {
  if (!authorization) {
    return "";
  }

  return authorization.replace(/^Bearer\s+/i, "");
};

export const login = async (payload: LoginPayload) => {
  const credential = payload.usernameOrEmail.trim();
  const authPayloads = [
    { username: credential, password: payload.password },
    { email: credential, password: payload.password },
    { userName: credential, password: payload.password },
  ];

  let lastError: any = null;

  for (const authPayload of authPayloads) {
    try {
      const response = await apiClient.post("/auth/login", authPayload);
      const token =
        getTokenFromData(response.data) ||
        getTokenFromHeader(response.headers.authorization);

      if (typeof token === "string" && token.trim()) {
        setBearerToken(token.trim());
      }

      return response.data;
    } catch (error: any) {
      lastError = error;

      if (error?.response?.status !== 400 && error?.response?.status !== 401) {
        throw error;
      }
    }
  }

  setBasicCredentials(credential, payload.password);

  try {
    await apiClient.get("/customer/state/true");
    return { username: credential, authType: "basic" };
  } catch {
    throw lastError;
  }
};
