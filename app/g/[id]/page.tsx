import { Container } from "@/components/ui/container";

export default async function ViewGistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Container className="py-8">
      <h1 className="mb-4 text-2xl font-bold">View Gist</h1>
      <p className="text-muted-foreground">
        This page will display the gist viewer for viewing encrypted gists.
      </p>
      <p className="text-muted-foreground mt-2 text-sm">Gist ID: {id}</p>
    </Container>
  );
}
