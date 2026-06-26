import assert from "node:assert/strict";
import test from "node:test";

import {
  ALLOWED_PUBLIC_ENV_VARS,
  extractPublicEnvReferences,
  findDisallowedPublicEnvReferences,
} from "./check-public-env.mjs";

test("extractPublicEnvReferences returns unique sorted NEXT_PUBLIC variables", () => {
  const references = extractPublicEnvReferences(`
    process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_API_KEY;
    process.env.NEXT_PUBLIC_SITE_URL;
  `);

  assert.deepEqual(references, ["NEXT_PUBLIC_API_KEY", "NEXT_PUBLIC_SITE_URL"]);
});

test("findDisallowedPublicEnvReferences allows reviewed public vars", () => {
  const violations = findDisallowedPublicEnvReferences(
    [
      {
        path: "apps/web/src/lib/public-url.ts",
        content: "const origin = process.env.NEXT_PUBLIC_SITE_URL;",
      },
    ],
    ALLOWED_PUBLIC_ENV_VARS,
  );

  assert.deepEqual(violations, []);
});

test("findDisallowedPublicEnvReferences reports non-allowlisted public vars", () => {
  const violations = findDisallowedPublicEnvReferences(
    [
      {
        path: "apps/web/src/lib/bad.ts",
        content: "const token = process.env.NEXT_PUBLIC_AUTH_SECRET;",
      },
      {
        path: ".env.example",
        content: "NEXT_PUBLIC_ANALYTICS_KEY=value",
      },
    ],
    ALLOWED_PUBLIC_ENV_VARS,
  );

  assert.deepEqual(violations, [
    {
      path: "apps/web/src/lib/bad.ts",
      variables: ["NEXT_PUBLIC_AUTH_SECRET"],
    },
    {
      path: ".env.example",
      variables: ["NEXT_PUBLIC_ANALYTICS_KEY"],
    },
  ]);
});
