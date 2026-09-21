---
name: local-testing
description: View locally-edited SICP/SICPy content (xml_py or xml changes, new diagrams, etc.) live in the actual Source Academy interactive frontend, instead of just checking generated HTML/JSON files. Use whenever a change needs visual verification beyond a static render, or when the user asks to "try this locally" / "see it in the frontend".
---

# Local testing in the real frontend

Static checks (rendering an edited SVG with `rsvg-convert`, diffing generated
`html_split_py`/`json_py`) catch a lot, but the only way to see how a change
actually looks in Source Academy's textbook viewer is to run a local content
server and point a real frontend at it.

**Key fact, easy to get wrong:** the `/sicpy` (and `/sicpjs`) book-reading
route always fetches content from `Constants.sicpBackendUrl`
(`frontend/src/commons/utils/Constants.ts`), which reads the **build-time**
env var `REACT_APP_SICPJS_BACKEND_URL`. This is baked into the deployed
bundle at build time — there is no runtime feature flag for it, so the
deployed sourceacademy.org can **never** be redirected to a local server for
book content, no matter what feature flags you set there. You need a local
frontend checkout.

## 1. Serve this repo's built content

Regenerate the JSON content:

```
SICP_EDITION=py yarn run json    # json_py/ (what the interactive frontend fetches)
```

**Do not use `yarn tryjson` for this** (it serves the raw repo root, e.g.
`/static/img_javascript/...`). On the real deployed site, `static/`'s
contents are flattened to the site root by the build (`createMain`'s `"web"`
branch in `javascript/commands/utils.ts` copies all of `static/` into every
edition's `html_split_<lang>/`, and `prepare()` then copies the JS edition's
`html_split_js/*` to `docs_out/` root) — so JSON figure paths like
`"img_javascript/ch3-Z-G-2.svg"` resolve as `<site-root>/img_javascript/...`,
**not** `<site-root>/static/img_javascript/...`. Serving the raw repo root
locally breaks every figure (this is the "figure 3.1 is broken" bug — the
JSON was fine, the local server's path layout wasn't).

Mirror that flattening with a symlink directory instead of copying files
(so edits to `static/` or regenerated `json_py/` show up immediately, no
resync needed):

```
mkdir -p /tmp/local-docs
for d in static/*; do ln -s "$PWD/$d" "/tmp/local-docs/$(basename "$d")"; done
ln -s "$PWD/json_py" /tmp/local-docs/json_py
npx http-server /tmp/local-docs -p 8080 -c-1 --cors
```

Verify both an image and the JSON resolve at site-root paths (no `/static/`
prefix):

```
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8080/img_javascript/ch3-Z-G-2.svg
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8080/img_python/ch3-Z-G-3.svg
curl -s http://localhost:8080/json_py/toc.json
```

Re-running `yarn run json`/`split` while the server is up is fine — it's
just serving files off disk (symlinks resolve live), no restart needed.

## 2. Run the frontend locally, pointed at it

There's a sibling checkout at `~/Repos/SourceAcademy/frontend`. Its `.env`
(gitignored, already has a commented example for this) sets
`REACT_APP_SICPJS_BACKEND_URL`. Point it at step 1's server:

```
cd ~/Repos/SourceAcademy/frontend
# in .env: REACT_APP_SICPJS_BACKEND_URL="http://localhost:8080/"
npx rsbuild dev   # `yarn start` may fail to resolve the rsbuild binary; npx works
```

Serves on `http://localhost:8000` by default. `REACT_APP_USE_BACKEND=FALSE`
+ `REACT_APP_PLAYGROUND_ONLY=TRUE` (already set in `.env`) means no Source
Academy backend/auth server is needed for this. Visit `/sicpy` — it now
reads your local `json_py`, gate and all (e.g. `SICP_PUBLISHED_CHAPTERS`).

Revert the `.env` edit back to the production URL when done, so it doesn't
silently linger for the next unrelated frontend task.

## 3. (Optional) local language-directory, for the Playground's language picker

This is a **separate** system from step 2 — it does not affect `/sicpy`
book content. It only matters if you're also testing which evaluator the
Playground uses to *run* code (e.g. verifying an unreleased py-slang fix
inside the actual interactive evaluator, not just the node test harness).

```
cd ~/Repos/SourceAcademy/language-directory
# in each src/languages/python/python{1,2,3,4}.ts, the `evaluators[].path`
# fields point at published py-slang bundles; repoint one at a local build
# if that's what you're testing
yarn build                                   # writes dist/directory.json
npx http-server ./dist -p 8125 -c-1 --cors   # serves it at :8125
```

Then on the running frontend's own `/features` page (the local one from
step 2, or sourceacademy.org if you only care about evaluator selection and
not book content), set:

| Flag | Value |
|---|---|
| `directory.language.enable` | `true` (defaults to `false` — easy to forget) |
| `directory.language.url` | `http://localhost:8125/directory.json` |
| `directory.plugin.url` | leave default unless also testing local plugins |
| `directory.modules.url` | leave default unless also testing local modules |

`/sicpjs/...` routes hard-disable Conductor entirely (see
`frontend/src/features/conductor/flagConductorEnable.ts`), so none of this
applies to SICP JS regardless.

**Do not commit edits in `language-directory`** — revert
(`git checkout -- src/languages/python/`) once done.

## Bonus: testing against an unreleased py-slang fix (non-interactive)

`SICP_EDITION=py yarn test` resolves `@sourceacademy/py-slang` from the
pinned npm version by default — which can lag behind fixes already merged to
`py-slang`'s `main`. To test against a local py-slang build instead of
waiting for an npm release, without needing the frontend at all:

```
cd ~/Repos/SourceAcademy/py-slang
yarn build:lib                 # writes dist/index.cjs
cd ~/Repos/SourceAcademy/sicp
SICP_EDITION=py PY_SLANG=../py-slang/dist/index.cjs yarn test programs_py/chapter3
```

This is how a "chapter 3 test failures" report was corrected from 56/117 to
98/117 passing — the npm-pinned version was simply missing a `nonlocal`
fix already on py-slang's `main`.
