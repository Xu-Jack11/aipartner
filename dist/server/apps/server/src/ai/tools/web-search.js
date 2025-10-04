"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWebSearchContext = exports.fetchWebSearchResults = void 0;
const sanitizeSnippet = (text) => {
    if (!text) {
        return "";
    }
    return text
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
};
const extractTitleAndSnippet = (text) => {
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
const flattenTopics = (topics, seen) => {
    if (!topics) {
        return [];
    }
    const results = [];
    const walk = (items) => {
        var _a;
        for (const item of items) {
            if (item.Topics) {
                walk(item.Topics);
                continue;
            }
            const parsed = extractTitleAndSnippet(item.Text);
            const url = (_a = item.FirstURL) === null || _a === void 0 ? void 0 : _a.trim();
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
const addPrimaryResults = (source, results, seen) => {
    var _a;
    if (!Array.isArray(source)) {
        return;
    }
    for (const item of source) {
        const parsed = extractTitleAndSnippet(item.Text);
        const url = (_a = item.FirstURL) === null || _a === void 0 ? void 0 : _a.trim();
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
const appendFallbackResult = (data, results, query) => {
    var _a;
    if (results.length > 0 || !data.AbstractText) {
        return;
    }
    const parsedAbstract = extractTitleAndSnippet(data.AbstractText);
    if (!parsedAbstract) {
        return;
    }
    results.push({
        snippet: parsedAbstract.snippet,
        title: (_a = data.Heading) !== null && _a !== void 0 ? _a : parsedAbstract.title,
        url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
    });
};
const fetchWebSearchResults = async (query, limit = 3) => {
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
    const data = (await response.json());
    const results = [];
    const seenUrls = new Set();
    addPrimaryResults(data.Results, results, seenUrls);
    results.push(...flattenTopics(data.RelatedTopics, seenUrls));
    appendFallbackResult(data, results, trimmedQuery);
    return results.slice(0, limit);
};
exports.fetchWebSearchResults = fetchWebSearchResults;
const fetchWebSearchContext = async (query, limit = 3) => {
    const results = await (0, exports.fetchWebSearchResults)(query, limit);
    if (results.length === 0) {
        return;
    }
    return results
        .map((result, index) => [
        `${index + 1}. ${result.title}`,
        `链接：${result.url}`,
        `摘要：${result.snippet}`,
    ]
        .filter(Boolean)
        .join("\n"))
        .join("\n\n");
};
exports.fetchWebSearchContext = fetchWebSearchContext;
