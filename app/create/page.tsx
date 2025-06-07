import { Container } from "@/components/ui/container";

export default function CreateGistPage() {
  return (
    <Container className="py-8">
      <h1 className="mb-4 text-2xl font-bold">Create New Gist</h1>
      <p className="text-muted-foreground">
        This page will contain the form for creating encrypted gists.
      </p>
    </Container>
  );
}
