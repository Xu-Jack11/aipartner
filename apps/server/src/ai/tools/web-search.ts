export type WebSearchResult = {
  readonly title: string;
  readonly url: string;
  readonly snippet: string;
};

type DuckDuckGoResult = {
  // biome-ignore lint/style/useNamingConvention: DuckDuckGo API field name
  readonly Text?: string;
  // biome-ignore lint/style/useNamingConvention: DuckDuckGo API field name
  readonly FirstURL?: string;
  // biome-ignore lint/style/useNamingConvention: DuckDuckGo API field name
  readonly Result?: string;
};

type DuckDuckGoTopic = DuckDuckGoResult & {
  // biome-ignore lint/style/useNamingConvention: DuckDuckGo API field name
  readonly Topics?: readonly DuckDuckGoTopic[];
};

type DuckDuckGoResponse = {
  // biome-ignore lint/style/useNamingConvention: DuckDuckGo API field name
  readonly AbstractText?: string;
  // biome-ignore lint/style/useNamingConvention: DuckDuckGo API field name
  readonly Heading?: string;
  // biome-ignore lint/style/useNamingConvention: DuckDuckGo API field name
  readonly RelatedTopics?: readonly DuckDuckGoTopic[];
  // biome-ignore lint/style/useNamingConvention: DuckDuckGo API field name
  readonly Results?: readonly DuckDuckGoResult[];
};

const sanitizeSnippet = (text: string | undefined): string => {
  if (!text) {
    return "";
  }

  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const extractTitleAndSnippet = (
  text: string | undefined
): { readonly title: string; readonly snippet: string } | undefined => {
  if (!text) {
    return;
  }

  const sanitized = sanitizeSnippet(text);
  if (sanitized.length === 0) {
    return;
  }

  const [title, ...rest] = sanitized.split(" - ");
  const snippet = rest.length > 0 ? rest.join(" - ") : sanitized;

  return {
    snippet,
    title: title.trim().length > 0 ? title.trim() : sanitized,
  };
};

const flattenTopics = (
  topics: readonly DuckDuckGoTopic[] | undefined,
  seen: Set<string>
): WebSearchResult[] => {
  if (!topics) {
    return [];
  }

  const results: WebSearchResult[] = [];

  const walk = (items: readonly DuckDuckGoTopic[]) => {
    for (const item of items) {
      if (item.Topics) {
        walk(item.Topics);
        continue;
      }

      const parsed = extractTitleAndSnippet(item.Text);
      const url = item.FirstURL?.trim();

      if (!(parsed && url)) {
        continue;
      }

      if (seen.has(url)) {
        continue;
      }

      results.push({
        snippet: parsed.snippet,
        title: parsed.title,
        url,
      });
      seen.add(url);
    }
  };

  walk(topics);
  return results;
};

const addPrimaryResults = (
  source: readonly DuckDuckGoResult[] | undefined,
  results: WebSearchResult[],
  seen: Set<string>
) => {
  if (!Array.isArray(source)) {
    return;
  }

  for (const item of source) {
    const parsed = extractTitleAndSnippet(item.Text);
    const url = item.FirstURL?.trim();

    if (!(parsed && url)) {
      continue;
    }

    if (seen.has(url)) {
      continue;
    }

    seen.add(url);
    results.push({
      snippet: parsed.snippet,
      title: parsed.title,
      url,
    });
  }
};

const appendFallbackResult = (
  data: DuckDuckGoResponse,
  results: WebSearchResult[],
  query: string
) => {
  if (results.length > 0 || !data.AbstractText) {
    return;
  }

  const parsedAbstract = extractTitleAndSnippet(data.AbstractText);
  if (!parsedAbstract) {
    return;
  }

  results.push({
    snippet: parsedAbstract.snippet,
    title: data.Heading ?? parsedAbstract.title,
    url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
  });
};

export const fetchWebSearchResults = async (
  query: string,
  limit = 3
): Promise<WebSearchResult[]> => {
  const trimmedQuery = query.trim();
  if (trimmedQuery.length === 0) {
    return [];
  }

  const url = new URL("https://api.duckduckgo.com/");
  url.searchParams.set("q", trimmedQuery);
  url.searchParams.set("format", "json");
  url.searchParams.set("no_html", "1");
  url.searchParams.set("no_redirect", "1");

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
    },
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`DuckDuckGo API error: ${response.status}`);
  }

  const data = (await response.json()) as DuckDuckGoResponse;
  const results: WebSearchResult[] = [];
  const seenUrls = new Set<string>();

  addPrimaryResults(data.Results, results, seenUrls);
  results.push(...flattenTopics(data.RelatedTopics, seenUrls));
  appendFallbackResult(data, results, trimmedQuery);

  return results.slice(0, limit);
};

export const fetchWebSearchContext = async (
  query: string,
  limit = 3
): Promise<string | undefined> => {
  const results = await fetchWebSearchResults(query, limit);
  if (results.length === 0) {
    return;
  }

  return results
    .map((result, index) =>
      [
        `${index + 1}. ${result.title}`,
        `链接：${result.url}`,
        `摘要：${result.snippet}`,
      ]
        .filter(Boolean)
        .join("\n")
    )
    .join("\n\n");
};
