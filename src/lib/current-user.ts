import { cookies } from "next/headers";
import { findUserById } from "@/models/users";
import { normalizeRole, readSessionToken, SESSION_COOKIE_NAME, type SessionUser } from "@/lib/session";

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const session = await readSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    return null;
  }

  const user = await findUserById(session.id);

  if (!user) {
    return null;
  }

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: normalizeRole(user.role),
  };
}
