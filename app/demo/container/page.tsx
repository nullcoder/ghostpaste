"use client";

import { Container } from "@/components/ui/container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ContainerDemo() {
  return (
    <div className="space-y-12 py-8">
      {/* Hero Section */}
      <section className="bg-muted/50 py-12">
        <Container>
          <h1 className="text-4xl font-bold tracking-tight">
            Container Component Demo
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Explore the different container variants and their responsive
            behavior.
          </p>
        </Container>
      </section>

      {/* Default Container */}
      <section>
        <Container>
          <Card>
            <CardHeader>
              <CardTitle>Default Container (max-width: 1280px)</CardTitle>
              <CardDescription>
                The standard container width for most content. Provides optimal
                reading experience on large screens while maintaining
                consistency.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted h-32 rounded-md p-4">
                <p className="text-muted-foreground text-sm">
                  Resize your browser to see responsive padding changes:
                  <br />• Mobile: 16px padding
                  <br />• Tablet (768px+): 32px padding
                  <br />• Desktop (1024px+): 48px padding
                </p>
              </div>
            </CardContent>
          </Card>
        </Container>
      </section>

      {/* Narrow Container */}
      <section>
        <Container variant="narrow">
          <Card>
            <CardHeader>
              <CardTitle>Narrow Container (max-width: 768px)</CardTitle>
              <CardDescription>
                Perfect for text-heavy content like documentation or blog posts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted h-32 rounded-md p-4">
                <p className="text-muted-foreground text-sm">
                  This container is narrower, making it ideal for long-form text
                  content where line length should be limited for better
                  readability.
                </p>
              </div>
            </CardContent>
          </Card>
        </Container>
      </section>

      {/* Wide Container */}
      <section>
        <Container variant="wide">
          <Card>
            <CardHeader>
              <CardTitle>Wide Container (max-width: 1536px)</CardTitle>
              <CardDescription>
                For content that needs more horizontal space, like dashboards or
                data tables.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted h-32 rounded-md p-4">
                <p className="text-muted-foreground text-sm">
                  This wider container provides more space for complex layouts
                  and side-by-side content arrangements.
                </p>
              </div>
            </CardContent>
          </Card>
        </Container>
      </section>

      {/* Full Width Container */}
      <section className="bg-muted/30 py-8">
        <Container variant="full">
          <Card>
            <CardHeader>
              <CardTitle>Full Width Container (max-width: 100%)</CardTitle>
              <CardDescription>
                Takes up the entire viewport width with consistent padding.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted h-32 rounded-md p-4">
                <p className="text-muted-foreground text-sm">
                  This container spans the full width of the viewport while
                  maintaining the responsive padding scale. Useful for hero
                  sections or full-bleed designs.
                </p>
              </div>
            </CardContent>
          </Card>
        </Container>
      </section>

      {/* Prose Container */}
      <section>
        <Container variant="narrow" prose>
          <h2>Container with Prose Typography</h2>
          <p>
            When the <code>prose</code> prop is enabled, the container applies
            optimized typography styles for text content. This includes proper
            line heights, spacing between elements, and font sizes that enhance
            readability.
          </p>
          <h3>Why Use Prose?</h3>
          <p>
            The prose variant is perfect for documentation, blog posts, or any
            content where typography and readability are paramount. It
            automatically styles:
          </p>
          <ul>
            <li>Headings with appropriate sizes and spacing</li>
            <li>Paragraphs with optimal line height</li>
            <li>Lists with proper indentation</li>
            <li>Code blocks and inline code</li>
            <li>Links with consistent styling</li>
          </ul>
          <blockquote>
            <p>
              &ldquo;Good typography is invisible. Bad typography is
              everywhere.&rdquo;
              <br />
              <em>— Oliver Reichenstein</em>
            </p>
          </blockquote>
          <h3>Implementation</h3>
          <p>
            Simply add the <code>prose</code> prop to any container variant:
          </p>
          <pre>
            <code>{`<Container variant="narrow" prose>
  <h1>Your Article Title</h1>
  <p>Your content here...</p>
</Container>`}</code>
          </pre>
        </Container>
      </section>

      {/* Custom Styling Example */}
      <section>
        <Container className="py-12">
          <Card>
            <CardHeader>
              <CardTitle>Custom Styling</CardTitle>
              <CardDescription>
                The Container component accepts custom classes via the className
                prop.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This container has additional vertical padding applied through
                custom classes, demonstrating how you can extend the base styles
                while maintaining the responsive behavior.
              </p>
            </CardContent>
          </Card>
        </Container>
      </section>

      {/* Nested Containers */}
      <section className="bg-muted/50 py-12">
        <Container>
          <h2 className="mb-6 text-2xl font-bold">Nested Containers</h2>
          <Container variant="narrow" className="bg-background rounded-lg p-8">
            <p className="text-muted-foreground">
              Containers can be nested when you need different max-widths within
              a section. This inner container has a narrow variant while the
              outer uses the default width.
            </p>
          </Container>
        </Container>
      </section>

      {/* Semantic HTML Example */}
      <Container as="article" variant="narrow" prose className="my-12">
        <h2>Semantic HTML Support</h2>
        <p>
          The Container component supports the <code>as</code> prop, allowing
          you to render it as any HTML element. This example renders as an{" "}
          <code>&lt;article&gt;</code>
          element, improving semantic structure and accessibility.
        </p>
        <p>Common use cases include:</p>
        <ul>
          <li>
            <code>section</code> for page sections
          </li>
          <li>
            <code>article</code> for blog posts or articles
          </li>
          <li>
            <code>main</code> for main content areas
          </li>
          <li>
            <code>aside</code> for sidebars or related content
          </li>
        </ul>
      </Container>
    </div>
  );
}
