export default function Home() {
  return (
    <main style={{ fontFamily: "ui-monospace, monospace", padding: 48, maxWidth: 640 }}>
      <h1>Receipts MCP</h1>
      <p>Remote MCP server for the disclosure-check audit. Add this to your MCP client:</p>
      <pre>{`{ "receipts": { "url": "https://<this-host>/api/mcp" } }`}</pre>
    </main>
  );
}
