import type { BlogPost } from "../types/blog";

type BlogFrontMatter = {
  id?: string;
  title?: string;
  date?: string;
  excerpt?: string;
  tags?: string[];
};

// Load all markdown blog posts at build time as raw strings.
const markdownFiles = import.meta.glob("../posts/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

const FRONT_MATTER_REGEX = /^---\s*\n([\s\S]*?)\n---\s*\n?/;
const ARRAY_FIELDS: Array<keyof BlogFrontMatter> = ["tags"];

function parseFrontMatter(raw: string): { data: BlogFrontMatter; content: string } {
  const match = raw.match(FRONT_MATTER_REGEX);

  if (!match) {
    return {
      data: {},
      content: raw.trim(),
    };
  }

  const frontMatterBlock = match[1];
  const contentStart = match[0].length;

  return {
    data: parseFrontMatterBlock(frontMatterBlock),
    content: raw.slice(contentStart).trim(),
  };
}

function parseFrontMatterBlock(block: string): BlogFrontMatter {
  const lines = block.split(/\r?\n/);
  const data: BlogFrontMatter = {};
  let currentKey: keyof BlogFrontMatter | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    if (line.startsWith("-")) {
      if (!currentKey || !ARRAY_FIELDS.includes(currentKey)) {
        continue;
      }

      const value = line.replace(/^-+\s*/, "").trim();
      const existing = data[currentKey];
      const items = Array.isArray(existing) ? existing : [];
      items.push(cleanValue(value));
      data[currentKey] = items;
      continue;
    }

    const [key, ...rest] = line.split(":");
    const valuePart = rest.join(":").trim();
    const valueKey = key.trim() as keyof BlogFrontMatter;

    if (ARRAY_FIELDS.includes(valueKey)) {
      currentKey = valueKey;
      data[valueKey] = Array.isArray(data[valueKey]) ? data[valueKey] : [];

      if (valuePart) {
        const existing = data[valueKey] as string[];
        existing.push(cleanValue(valuePart));
        data[valueKey] = existing;
      }
      continue;
    }

    currentKey = valueKey;
    data[valueKey] = cleanValue(valuePart);
  }

  return data;
}

function cleanValue(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

export const blogPosts: BlogPost[] = Object.entries(markdownFiles)
  .map(([path, fileContents]) => {
    const { data, content } = parseFrontMatter(fileContents as string);
    const frontMatter = data as BlogFrontMatter;
    const slug =
      frontMatter.id ??
      path.split("/").pop()?.replace(/\.md$/, "") ??
      "untitled";

    return {
      id: slug,
      title: frontMatter.title ?? slug,
      date: frontMatter.date ?? "",
      excerpt: frontMatter.excerpt ?? "",
      tags: Array.isArray(frontMatter.tags)
        ? frontMatter.tags.map((tag) => String(tag))
        : [],
      content: content.trim(),
    };
  })
  .sort((a, b) => {
    const aTime = new Date(a.date).getTime();
    const bTime = new Date(b.date).getTime();

    if (Number.isNaN(aTime) || Number.isNaN(bTime)) {
      return 0;
    }

    return bTime - aTime;
  });
