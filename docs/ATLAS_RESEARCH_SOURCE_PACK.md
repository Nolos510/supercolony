# Atlas research source pack

Reviewed 2026-10-14. This pack is frozen for the approved atlas revision. Research layers contain dated evidence; playable nests, ownership, routes, reserves and combat remain simulations. No map is described as a live battlefield.

## Bundled distribution snapshot

Resource ID: `gabi-distribution`. Dataset ID: `distribution-2022`.

- Data: `public/research/distribution-2022.json` — 162 Argentine-ant regional records, joined to the corresponding published regional reference coordinates.
- Provenance: `public/research/distribution-2022-source.json` — exact source version, direct URLs, source and derived hashes, rights, date policy, status definitions and related regional recognition studies.
- Primary data: Wong, Economo & Guénard, [Data supporting: The global spread and invasion capacities of alien ants, version 1](https://figshare.com/articles/dataset/Data_supporting_The_global_spread_and_invasion_capacities_of_alien_ants/21666191), DOI `10.6084/m9.figshare.21666191.v1`. The official [versioned metadata](https://api.figshare.com/v2/articles/21666191/versions/1) declares **CC BY 4.0** and publication on **6 January 2023**. The source database extraction occurred **15 June 2022**; individual observation dates are not supplied.
- Associated primary paper: Mark K. L. Wong, Evan P. Economo & Benoit Guénard, [The global spread and invasion capacities of alien ants](https://www.sciencedirect.com/science/article/pii/S0960982222019200), *Current Biology* 33, 566–571.e3 (2023), DOI `10.1016/j.cub.2022.12.020`. Dataset licensing is independently declared on Figshare; no article figures are copied.

The source taxon is spelled `Linepithema.humile`. Filtering uses that exact value. Dataset 1 supplies species, region, status and note; Dataset 2 supplies region, latitude, longitude and zoogeographic realm. The exact region-name join resolves all 162 records, with one record per region and no ID collisions. All source notes for this species are blank and remain blank. Coordinates are parsed numerically without repositioning or inferring boundaries.

| Source status | Records | Display meaning |
|---|---:|---|
| `native` | 22 | Reported native region in this dataset |
| `established.outdoors` | 106 | Recorded in the wild outside a reported native region |
| `established.indoors` | 26 | Recorded in buildings, greenhouses or other indoor settings |
| `border.interception` | 8 | Border interception; establishment is not demonstrated |

Every marker is a **regional reference anchor**, not an occurrence coordinate, nest or colony boundary. These categories report the authors' classifications. Broad South and Central American regional labels can differ from narrower native-range treatments; a region marked native does not establish that every part of it is native range. Do not silently reclassify these rows. Keep the game's Paraná basin native-range explanation separately attributed to its existing native-range sources.

Missing rows do not establish absence. Individual dates, collection positions and record-level references are unavailable in these deposited CSVs; underlying bibliographic evidence resides in GABI. Co-occurrence does not demonstrate aggression, tolerance or colony identity. [Antmaps](https://antmaps.org/?mode=species&species=Linepithema.humile) is an external exploration reference; this build copies neither its interface nor its geometry and performs no runtime scraping.

| Frozen file | Source bytes | SHA-256 |
|---|---:|---|
| Dataset 1, file `38408042` | 806,208 | `91a81ba1f84a9ac967e5ef983546704fb90bfcbf4a95d4ead68ffe6cebbd8843` |
| Dataset 2, file `38408045` | 22,251 | `062a5e15f131030eadd65d1323c72900f624aaf30a0fda39966d7046412d443d` |
| Derived Argentine-ant records | See metadata | `95033f5299e46b68cbcc4102e874d0df57e6164c4a636ed34b8e395bf0b9f6d8` |

Both downloaded CSV MD5 values also match Figshare's published checksums. Original CSVs were processed in memory; only the reviewed species subset and provenance are bundled.

## Original California geographic backdrop

Dataset ID: `noaa-enc-california`. Asset: `public/research/california-geography.json`. Provenance: `public/research/california-geography-source.json`.

[NOAA Office of Coast Survey's ENC Direct to GIS](https://www.nauticalcharts.noaa.gov/learn/encdirect/) supplies WGS 84 geographic features derived from its electronic charts. The [official catalogue](https://www.fisheries.noaa.gov/inport/item/39973/full-list) names the same service and permits GIS research/planning access. [Coast Survey licensing](https://www.nauticalcharts.noaa.gov/data/data-licensing.html) declares its data public domain through CC0 1.0. Credit remains **NOAA Office of Coast Survey**. No third-party aerial imagery or nautical symbology is copied.

The frozen GeoJSON has **18 land polygons and 85 coastline polylines** from one consistent Approach scale band, approximately 1:50,001–1:150,000. The query envelope is `[−117.33, 32.60, −117.15, 32.97]`, ordered west/south/east/north. All intersecting features are retained whole, with their chart-cell IDs and source-date/indicator fields. The service was asked for EPSG:4326 output, six decimal places, and 0.000025-degree generalization. Those rendering settings are not a claim of field accuracy. Both service count-only queries matched the downloaded feature counts.

Each feature contains `properties.kind`, either `land` or `coastline`; geometries retain the returned GeoJSON structure. Feature extent exceeds the query envelope because intersecting objects are not cut at the envelope. **Fit the published ant-study positions, clip the viewport, and apply one shared projection to the geography and GPS markers.** Do not fit the complete feature extent or shift survey markers to a hand-drawn grid.

Point-in-polygon validation against the existing reviewed California dataset places **111/111 Torrey Pines sites and 184/184 Point Loma sites on bundled land**. It does not validate the ant identification, ownership, field accuracy or temporal shoreline alignment. Chart source dates vary and are preserved where supplied; the extraction on 14 October 2026 is not a shoreline observation date. Derived GeoJSON SHA-256: `d488f5cba41a829a5668b863ea8519071c0635925301196c345b43ad9524b9eb`; size 272,465 bytes. Original query-response hashes and URLs are in the source JSON.

This is a geographic backdrop, **not soil geography, habitat classification, reserve property boundaries or colony fronts**. It is not certified for navigation. California State Parks boundaries were excluded because the open-data portal's attribution license conflicts with the department's restrictions on alteration and commercial use. The California research paper's aerial map and the Nara article's Google Maps-backed figure are also excluded. The existing California occurrence dataset, appendix hashes and its disclosed longitude correction remain untouched.

## Newer regional recognition evidence

The three records below are machine-readable in `relatedRecognitionStudies` within `distribution-2022-source.json`. Resource IDs follow the root registry. They enrich profiles and learning; **they do not add playable populations or silently replace unrelated historical assays**. Summaries are original, with attribution. No paper figures are bundled.

| Resource ID and primary source | Publication / observations | Supported finding and limit |
|---|---|---|
| `california-recognition` — Ellen van Wilgenburg, Mario Mariotta IV & Neil Durie Tsutsui, [The Effect of Diet on Colony Recognition and Cuticular Hydrocarbon Profiles of the Invasive Argentine Ant, Linepithema humile](https://pmc.ncbi.nlm.nih.gov/articles/PMC9026800/), DOI `10.3390/insects13040335` | Published 29 March 2022. Calendar collection dates are not reported; experiment spans ten weeks. | Field treatments retained tolerance toward a same-CAL reference and aggression toward Lake Skinner workers. Similar food did not make these different colonies merge. This is not a fresh Berkeley–Lake Hodges or international assay. Individual CC BY 4.0 evidence is verified in the [official Europe PMC article XML](https://www.ebi.ac.uk/europepmc/webservices/rest/PMC9026800/fullTextXML). |
| `mediterranean-recognition` — S. Castro-Cobo, O. Blight, X. Espadaler & E. Angulo, [Long-term spread of Argentine ant (Hymenoptera: Formicidae) European supercolonies on three Mediterranean islands](https://myrmecologicalnews.org/cms/index.php?option=com_content&view=category&id=1585&Itemid=439), DOI `10.25849/myrmecol.news_031:185` | Published 23 June 2021. Ibiza/Formentera assays: 2004 and August–September 2016. Corsica survey: 2007–2008; membership from prior literature. | Main and Catalonian identities were distinguished using reference-population aggression assays on Ibiza/Formentera. Corsica is not a new 2021 recognition survey. No California pair was tested. The primary journal's individual record explicitly declares CC BY 4.0. |
| `japan-recognition` — Daisuke Hayasaka, Kenshin Kato, Masayoshi K. Hiraiwa, Hiro Kasai, Kazutaka Osaki, Retsushi Aoki & Takuo Sawahata, [Undesirable dispersal via a river pathway of a single Argentine ant supercolony newly invading an inland urban area of Japan](https://www.nature.com/articles/s41598-023-47734-0), DOI `10.1038/s41598-023-47734-0` | Published 30 November 2023. Survey: July–December 2022. Aggression assays: September–December 2022. | Nara workers tolerated Kobe LH2 and strongly attacked LH1/LH3/LH4 in five-on-five assays, supporting sampled Nara membership in LH2. This does not refresh Iwakuni–California recognition. Article text is CC BY 4.0; no Google Maps-backed figure is copied. |

Evidence precedence applies to the **same endpoints and claim**: a newer direct assay can replace an older assay of those populations; a membership assignment describes its own sampled population; a recent review citing an old study does not create new observations. Matching haplotype alone is insufficient to assume tolerance, and missing pair tests remain unknown. Friendly travel and binary game affiliations remain explicitly simulated interpretations.

The protected 2010 pack retains its nine samples and 17 reported comparisons from 2008–2009. Its dataset bytes and all existing research fixtures remain unchanged in this lane. Contemporary worldwide colony borders and battlefronts were not verified and are not promised.

## Freeze and verification

Source acquisition used official public endpoints and standard-library processing. No package or runtime dependency was installed. Local assertions checked exact taxon and region joins, 162 unique stable record IDs, status totals, coordinates, source MD5 values, derived SHA-256 values, 103 unique geographic IDs, query completeness and coverage of all 295 existing California GPS sites. The integration owner runs protected application checks after the completion contract is initialized; this preflight does not claim a passing application receipt or rendered overlay.

Before release, visible source links, category labels, date/precision text, geographic projection and all unknown-relationship behavior still require integration checks. Organizations and research sources imply no partnership.
