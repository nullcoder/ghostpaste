"use client";

import {
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { EditorState, Extension, Compartment } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, placeholder } from "@codemirror/view";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import {
  indentOnInput,
  bracketMatching,
  foldGutter,
} from "@codemirror/language";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { autocompletion, closeBrackets } from "@codemirror/autocomplete";
import { highlightActiveLine } from "@codemirror/view";

// Language imports
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { python } from "@codemirror/lang-python";
import { markdown } from "@codemirror/lang-markdown";
import { sql } from "@codemirror/lang-sql";
import { xml } from "@codemirror/lang-xml";
import { yaml } from "@codemirror/lang-yaml";

// Theme imports
import { oneDark } from "@codemirror/theme-one-dark";
import { githubLight } from "@uiw/codemirror-theme-github";

import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

// Language mode mapping
const languageModes: Record<string, () => Extension> = {
  javascript,
  typescript: javascript,
  jsx: javascript,
  tsx: javascript,
  html,
  css,
  scss: css,
  json,
  python,
  markdown,
  sql,
  xml,
  yaml,
  yml: yaml,
};

export interface CodeEditorProps {
  /** The code content */
  value?: string;
  /** Callback when content changes */
  onChange?: (value: string) => void;
  /** Programming language for syntax highlighting */
  language?: string;
  /** Placeholder text when empty */
  placeholder?: string;
  /** Whether the editor is read-only */
  readOnly?: boolean;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
  /** Whether to enable word wrap */
  wordWrap?: boolean;
  /** Custom class name */
  className?: string;
  /** Height of the editor */
  height?: string;
  /** Theme override (defaults to system theme) */
  theme?: "light" | "dark";
}

export interface CodeEditorHandle {
  /** Get the current editor value */
  getValue: () => string;
  /** Replace the editor content */
  setValue: (val: string) => void;
  /** Focus the editor */
  focus: () => void;
}

// Create compartments for dynamic configuration
const languageCompartment = new Compartment();
const themeCompartment = new Compartment();
const readOnlyCompartment = new Compartment();
const lineNumbersCompartment = new Compartment();
const lineWrappingCompartment = new Compartment();

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(
  function CodeEditor(
    {
      value = "",
      onChange,
      language = "javascript",
      placeholder: placeholderText = "Enter your code here...",
      readOnly = false,
      showLineNumbers = true,
      wordWrap = false,
      className,
      height = "400px",
      theme: themeOverride,
    }: CodeEditorProps,
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const { resolvedTheme } = useTheme();

    // Store the onChange callback in a ref to avoid stale closures
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    useImperativeHandle(
      ref,
      () => ({
        getValue: () => viewRef.current?.state.doc.toString() ?? "",
        setValue: (val: string) => {
          if (!viewRef.current) return;
          const current = viewRef.current.state.doc.toString();
          if (val !== current) {
            viewRef.current.dispatch({
              changes: { from: 0, to: current.length, insert: val },
            });
          }
        },
        focus: () => {
          viewRef.current?.focus();
        },
      }),
      []
    );

    // Determine the active theme - use resolvedTheme which handles system theme properly
    const activeTheme = themeOverride || resolvedTheme || "light";

    // Get language extension
    const getLanguageExtension = useCallback((lang: string) => {
      const langKey = lang.toLowerCase();

      // For plain text, don't use any language extension
      if (langKey === "text") {
        return [];
      }

      const langFunc = languageModes[langKey];
      return langFunc ? langFunc() : [];
    }, []);

    // Get theme extension
    const getThemeExtension = useCallback((theme: string) => {
      return theme === "dark" ? oneDark : githubLight;
    }, []);

    // Create base extensions that don't change
    const baseExtensions = useMemo(
      () => [
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        keymap.of([...defaultKeymap, ...searchKeymap, indentWithTab]),
        placeholder(placeholderText),
        EditorView.theme({
          "&": {
            fontSize: "14px",
            height: height === "auto" ? "auto" : height,
            fontFamily:
              "var(--font-geist-mono), ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
          },
          ".cm-content": {
            padding: "12px",
            fontFamily: "inherit",
          },
          ".cm-focused": {
            outline: "none",
          },
          "&.cm-editor.cm-focused": {
            outline: "2px solid var(--color-ring)",
            outlineOffset: "2px",
          },
          ".cm-placeholder": {
            color: "var(--color-muted-foreground)",
            fontStyle: "italic",
          },
          ".cm-cursor": {
            borderLeftWidth: "2px",
          },
          ".cm-scroller": {
            fontFamily: "inherit",
            lineHeight: "1.5",
          },
          ".cm-gutters": {
            fontFamily: "inherit",
          },
        }),
      ],
      [placeholderText, height]
    );

    // Initialize the editor
    useEffect(() => {
      if (!containerRef.current || viewRef.current) return;

      // Debounced onChange for performance
      let changeTimeout: ReturnType<typeof setTimeout>;

      // Determine theme for initialization - prefer resolved theme but fallback to system preference
      const initTheme =
        resolvedTheme ||
        (typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light");

      // Create extensions with compartments
      const extensions = [
        ...baseExtensions,
        languageCompartment.of(getLanguageExtension(language)),
        themeCompartment.of(getThemeExtension(initTheme)),
        readOnlyCompartment.of(EditorState.readOnly.of(readOnly)),
        lineNumbersCompartment.of(
          showLineNumbers ? [lineNumbers(), foldGutter()] : []
        ),
        lineWrappingCompartment.of(wordWrap ? EditorView.lineWrapping : []),
        // Add debounced change listener
        EditorView.updateListener.of((update) => {
          if (update.docChanged && onChangeRef.current) {
            clearTimeout(changeTimeout);
            changeTimeout = setTimeout(() => {
              onChangeRef.current?.(update.state.doc.toString());
            }, 300); // 300ms debounce
          }
        }),
      ];

      // Create editor state
      const state = EditorState.create({
        doc: value,
        extensions,
      });

      // Create editor view
      const view = new EditorView({
        state,
        parent: containerRef.current,
      });

      const handleBlur = () => {
        if (onChangeRef.current) {
          onChangeRef.current(view.state.doc.toString());
        }
      };

      view.dom.addEventListener("blur", handleBlur);

      viewRef.current = view;

      // Cleanup
      return () => {
        clearTimeout(changeTimeout);
        view.dom.removeEventListener("blur", handleBlur);
        view.destroy();
        viewRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount - we handle all updates through compartments

    // Update language
    useEffect(() => {
      if (!viewRef.current) return;

      viewRef.current.dispatch({
        effects: languageCompartment.reconfigure(
          getLanguageExtension(language)
        ),
      });
    }, [language, getLanguageExtension]);

    // Update theme
    useEffect(() => {
      if (!viewRef.current) return;

      viewRef.current.dispatch({
        effects: themeCompartment.reconfigure(getThemeExtension(activeTheme)),
      });
    }, [activeTheme, getThemeExtension]);

    // Update read-only state
    useEffect(() => {
      if (!viewRef.current) return;

      viewRef.current.dispatch({
        effects: readOnlyCompartment.reconfigure(
          EditorState.readOnly.of(readOnly)
        ),
      });
    }, [readOnly]);

    // Update line numbers
    useEffect(() => {
      if (!viewRef.current) return;

      viewRef.current.dispatch({
        effects: lineNumbersCompartment.reconfigure(
          showLineNumbers ? [lineNumbers(), foldGutter()] : []
        ),
      });
    }, [showLineNumbers]);

    // Update line wrapping
    useEffect(() => {
      if (!viewRef.current) return;

      viewRef.current.dispatch({
        effects: lineWrappingCompartment.reconfigure(
          wordWrap ? EditorView.lineWrapping : []
        ),
      });
    }, [wordWrap]);

    // Update content when value changes from outside
    useEffect(() => {
      if (!viewRef.current) return;

      const currentValue = viewRef.current.state.doc.toString();
      if (value !== currentValue) {
        // Use transaction to update the document
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentValue.length,
            insert: value,
          },
        });
      }
    }, [value]);

    return (
      <div
        ref={containerRef}
        className={cn(
          "bg-background overflow-hidden rounded-lg border",
          "focus-within:ring-ring focus-within:ring-2 focus-within:ring-offset-2",
          readOnly && "opacity-80",
          className
        )}
      />
    );
  }
);
