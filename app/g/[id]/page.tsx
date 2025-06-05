export default function ViewGistPage({
  params: _params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-4 text-2xl font-bold">View Gist</h1>
      <p className="text-muted-foreground">
        This page will display the gist viewer for viewing encrypted gists.
      </p>
    </div>
  );
}
