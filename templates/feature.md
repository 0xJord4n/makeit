---
id: F-000
title: Feature title
tag: must            # must | should | wont | out-of-scope
slice: slice-name
status: inventoried  # inventoried | spec-ready | implementing | integrated | polished | failed | blocked-on-human | already-built
deps: []             # other F-xxx ids this feature depends on
milestone: ""        # optional: v0.1, v0.2, ... (assigned at Gate 1 for large inventories)
---

## Description

What this feature does and for whom. One paragraph, grounded in a job-to-be-done or a cross-cutting concern. If `tag: out-of-scope`, cite the non-goal it collides with.

## Sub-features

- The concrete capabilities this feature decomposes into

## Screens & flows

For each screen or flow this feature touches — name it. The spec will detail the 5 UX states; here, just make sure no screen is forgotten.

## Edge cases

- The inputs, timings, and states that break naive implementations

## Notes

Anything the spec writer must know that doesn't fit above. Reference other features as F-xxx — never copy their content.
