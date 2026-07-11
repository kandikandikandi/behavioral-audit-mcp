import { createMcpHandler, experimental_withMcpAuth } from "mcp-handler";
import { getWorkOS } from "@workos-inc/authkit-nextjs";
import { jwtVerify, createRemoteJWKSet } from "jose";
import { z } from "zod";

// WorkOS AuthKit is the OAuth authorization server. This MCP server is the
// protected resource: it verifies the WorkOS-issued JWT and maps the user to the
// engine's per-user meter. Pattern follows workos/vercel-mcp-example.
const clientId = process.env.WORKOS_CLIENT_ID;
if (!clientId) throw new Error("WORKOS_CLIENT_ID not set");

const JWKS = createRemoteJWKSet(new URL(`https://api.workos.com/sso/jwks/${clientId}`));
const workos = getWorkOS();

const ENGINE = process.env.RECEIPTS_ENGINE_URL ?? "https://behavioral-audit.vercel.app";
const ENGINE_KEY = process.env.RECEIPTS_ENGINE_KEY ?? "";

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "disclosure_check",
      {
        title: "Disclosure Check",
        description:
          "Check a draft support reply for disclosure gaps before sending it. " +
          "Given what the customer said and the reply you are about to send, it " +
          "flags any should-know policy the customer's situation made relevant that " +
          "the draft failed to proactively surface (the knew-but-did-not-say gap). " +
          "Returns a verdict (pass or gap); on a gap, each missed policy and the line " +
          "that should have been surfaced. It detects and suggests, it does not rewrite.",
        inputSchema: {
          customer_message: z.string().describe("What the customer said, verbatim."),
          draft_reply: z.string().describe("The reply you are about to send."),
        },
      },
      async ({ customer_message, draft_reply }, extra) => {
        // The authenticated WorkOS user (from verifyToken) buckets the meter.
        const user = (extra?.authInfo?.extra as { user?: { id: string } } | undefined)?.user;
        const res = await fetch(`${ENGINE}/check`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ENGINE_KEY}`,
            ...(user?.id ? { "X-Receipts-User": user.id } : {}),
          },
          body: JSON.stringify({ customer_message, draft_reply }),
        });
        const data = await res.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
    );
  },
  {},
  { basePath: "/api", maxDuration: 60, verboseLogs: true }
);

// Open + free for now (no login required). A valid WorkOS token still buckets
// the meter per user when present, but no token (or an unrecognized one) simply
// runs anonymously against the shared free-tier engine key , never a 401. Flip
// `required` back to true (and drop the catch) to re-gate behind WorkOS later.
const authHandler = experimental_withMcpAuth(
  handler,
  async (_req, token) => {
    if (!token) return undefined;
    try {
      const { payload } = await jwtVerify(token, JWKS);
      if (!payload.sub) return undefined;
      const u = await workos.userManagement.getUser(payload.sub as string);
      return {
        token,
        clientId: clientId!,
        scopes: [],
        extra: { user: { id: u.id, email: u.email }, claims: payload },
      };
    } catch {
      return undefined; // unrecognized token -> treat as anonymous, do not 401
    }
  },
  { required: false }
);

export { authHandler as GET, authHandler as POST };
