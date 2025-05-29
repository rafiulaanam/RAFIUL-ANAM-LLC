import { signOut, signIn } from "next-auth/react";

export async function handleLogout() {
  try {
    await signOut({
      redirect: true,
      callbackUrl: "/login"
    });
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

export async function handleLogin(
  credentials: { email: string; password: string } | { provider: string },
  callbackUrl: string = "/"
) {
  try {
    if ('provider' in credentials) {
      return await signIn(credentials.provider, {
        redirect: true,
        callbackUrl,
      });
    } else {
      return await signIn("credentials", {
        ...credentials,
        redirect: false,
        callbackUrl,
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
} 