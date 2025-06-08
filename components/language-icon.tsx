import {
  FileCode,
  Code2,
  Database,
  Terminal,
  Palette,
  Globe,
  Settings,
  Coffee,
} from "lucide-react";

const languageIcons: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  javascript: { icon: Coffee, color: "text-yellow-500" },
  typescript: { icon: Code2, color: "text-blue-500" },
  python: { icon: Code2, color: "text-green-500" },
  java: { icon: Coffee, color: "text-orange-500" },
  cpp: { icon: Code2, color: "text-blue-600" },
  c: { icon: Code2, color: "text-gray-600" },
  rust: { icon: Settings, color: "text-orange-600" },
  go: { icon: Code2, color: "text-blue-400" },
  php: { icon: Code2, color: "text-purple-500" },
  ruby: { icon: Code2, color: "text-red-500" },
  swift: { icon: Code2, color: "text-orange-400" },
  kotlin: { icon: Code2, color: "text-purple-600" },
  dart: { icon: Code2, color: "text-blue-500" },
  scala: { icon: Code2, color: "text-red-600" },

  // Web technologies
  html: { icon: Globe, color: "text-orange-500" },
  css: { icon: Palette, color: "text-blue-500" },
  scss: { icon: Palette, color: "text-pink-500" },
  sass: { icon: Palette, color: "text-pink-400" },
  less: { icon: Palette, color: "text-blue-600" },

  // Data & Config
  json: { icon: Settings, color: "text-yellow-600" },
  yaml: { icon: Settings, color: "text-red-400" },
  yml: { icon: Settings, color: "text-red-400" },
  toml: { icon: Settings, color: "text-orange-400" },
  xml: { icon: Settings, color: "text-green-600" },

  // Database
  sql: { icon: Database, color: "text-blue-600" },

  // Shell & Scripts
  bash: { icon: Terminal, color: "text-green-400" },
  shell: { icon: Terminal, color: "text-green-400" },
  sh: { icon: Terminal, color: "text-green-400" },
  zsh: { icon: Terminal, color: "text-green-400" },
  fish: { icon: Terminal, color: "text-green-400" },
  powershell: { icon: Terminal, color: "text-blue-400" },

  // Default
  text: { icon: FileCode, color: "text-gray-500" },
  plaintext: { icon: FileCode, color: "text-gray-500" },
  markdown: { icon: FileCode, color: "text-gray-600" },
  md: { icon: FileCode, color: "text-gray-600" },
};

interface LanguageIconProps {
  language: string;
  className?: string;
}

export function LanguageIcon({
  language,
  className = "h-4 w-4",
}: LanguageIconProps) {
  const normalizedLang = language.toLowerCase();
  const config = languageIcons[normalizedLang] || languageIcons.text;
  const Icon = config.icon;

  return <Icon className={`${config.color} ${className}`} />;
}

export function getLanguageConfig(language: string) {
  const normalizedLang = language.toLowerCase();
  return languageIcons[normalizedLang] || languageIcons.text;
}
