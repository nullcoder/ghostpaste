import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Gist - GhostPaste",
  description:
    "Create a new encrypted code gist. Your code is encrypted client-side before upload. Set expiration, add passwords, and share securely.",
  openGraph: {
    title: "Create Encrypted Gist - GhostPaste",
    description:
      "Create and share encrypted code snippets. Client-side encryption, custom expiration, password protection. Your code never leaves your browser unencrypted.",
    url: "https://ghostpaste.dev/create",
  },
  twitter: {
    title: "Create Encrypted Gist - GhostPaste",
    description:
      "Create and share encrypted code snippets. Client-side encryption ensures your code stays private.",
  },
};

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
