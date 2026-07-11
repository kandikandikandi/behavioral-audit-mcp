import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

// Serves the OAuth discovery metadata MCP clients need to find WorkOS, and keeps
// AuthKit session handling available. MCP auth itself is enforced in the route.
export default authkitMiddleware();

export const config = {
  matcher: ["/", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
