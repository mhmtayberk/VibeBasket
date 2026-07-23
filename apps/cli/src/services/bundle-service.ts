import fs from "node:fs";
import {
  BundleSchema,
  type Bundle,
  type IdeId,
  type Scope,
} from "../../../../packages/core/src/manifest.js";
import { getApiBaseUrl } from "./api-base-url.js";

export async function loadBundleFromInput(input: string): Promise<Bundle> {
  let manifest: unknown;

  if (input.startsWith("http://") || input.startsWith("https://")) {
    const response = await fetch(input, { signal: AbortSignal.timeout(15_000) });
    if (!response.ok) {
      throw new Error(`Failed to fetch bundle: ${response.status} ${response.statusText}`);
    }
    manifest = await response.json();
  } else {
    manifest = JSON.parse(fs.readFileSync(input, "utf8"));
  }

  return BundleSchema.parse(manifest);
}

export async function createBundleFromSelection(input: {
  itemIds: string[];
  targetIds: IdeId[];
  scope: Scope;
  apiBaseUrl?: string;
}): Promise<{ url: string; bundle: Bundle }> {
  const apiBaseUrl = (input.apiBaseUrl ?? getApiBaseUrl()).replace(/\/+$/, "");
  const response = await fetch(`${apiBaseUrl}/api/bundle`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      itemIds: input.itemIds,
      targets: input.targetIds,
      scope: input.scope,
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const detail =
      payload && typeof payload === "object" && "error" in payload
        ? String(payload.error)
        : response.statusText;
    throw new Error(`Failed to create bundle: ${detail}`);
  }

  const payload = (await response.json()) as { url: string };
  const bundle = await loadBundleFromInput(payload.url);
  return { url: payload.url, bundle };
}
