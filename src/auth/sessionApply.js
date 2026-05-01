import { buildAuthSession } from "../lib/authSession";
import { tokenMemory } from "./tokenMemory";

/**
 * Persist tokens strictly in module memory then return the safe profile for React state.
 */
export function ingestGatewayLoginPayload(payload) {
  const session = buildAuthSession(payload);
  tokenMemory.setPair(
    typeof session.access_token === "string" ? session.access_token : null,
    typeof session.refresh_token === "string" ? session.refresh_token : null,
  );
  return session.user;
}
