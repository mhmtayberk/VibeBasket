import { SkillEntrySchema } from "../schemas";
import type { SkillEntry, SourceCollectedItem, SourceCollector } from "../schemas";
import {
  anchorPattern,
  buildSkillCatalogItem,
  canonicalSkillKey,
  canonicalSkillsShMirrorKey,
  cleanEscapedValue,
  fetchWithTimeout,
  hrefAttributePattern,
  normalizeCatalogText,
  officialSkillNamePattern,
  officialSkillRepoPattern,
  preferSkillMirrorCandidate,
  skillsShDirectoryEntryPattern,
  skillsShSkillUrlPattern,
  slugify,
  stripHtml,
  titleFromSlug,
  xmlLocPattern,
} from "../utils";

const REGISTRY_SYNC_USER_AGENT =
  "VibeBasket Registry Sync/0.1 (+https://github.com/mhmtayberk/VibeBasket)";

export class SkillsShCuratedCollector implements SourceCollector {
  readonly name = "skills-sh-directory";

  constructor(
    private readonly fetchImpl: typeof fetch,
    private readonly retries: number,
    private readonly timeoutMs: number,
  ) {}

  async collect(): Promise<SourceCollectedItem[]> {
    const officialRepoPaths = await this.fetchOfficialRepoPaths();
    const officialSkills = await this.fetchDirectorySkillEntries(officialRepoPaths);
    const deduped = new Map<string, SourceCollectedItem>();
    const mirrorDeduped = new Map<string, SourceCollectedItem>();

    for (const skill of officialSkills) {
      if (!deduped.has(skill.canonicalKey)) {
        deduped.set(skill.canonicalKey, skill);
      }
    }

    for (const skill of deduped.values()) {
      const skillData = skill.catalogItem.data as SkillEntry;
      const mirrorKey = canonicalSkillsShMirrorKey(skillData);
      mirrorDeduped.set(mirrorKey, preferSkillMirrorCandidate(skill, mirrorDeduped.get(mirrorKey)));
    }

    return Array.from(mirrorDeduped.values());
  }

  private async fetchDirectorySkillEntries(officialRepoPaths: Set<string>) {
    const sitemapEntries = await this.fetchSkillsFromSitemaps(officialRepoPaths);
    if (sitemapEntries.length > 0) {
      return sitemapEntries;
    }

    const html = await this.fetchText("https://www.skills.sh/", "skills.sh directory");
    const normalizedHtml = html.replace(/\\"/g, '"');
    const items = this.parseDirectorySkillBlob(normalizedHtml);

    if (items.length > 0) {
      return items;
    }

    const repoPaths = this.parseDirectoryRepoPaths(normalizedHtml);
    if (repoPaths.size > 0) {
      return this.fetchRepoSkillEntries(repoPaths, officialRepoPaths);
    }

    return this.fetchOfficialSkillEntries(officialRepoPaths);
  }

  private parseDirectorySkillBlob(html: string) {
    const items: SourceCollectedItem[] = [];

    for (const match of html.matchAll(skillsShDirectoryEntryPattern)) {
      const repoPath = normalizeCatalogText(match[1] ?? "");
      const skillSlug = normalizeCatalogText(match[2] ?? "");
      const parsedName = normalizeCatalogText(cleanEscapedValue(match[3] ?? ""));
      const displayName =
        !parsedName || parsedName.toLowerCase() === skillSlug.toLowerCase()
          ? titleFromSlug(skillSlug)
          : parsedName;
      const isOfficial = (match[4] ?? "") === "true";

      const [owner, repo] = repoPath.split("/");
      if (!owner || !repo || !skillSlug) {
        continue;
      }

      const entry = SkillEntrySchema.parse({
        id: `skill-${slugify(owner)}-${slugify(repo)}-${slugify(skillSlug)}`,
        displayName,
        source: {
          type: "github",
          repo: `${owner}/${repo}`,
          path: skillSlug,
        },
        verified: false,
      });

      const sourceName = isOfficial ? "skills-sh-official" : "skills-sh-community";
      const skillUrl = `https://www.skills.sh/${owner}/${repo}/${skillSlug}`;

      items.push({
        canonicalKey: canonicalSkillKey(entry),
        sourceName,
        catalogItem: buildSkillCatalogItem(entry, {
          description: `${isOfficial ? "Official" : "Community"} skill from ${owner}/${repo} on skills.sh`,
          sourceName,
          sourceUrl: skillUrl,
        }),
      });
    }

    return items;
  }

  private async fetchOfficialRepoPaths() {
    const html = await this.fetchText("https://www.skills.sh/official", "skills.sh official list");
    const repoPaths = new Set<string>();

    for (const repoMatch of html.matchAll(officialSkillRepoPattern)) {
      const repoPath = cleanEscapedValue(repoMatch[1] ?? "");
      if (repoPath) {
        repoPaths.add(repoPath.toLowerCase());
      }
    }

    for (const match of html.matchAll(hrefAttributePattern)) {
      const href = match[1];
      if (!href) continue;
      const segments = href.split("/").filter(Boolean);
      if (segments.length !== 2) continue;
      const [owner, repo] = segments;
      if (!owner || !repo || owner === "docs" || owner === "topic" || owner === "agent") continue;
      repoPaths.add(`${owner}/${repo}`.toLowerCase());
    }

    return repoPaths;
  }

  private async fetchSkillsFromSitemaps(officialRepoPaths: Set<string>) {
    const sitemapIndex = await this.fetchText(
      "https://www.skills.sh/sitemap.xml",
      "skills.sh sitemap index",
    );
    const sitemapUrls = Array.from(sitemapIndex.matchAll(xmlLocPattern))
      .map((match) => normalizeCatalogText(match[1] ?? ""))
      .filter((url) => url.includes("sitemap-skills-"));

    const items: SourceCollectedItem[] = [];

    for (const sitemapUrl of sitemapUrls) {
      const xml = await this.fetchText(
        sitemapUrl,
        `skills.sh sitemap ${sitemapUrl.split("/").pop() ?? sitemapUrl}`,
      );
      for (const match of xml.matchAll(xmlLocPattern)) {
        const skillUrl = normalizeCatalogText(match[1] ?? "");
        const parsed = skillUrl.match(skillsShSkillUrlPattern);
        if (!parsed) {
          continue;
        }

        const [, owner, repo, skillSlug] = parsed;
        if (!owner || !repo || !skillSlug) {
          continue;
        }

        const repoPath = `${owner}/${repo}`;
        const isOfficial = officialRepoPaths.has(repoPath.toLowerCase());
        const sourceName = isOfficial ? "skills-sh-official" : "skills-sh-community";
        const displayName = titleFromSlug(skillSlug);
        const entry = SkillEntrySchema.parse({
          id: `skill-${slugify(owner)}-${slugify(repo)}-${slugify(skillSlug)}`,
          displayName,
          source: {
            type: "github",
            repo: repoPath,
            path: skillSlug,
          },
          verified: false,
        });

        items.push({
          canonicalKey: canonicalSkillKey(entry),
          sourceName,
          catalogItem: buildSkillCatalogItem(entry, {
            description: `${isOfficial ? "Official" : "Community"} skill from ${repoPath} on skills.sh`,
            sourceName,
            sourceUrl: skillUrl,
          }),
        });
      }
    }

    return items;
  }

  private async fetchOfficialSkillEntries(officialRepoPaths: Set<string>) {
    const html = await this.fetchText("https://www.skills.sh/official", "skills.sh official list");
    const items: SourceCollectedItem[] = [];
    const parsedFromBlob = this.parseOfficialSkillBlob(html);

    if (parsedFromBlob.length > 0) {
      return parsedFromBlob;
    }

    for (const repoPath of officialRepoPaths) {
      const repoSkills = await this.fetchRepoSkills(repoPath, true);
      for (const skill of repoSkills) {
        items.push(skill);
      }
    }

    return items;
  }

  private parseOfficialSkillBlob(html: string) {
    const items: SourceCollectedItem[] = [];

    for (const repoMatch of html.matchAll(officialSkillRepoPattern)) {
      const repoPath = cleanEscapedValue(repoMatch[1] ?? "");
      const skillsBlob = repoMatch[2];
      if (!repoPath || !skillsBlob) continue;

      const [owner, repo] = repoPath.split("/");
      if (!owner || !repo) continue;

      for (const skillMatch of skillsBlob.matchAll(officialSkillNamePattern)) {
        const skillSlug = cleanEscapedValue(skillMatch[1] ?? "");
        if (!skillSlug) continue;

        const entry = SkillEntrySchema.parse({
          id: `skill-${slugify(owner)}-${slugify(repo)}-${slugify(skillSlug)}`,
          displayName: titleFromSlug(skillSlug),
          source: {
            type: "github",
            repo: `${owner}/${repo}`,
            path: skillSlug,
          },
          verified: false,
        });

        items.push({
          canonicalKey: canonicalSkillKey(entry),
          sourceName: "skills-sh-official",
          catalogItem: buildSkillCatalogItem(entry, {
            description: `Official skill from ${owner}/${repo} on skills.sh`,
            sourceName: "skills-sh-official",
            sourceUrl: `https://www.skills.sh/${owner}/${repo}/${skillSlug}`,
          }),
        });
      }
    }

    return items;
  }

  private parseDirectoryRepoPaths(html: string) {
    const repoPaths = new Set<string>();

    for (const match of html.matchAll(hrefAttributePattern)) {
      const href = normalizeCatalogText(match[1] ?? "");
      if (!href.startsWith("/")) continue;

      const segments = href.split("/").filter(Boolean);
      if (segments.length !== 2) continue;

      const [owner, repo] = segments;
      if (!owner || !repo || owner === "docs" || owner === "topic" || owner === "agent") continue;
      repoPaths.add(`${owner}/${repo}`.toLowerCase());
    }

    return repoPaths;
  }

  private async fetchRepoSkillEntries(repoPaths: Set<string>, officialRepoPaths: Set<string>) {
    const items: SourceCollectedItem[] = [];

    for (const repoPath of repoPaths) {
      const repoSkills = await this.fetchRepoSkills(
        repoPath,
        officialRepoPaths.has(repoPath.toLowerCase()),
      );
      for (const skill of repoSkills) {
        items.push(skill);
      }
    }

    return items;
  }

  private async fetchRepoSkills(repoPath: string, isOfficial: boolean) {
    const html = await this.fetchText(
      `https://www.skills.sh/${repoPath}`,
      `skills.sh repo ${repoPath}`,
    );
    const [owner, repo] = repoPath.split("/");
    const items: SourceCollectedItem[] = [];
    const seen = new Set<string>();
    const sourceName = isOfficial ? "skills-sh-official" : "skills-sh-community";

    for (const match of html.matchAll(anchorPattern)) {
      const href = match[1];
      const anchorText = stripHtml(match[2] ?? "");
      if (!href?.startsWith(`/${repoPath}/`)) continue;

      const segments = href.split("/").filter(Boolean);
      if (segments.length !== 3) continue;

      const skillSlug = segments[2];
      if (!skillSlug || skillSlug === repo || seen.has(skillSlug)) continue;
      seen.add(skillSlug);

      const displayName = anchorText || titleFromSlug(skillSlug);
      const entry = SkillEntrySchema.parse({
        id: `skill-${slugify(owner ?? "")}-${slugify(repo ?? "")}-${slugify(skillSlug)}`,
        displayName,
        source: {
          type: "github",
          repo: `${owner}/${repo}`,
          path: skillSlug,
        },
        verified: false,
      });

      items.push({
        canonicalKey: canonicalSkillKey(entry),
        sourceName,
        catalogItem: buildSkillCatalogItem(entry, {
          description: `${isOfficial ? "Official" : "Community"} skill from ${owner}/${repo} on skills.sh`,
          sourceName,
          sourceUrl: `https://www.skills.sh/${repoPath}/${skillSlug}`,
        }),
      });
    }

    return items;
  }

  private async fetchText(url: string, label: string) {
    const res = await fetchWithTimeout(
      this.fetchImpl,
      url,
      {
        headers: {
          accept: "text/html,application/xhtml+xml",
          "user-agent": REGISTRY_SYNC_USER_AGENT,
        },
      },
      label,
      {
        timeoutMs: this.timeoutMs,
        retries: this.retries,
      },
    );

    if (!res.ok) {
      throw new Error(`${label} request failed: HTTP ${res.status}`);
    }

    return res.text();
  }
}
