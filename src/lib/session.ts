import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE_NAME = "myblog_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const issuer = "myblog";
const audience = "myblog-admin";

const secret = process.env.AUTH_SECRET;

if (!secret) {
  throw new Error("AUTH_SECRET is not set");
}

const secretKey = new TextEncoder().encode(secret);

export type Session = {
  adminId: string;
  username: string;
};

export async function signSessionToken(session: Session): Promise<string> {
  return new SignJWT({
    adminId: session.adminId,
    username: session.username,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secretKey);
}

export async function verifySessionToken(
  token: string,
): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      issuer,
      audience,
    });

    if (
      typeof payload.adminId !== "string" ||
      typeof payload.username !== "string"
    ) {
      return null;
    }

    return {
      adminId: payload.adminId,
      username: payload.username,
    };
  } catch {
    return null;
  }
}
