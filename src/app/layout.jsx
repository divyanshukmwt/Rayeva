import "./globals.css";

export const metadata = {
  title: "Rayeva AI Modules",
  description: "AI-powered catalog and proposal tools for sustainable commerce",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
