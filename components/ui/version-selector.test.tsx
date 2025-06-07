import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  describe,
  expect,
  it,
  vi,
  beforeAll,
  beforeEach,
  afterEach,
} from "vitest";
import {
  VersionSelector,
  CompactVersionSelector,
  formatVersionTime,
  type Version,
} from "./version-selector";

// Mock for Radix UI Select component
beforeAll(() => {
  Element.prototype.hasPointerCapture = vi.fn();
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
});

const mockVersions: Version[] = [
  {
    version: 3,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    size: 1024,
    file_count: 2,
    edited_with_pin: true,
  },
  {
    version: 2,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    size: 512,
    file_count: 1,
  },
  {
    version: 1,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    size: 256,
    file_count: 1,
  },
];

describe("formatVersionTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-15T15:30:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats just now", () => {
    const timestamp = new Date("2025-01-15T15:29:30Z").toISOString();
    expect(formatVersionTime(timestamp)).toBe("just now");
  });

  it("formats minutes ago", () => {
    const timestamp = new Date("2025-01-15T15:25:00Z").toISOString();
    expect(formatVersionTime(timestamp)).toBe("5 minutes ago");
  });

  it("formats 1 minute ago", () => {
    const timestamp = new Date("2025-01-15T15:29:00Z").toISOString();
    expect(formatVersionTime(timestamp)).toBe("1 minute ago");
  });

  it("formats hours ago", () => {
    const timestamp = new Date("2025-01-15T12:30:00Z").toISOString();
    expect(formatVersionTime(timestamp)).toBe("3 hours ago");
  });

  it("formats 1 hour ago", () => {
    const timestamp = new Date("2025-01-15T14:30:00Z").toISOString();
    expect(formatVersionTime(timestamp)).toBe("1 hour ago");
  });

  it("formats yesterday", () => {
    const timestamp = new Date("2025-01-14T10:15:00Z").toISOString();
    expect(formatVersionTime(timestamp)).toMatch(
      /^Yesterday at \d{1,2}:\d{2} [AP]M$/
    );
  });

  it("formats days ago", () => {
    const timestamp = new Date("2025-01-12T15:30:00Z").toISOString();
    expect(formatVersionTime(timestamp)).toBe("3 days ago");
  });

  it("formats date in same year", () => {
    const timestamp = new Date("2025-01-01T10:15:00Z").toISOString();
    expect(formatVersionTime(timestamp)).toMatch(
      /^Jan 1 at \d{1,2}:\d{2} [AP]M$/
    );
  });

  it("formats date in different year", () => {
    const timestamp = new Date("2024-12-25T10:15:00Z").toISOString();
    expect(formatVersionTime(timestamp)).toMatch(
      /^Dec 25, 2024 at \d{1,2}:\d{2} [AP]M$/
    );
  });
});

describe("VersionSelector", () => {
  const mockOnVersionChange = vi.fn();

  beforeEach(() => {
    mockOnVersionChange.mockClear();
  });

  it("renders null when no versions", () => {
    const { container } = render(
      <VersionSelector
        currentVersion={1}
        versions={[]}
        onVersionChangeAction={mockOnVersionChange}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders single version badge when only one version", () => {
    render(
      <VersionSelector
        currentVersion={1}
        versions={[mockVersions[2]]}
        onVersionChangeAction={mockOnVersionChange}
      />
    );
    expect(screen.getByText("Version 1 (only version)")).toBeInTheDocument();
  });

  it("renders dropdown with multiple versions", () => {
    render(
      <VersionSelector
        currentVersion={3}
        versions={mockVersions}
        onVersionChangeAction={mockOnVersionChange}
      />
    );
    expect(screen.getByText("Version 3 of 3")).toBeInTheDocument();
  });

  it("shows current version badge", async () => {
    const user = userEvent.setup();
    render(
      <VersionSelector
        currentVersion={3}
        versions={mockVersions}
        onVersionChangeAction={mockOnVersionChange}
      />
    );

    const trigger = screen.getByRole("combobox");
    await user.click(trigger);

    // Find the current version item
    const currentItem = screen.getByRole("option", {
      name: /Version 3.*Current/i,
    });
    expect(currentItem).toBeInTheDocument();
  });

  it("shows original badge for version 1", async () => {
    const user = userEvent.setup();
    render(
      <VersionSelector
        currentVersion={3}
        versions={mockVersions}
        onVersionChangeAction={mockOnVersionChange}
      />
    );

    const trigger = screen.getByRole("combobox");
    await user.click(trigger);

    // Find the original version item
    const originalItem = screen.getByRole("option", {
      name: /Version 1.*Original/i,
    });
    expect(originalItem).toBeInTheDocument();
  });

  it("shows lock icon for PIN-edited versions", async () => {
    const user = userEvent.setup();
    render(
      <VersionSelector
        currentVersion={3}
        versions={mockVersions}
        onVersionChangeAction={mockOnVersionChange}
      />
    );

    const trigger = screen.getByRole("combobox");
    await user.click(trigger);

    // Version 3 has edited_with_pin: true
    const version3Option = screen.getByRole("option", { name: /Version 3/i });
    expect(version3Option.querySelector("svg")).toBeInTheDocument();
  });

  it("calls onVersionChange when selecting a version", async () => {
    const user = userEvent.setup();
    render(
      <VersionSelector
        currentVersion={3}
        versions={mockVersions}
        onVersionChangeAction={mockOnVersionChange}
      />
    );

    const trigger = screen.getByRole("combobox");
    await user.click(trigger);

    const version2Option = screen.getByRole("option", { name: /Version 2/i });
    await user.click(version2Option);

    expect(mockOnVersionChange).toHaveBeenCalledWith(2);
  });

  it("disables selector when disabled prop is true", () => {
    render(
      <VersionSelector
        currentVersion={3}
        versions={mockVersions}
        onVersionChangeAction={mockOnVersionChange}
        disabled={true}
      />
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeDisabled();
  });

  it("disables selector when loading prop is true", () => {
    render(
      <VersionSelector
        currentVersion={3}
        versions={mockVersions}
        onVersionChangeAction={mockOnVersionChange}
        loading={true}
      />
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeDisabled();
  });

  it("applies custom className", () => {
    render(
      <VersionSelector
        currentVersion={3}
        versions={mockVersions}
        onVersionChangeAction={mockOnVersionChange}
        className="custom-class"
      />
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveClass("custom-class");
  });

  it("shows file count for each version", async () => {
    const user = userEvent.setup();
    render(
      <VersionSelector
        currentVersion={3}
        versions={mockVersions}
        onVersionChangeAction={mockOnVersionChange}
      />
    );

    const trigger = screen.getByRole("combobox");
    await user.click(trigger);

    expect(screen.getByText("2 files")).toBeInTheDocument();
    expect(screen.getAllByText("1 file")).toHaveLength(2);
  });
});

describe("CompactVersionSelector", () => {
  const mockOnVersionChange = vi.fn();

  beforeEach(() => {
    mockOnVersionChange.mockClear();
  });

  it("renders null when only one version", () => {
    const { container } = render(
      <CompactVersionSelector
        currentVersion={1}
        versions={[mockVersions[2]]}
        onVersionChangeAction={mockOnVersionChange}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders compact version display", () => {
    render(
      <CompactVersionSelector
        currentVersion={3}
        versions={mockVersions}
        onVersionChangeAction={mockOnVersionChange}
      />
    );
    expect(screen.getByText("v3/3")).toBeInTheDocument();
  });

  it("shows current badge in dropdown", async () => {
    const user = userEvent.setup();
    render(
      <CompactVersionSelector
        currentVersion={3}
        versions={mockVersions}
        onVersionChangeAction={mockOnVersionChange}
      />
    );

    const trigger = screen.getByRole("combobox");
    await user.click(trigger);

    const currentItem = screen.getByRole("option", { name: /v3.*Current/i });
    expect(currentItem).toBeInTheDocument();
  });

  it("calls onVersionChange when selecting", async () => {
    const user = userEvent.setup();
    render(
      <CompactVersionSelector
        currentVersion={3}
        versions={mockVersions}
        onVersionChangeAction={mockOnVersionChange}
      />
    );

    const trigger = screen.getByRole("combobox");
    await user.click(trigger);

    const v2Option = screen.getByRole("option", { name: /v2/i });
    await user.click(v2Option);

    expect(mockOnVersionChange).toHaveBeenCalledWith(2);
  });
});
