import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Gist ${id} - GhostPaste`,
    description:
      "View encrypted code gist. This content is encrypted and can only be decrypted with the proper key.",
    openGraph: {
      title: `Encrypted Gist - GhostPaste`,
      description:
        "This gist contains encrypted code. Visit the link with the decryption key to view the content.",
      url: `https://ghostpaste.dev/g/${id}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `Encrypted Gist - GhostPaste`,
      description:
        "This gist contains encrypted code. The decryption key is required to view.",
    },
    robots: {
      index: false, // Don't index individual gists for privacy
      follow: true,
    },
  };
}

export default function GistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
