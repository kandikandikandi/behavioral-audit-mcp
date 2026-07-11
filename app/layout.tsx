export const metadata = { title: "Receipts MCP", description: "Remote MCP disclosure-check server" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
