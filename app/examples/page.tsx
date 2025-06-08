import { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import {
  Code2,
  FileCode,
  Settings,
  Users,
  Briefcase,
  Bug,
  Palette,
  Database,
  Terminal,
  Shield,
  Clock,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { GhostLogo } from "@/components/ghost-logo";

export const metadata: Metadata = {
  title: "Examples - GhostPaste",
  description:
    "Discover how developers use GhostPaste for secure code sharing in different scenarios.",
  openGraph: {
    title: "Use Cases & Examples - GhostPaste",
    description:
      "See how developers use GhostPaste for code reviews, bug reports, interviews, and more. Secure code sharing for every scenario.",
    url: "https://ghostpaste.dev/examples",
  },
  twitter: {
    title: "Use Cases & Examples - GhostPaste",
    description:
      "Code reviews, bug reports, interviews, and more. See how GhostPaste enables secure code sharing.",
  },
};

interface ExampleProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  code: string;
  language: string;
  useCase: string;
  tags: string[];
  security?: "high" | "medium";
  expiry?: string;
}

function ExampleCard({
  title,
  description,
  icon,
  code,
  language,
  useCase,
  tags,
  security = "medium",
  expiry = "1 day",
}: ExampleProps) {
  return (
    <Card className="flex h-full min-w-0 flex-col p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
            {icon}
          </div>
          <h3 className="text-sm font-semibold break-words sm:text-base">
            {title}
          </h3>
        </div>
        {security === "high" && (
          <Badge
            variant="destructive"
            className="w-fit flex-shrink-0 bg-red-600 text-xs text-white dark:bg-red-700 dark:text-white"
          >
            <Shield className="mr-1 h-3 w-3" />
            High Security
          </Badge>
        )}
      </div>

      <p className="text-muted-foreground mb-4 text-sm">{description}</p>

      <div className="bg-muted mb-4 flex-grow rounded-lg p-3 sm:p-4">
        <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <code className="text-muted-foreground text-xs">{language}</code>
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Clock className="h-3 w-3" />
            {expiry}
          </div>
        </div>
        <div className="bg-muted/50 relative overflow-hidden rounded border">
          <div className="absolute top-2 right-2">
            <CopyButton
              value={code}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
            />
          </div>
          <pre className="max-h-48 overflow-x-auto p-3 pr-10 text-xs leading-relaxed">
            <code className="text-foreground font-mono break-words whitespace-pre-wrap sm:whitespace-pre">
              {code}
            </code>
          </pre>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm break-words">
          <span className="font-medium">Best for:</span> {useCase}
        </p>
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs whitespace-nowrap"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default function ExamplesPage() {
  const examples: ExampleProps[] = [
    {
      title: "Code Review Snippets",
      description:
        "Share specific code sections for review without exposing entire codebases",
      icon: <Code2 className="text-primary h-5 w-5" />,
      code: `// Authentication middleware
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ error: "No token" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
  }
}`,
      language: "javascript",
      useCase: "Getting feedback on specific implementations",
      tags: ["code-review", "collaboration", "feedback"],
      expiry: "7 days",
    },
    {
      title: "API Configuration",
      description:
        "Securely share API endpoints and configuration with team members",
      icon: <Settings className="text-primary h-5 w-5" />,
      code: `{
  "api": {
    "baseUrl": "https://api.staging.example.com",
    "version": "v2",
    "endpoints": {
      "auth": "/auth/login",
      "users": "/users",
      "products": "/products"
    },
    "headers": {
      "X-API-Version": "2.0",
      "X-Client-Id": "mobile-app-staging"
    }
  }
}`,
      language: "json",
      useCase: "Sharing environment configs without committing to repo",
      tags: ["config", "api", "staging"],
      security: "high",
      expiry: "1 hour",
    },
    {
      title: "Interview Code Challenge",
      description: "Send coding challenges and receive solutions securely",
      icon: <Briefcase className="text-primary h-5 w-5" />,
      code: `"""
Challenge: Implement a function that finds the longest 
palindromic substring in a given string.

Example:
  Input: "babad"
  Output: "bab" or "aba"
  
  Input: "cbbd"
  Output: "bb"

Constraints:
- 1 <= s.length <= 1000
- s consists of only lowercase English letters
"""

def longest_palindrome(s: str) -> str:
    # Your implementation here
    pass`,
      language: "python",
      useCase: "Technical interviews and coding assessments",
      tags: ["interview", "challenge", "hiring"],
      expiry: "3 days",
    },
    {
      title: "Bug Report with Code",
      description: "Share problematic code snippets when reporting bugs",
      icon: <Bug className="text-primary h-5 w-5" />,
      code: `// BUG: Memory leak in event listener
class DataGrid extends Component {
  componentDidMount() {
    // This listener is never removed!
    window.addEventListener("resize", this.handleResize);
    
    // Fetching data in a loop without cleanup
    this.interval = setInterval(() => {
      fetchData().then(data => {
        this.setState({ data: [...this.state.data, ...data] });
      });
    }, 1000);
  }
  
  handleResize = () => {
    console.log("Resizing...");
  }
  
  // Missing componentWillUnmount cleanup!
}`,
      language: "javascript",
      useCase: "Bug reports with reproduction code",
      tags: ["debugging", "bug-report", "react"],
      expiry: "30 days",
    },
    {
      title: "Database Migrations",
      description: "Share SQL migrations or schema changes for review",
      icon: <Database className="text-primary h-5 w-5" />,
      code: `-- Migration: Add user preferences table
BEGIN TRANSACTION;

CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT "light",
  notifications_enabled BOOLEAN DEFAULT true,
  language VARCHAR(10) DEFAULT "en",
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;`,
      language: "sql",
      useCase: "Database schema reviews before deployment",
      tags: ["database", "migration", "postgresql"],
      security: "high",
      expiry: "1 day",
    },
    {
      title: "CSS Design Tokens",
      description: "Share design system variables and theme configurations",
      icon: <Palette className="text-primary h-5 w-5" />,
      code: `:root {
  /* Colors */
  --primary: #6366f1;
  --primary-hover: #4f46e5;
  --secondary: #8b5cf6;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  
  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "SF Mono", Monaco, Consolas, monospace;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}`,
      language: "css",
      useCase: "Sharing design tokens with developers",
      tags: ["design-system", "css", "theme"],
      expiry: "7 days",
    },
    {
      title: "Shell Scripts",
      description: "Share deployment or automation scripts securely",
      icon: <Terminal className="text-primary h-5 w-5" />,
      code: `#!/bin/bash
# Deployment script for production

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Check environment
if [ "$NODE_ENV" != "production" ]; then
  echo "❌ Error: NODE_ENV must be 'production'"
  exit 1
fi

# Build the application
echo "📦 Building application..."
npm run build

# Run tests
echo "🧪 Running tests..."
npm test

# Deploy to server
echo "📤 Deploying to production..."
rsync -avz --delete ./dist/ user@server:/var/www/app/

# Restart services
echo "🔄 Restarting services..."
ssh user@server "sudo systemctl restart nginx && sudo systemctl restart app"

echo "✅ Deployment complete!"`,
      language: "bash",
      useCase: "Sharing deployment scripts with DevOps team",
      tags: ["devops", "bash", "deployment"],
      security: "high",
      expiry: "1 hour",
    },
    {
      title: "Error Stack Traces",
      description: "Share error logs and stack traces for debugging",
      icon: <FileCode className="text-primary h-5 w-5" />,
      code: `TypeError: Cannot read properties of undefined (reading "map")
    at ProfileList (ProfileList.tsx:45:23)
    at renderWithHooks (react-dom.development.js:14985:18)
    at updateFunctionComponent (react-dom.development.js:17356:20)
    at beginWork (react-dom.development.js:19063:16)
    at HTMLUnknownElement.callCallback (react-dom.development.js:3945:14)
    at Object.invokeGuardedCallbackDev (react-dom.development.js:3994:16)
    
Component Stack:
    in ProfileList (at Dashboard.tsx:128)
    in div (at Dashboard.tsx:125)
    in Dashboard (at App.tsx:45)
    in Route (at App.tsx:44)
    in Switch (at App.tsx:41)
    in Router (at App.tsx:40)
    in App (at src/index.tsx:18)`,
      language: "text",
      useCase: "Debugging production errors with team",
      tags: ["debugging", "error", "stack-trace"],
      expiry: "1 day",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="from-background to-muted/20 relative overflow-hidden bg-gradient-to-b py-8 sm:py-12">
        <Container>
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <div className="mb-4 inline-flex items-center justify-center">
              <GhostLogo
                size="lg"
                className="text-indigo-600 dark:text-indigo-400"
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Use Cases & Examples
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              See how developers use GhostPaste to share code securely in
              real-world scenarios
            </p>
          </div>
        </Container>
      </section>

      {/* Quick Stats */}
      <section className="border-b py-6 sm:py-8">
        <Container>
          <div className="grid grid-cols-2 gap-4 text-center sm:flex sm:flex-wrap sm:justify-center sm:gap-8">
            <div>
              <div className="text-primary text-lg font-bold sm:text-2xl">
                One-Time View
              </div>
              <div className="text-muted-foreground text-xs sm:text-sm">
                For passwords & secrets
              </div>
            </div>
            <div>
              <div className="text-primary text-lg font-bold sm:text-2xl">
                1 Hour
              </div>
              <div className="text-muted-foreground text-xs sm:text-sm">
                For sensitive configs
              </div>
            </div>
            <div>
              <div className="text-primary text-lg font-bold sm:text-2xl">
                7 Days
              </div>
              <div className="text-muted-foreground text-xs sm:text-sm">
                For code reviews
              </div>
            </div>
            <div>
              <div className="text-primary text-lg font-bold sm:text-2xl">
                30 Days
              </div>
              <div className="text-muted-foreground text-xs sm:text-sm">
                For documentation
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Examples Grid */}
      <section className="py-8 sm:py-12">
        <Container>
          <div className="mx-auto max-w-6xl">
            <div className="grid min-w-0 auto-rows-fr gap-4 sm:gap-6 lg:grid-cols-2">
              {examples.map((example, index) => (
                <div key={index} className="min-w-0">
                  <ExampleCard {...example} />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Best Practices */}
      <section className="bg-muted/30 border-y py-8 sm:py-12">
        <Container>
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-center text-xl font-bold sm:mb-8 sm:text-2xl">
              Best Practices by Use Case
            </h2>

            <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
              <Card className="p-4 sm:p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h3 className="text-sm font-semibold sm:text-base">
                    Public Sharing
                  </h3>
                </div>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  <li>• Remove sensitive data</li>
                  <li>• Use longer expiry times</li>
                  <li>• No production secrets</li>
                  <li>• Sanitize file paths</li>
                </ul>
              </Card>

              <Card className="p-4 sm:p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-semibold sm:text-base">
                    Team Sharing
                  </h3>
                </div>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  <li>• Set appropriate expiry</li>
                  <li>• Use passwords for editing</li>
                  <li>• Share via secure channels</li>
                  <li>• Document the context</li>
                </ul>
              </Card>

              <Card className="p-4 sm:p-6">
                <div className="mb-3 flex items-center gap-2">
                  <EyeOff className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <h3 className="text-sm font-semibold sm:text-base">
                    Sensitive Data
                  </h3>
                </div>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  <li>• Use one-time view</li>
                  <li>• Set 1-hour expiry</li>
                  <li>• Verify recipient first</li>
                  <li>• Never post publicly</li>
                </ul>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-8 sm:py-12">
        <Container>
          <div className="mx-auto max-w-2xl space-y-4 text-center sm:space-y-6">
            <h2 className="text-xl font-bold sm:text-2xl">
              Ready to Share Your Code Securely?
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Join thousands of developers who trust GhostPaste for secure code
              sharing. No account needed, just paste and go.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/create">
                  Start Sharing Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                <Link href="/security">
                  <Shield className="mr-2 h-4 w-4" />
                  Learn About Security
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
