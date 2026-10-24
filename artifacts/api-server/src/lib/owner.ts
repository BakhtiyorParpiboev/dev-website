import { clerkClient, getAuth } from "@clerk/express";
import type { Request, RequestHandler } from "express";

// Fail closed: there is no first-user-wins or client-settable admin role.
export async function ownerState(req: Request) {
  const userId = getAuth(req).userId;
  const ownerEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const state = { signedIn: !!userId, isAdmin: false, ownerConfigured: !!ownerEmail };
  if (!userId || !ownerEmail) return state;
  const user = await clerkClient.users.getUser(userId);
  state.isAdmin = user.emailAddresses.some(
    email => email.verification?.status === "verified" && email.emailAddress.toLowerCase() === ownerEmail,
  );
  return state;
}

export const requireOwner: RequestHandler = async (req, res, next) => {
  const state = await ownerState(req);
  if (!state.signedIn) { res.status(401).json({ error: "Sign in to continue." }); return; }
  if (!state.isAdmin) { res.status(403).json({ error: "Only the configured website owner may edit content." }); return; }
  next();
};
