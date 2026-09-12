---
name: Generated client DOM iterable support
description: The generated React API client uses Headers.entries and needs DOM iterable types enabled.
---

The shared generated API client requires `dom.iterable` in its TypeScript lib list because Orval emits `Headers.entries()` usage.

**Why:** Without the iterable DOM library, workspace typechecking fails even though the generated client itself is valid browser code.

**How to apply:** Keep `lib/api-client-react/tsconfig.json` configured with both `dom` and `dom.iterable` whenever regenerating the API client.