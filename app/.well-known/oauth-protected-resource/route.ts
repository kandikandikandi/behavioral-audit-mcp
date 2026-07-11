import {
  protectedResourceHandler,
  metadataCorsOptionsRequestHandler,
} from "mcp-handler";

// RFC 9728 Protected Resource Metadata. On a 401 the MCP route points clients
// here (via the WWW-Authenticate resource_metadata hint); this document tells
// them which authorization server to sign in against. That server is our WorkOS
// AuthKit domain, whose /oauth2/* endpoints issue the tokens the MCP route then
// verifies. The resource identifier is derived from the request origin, so it
// stays consistent with the 401 hint on both the vercel.app host and any custom
// domain.
const handler = protectedResourceHandler({
  authServerUrls: ["https://giving-citadel-43.authkit.app"],
});

export { handler as GET };
export const OPTIONS = metadataCorsOptionsRequestHandler();
