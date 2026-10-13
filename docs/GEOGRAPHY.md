# Geographic anchors

Reviewed **2026-10-13** against the current `RegionDefinition` entries in `src/game/scenarios.ts` and the Natural Earth reference below. Anchors use `[longitude, latitude]` in degrees. They were originally hand-chosen, rounded reference points for placing a regional gateway on the world map; their near-city or island placement has now been checked against geographic data. They were not imported from a nest survey, ant-occurrence dataset, shipping record, or paper sampling table.

The place names below describe each anchor’s intended reference area. Scientific source IDs support the **broad regional context**, not the exact coordinate or a present-day colony boundary.

| Region ID | Displayed region | Anchor `[longitude, latitude]` | Intended place/context | Current source IDs |
|---|---|---|---|---|
| `california` | Coastal California | `[-118.24, 34.05]` | Los Angeles area; a reference point for coastal California | `global-study`, `uc-ipm` |
| `mediterranean` | Mediterranean coast | `[5.37, 43.3]` | Marseille area; a reference point for Mediterranean Europe | `global-study` |
| `japan` | Southern Japan | `[135.5, 34.69]` | Osaka area; a reference point for southern Japan | `global-study` |
| `africa` | Southern Africa | `[18.42, -33.93]` | Cape Town area; a reference point within South Africa | `global-study` |
| `australia` | Southern Australia | `[138.6, -34.93]` | Adelaide area; a reference point for the Australian network | `terrain-study`, `global-study` |
| `newzealand` | Northern New Zealand | `[174.76, -36.85]` | Auckland area; a reference point for northern New Zealand | `doc-nz`, `global-study` |
| `hawaii` | Hawaiian Islands | `[-155.58, 19.62]` | Hawaiʻi Island; a reference point for the Hawaiian network | `global-study` |

## Geographic verification

Compared with Point geometry from the official [Natural Earth 1:10m populated places simple GeoJSON](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_populated_places_simple.geojson), downloaded on 2026-10-13. Country codes disambiguate names. Distances are rounded Haversine calculations using a 6,371 km Earth radius. Point geometry is used consistently; legacy latitude/longitude properties can differ.

| Reference city | Country | Natural Earth ID | Point `[longitude, latitude]` | Distance from game anchor |
|---|---|---|---|---|
| Los Angeles | US | `1159151569` | `[-118.231986, 34.049219]` | 0.74 km |
| Marseille | FR | `1159150037` | `[5.373064, 43.291925]` | 0.93 km |
| Ōsaka | JP | `1159151537` | `[135.503754, 34.691095]` | 0.36 km |
| Cape Town | ZA | `1159151583` | `[18.433042, -33.918065]` | 1.79 km |
| Adelaide | AU | `1159151165` | `[138.598059, -34.933042]` | 0.38 km |
| Auckland | NZ | `1159151703` | `[174.763027, -36.848055]` | 0.35 km |
| Hilo | US | `1159149209` | `[-155.08154, 19.705643]` | 53.06 km |

Six anchors are within 1.8 km of their reference cities. Hawaii's marker is a broad island placement west-southwest of Hilo, not a rounded Hilo coordinate. No game coordinates were changed.

The downloaded reference and comparison evidence are retained only in ignored `output/geography-reference/`. Reference SHA-256: `fd3fa867a320cbd5c5b6bb5bc550afeec2939fb2cef688e508007282a55ac42f`. This verifies approximate geographic placement, not ants, nests, or current frontlines.

## What the cited sources establish

- [`global-study`: global supercolony research (2010)](https://pmc.ncbi.nlm.nih.gov/articles/PMC3352483/) documents sampled Argentine-ant populations in California, Europe, Japan, South Africa, Australia, New Zealand, and Hawaii. Its historical behavior, genetic, and chemical evidence supplies regional context. It does not establish these game anchor positions or current frontlines.
- [`uc-ipm`: University of California identification guide](https://ipm.ucanr.edu/TOOLS/ANTKEY/argentine.html) supplies California-oriented species documentation. It does not identify the game’s Los Angeles anchor as a nest.
- [`terrain-study`: ant warfare research (2023)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10500280/) supports an Australian two-species comparison and terrain mechanism. The Adelaide anchor is not claimed to be the experimental location.
- [`doc-nz`: New Zealand Department of Conservation guidance](https://www.doc.govt.nz/nature/pests-and-threats/animal-pests-and-threats/argentine-ants/) documents New Zealand occurrence and ecological impacts, including Auckland context. It does not supply the game’s exact Auckland point.

The source papers and official guidance were reviewed for educational context; access limitations and publication years are recorded in `docs/SOURCES.md` and `docs/CONTENT_REVIEW.md`. The anchors remain illustrative design choices, with approximate placement verified against Natural Earth rather than attributed to the ant studies.

## Map and simulation boundaries

The world backdrop uses public-domain Natural Earth 1:110m land geometry, bundled as `public/world.json` from [the Natural Earth project’s `ne_110m_land.geojson`](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson). [Natural Earth’s terms](https://www.naturalearthdata.com/about/terms-of-use/) cover the dataset’s public-domain status. A small-scale basemap cannot establish surveyed nest positions.

Each regional gateway refers to an existing simulated nest. Regional nest layouts, territory ownership, trails, ocean links, worker counts, and habitat scores are game state. Zooming changes the view of that state, not its scientific status. Ocean links abstract human-assisted dispersal; they do not identify active shipping routes. The map does not show live ant populations, current war boundaries, or a physically continuous worldwide colony.

Ecologist’s unnamed native-community proxies likewise do not imply that Australian meat ants occur outside Australia. The named meat-ant comparison belongs to the Australian scenario.

A future map of real observations or nest boundaries would require an explicitly licensed occurrence/survey dataset, observation dates, identification quality, coordinate uncertainty, and separate evidence for supercolony membership. This release bundles illustrative anchors and historical regional context instead.
