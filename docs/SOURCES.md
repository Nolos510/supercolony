# SUPERColony source and resource notes

Editorial review: **2026-10-13**. The pasted research brief supplied by the user is a discovery lead. Game copy uses original summaries checked against the primary and official sources below.

## Research and documentation

| Catalog ID | Primary or official source | Year | Use |
|---|---|---:|---|
| `global-study` | Van Wilgenburg, Torres & Tsutsui, [The global expansion of a single ant supercolony](https://pmc.ncbi.nlm.nih.gov/articles/PMC3352483/). Evolutionary Applications. DOI: 10.1111/j.1752-4571.2009.00114.x. [NLM metadata](https://pubmed.ncbi.nlm.nih.gov/25567914/) | 2010 | Sampled colony relationships, chemical recognition, human-assisted introductions, regional context. |
| `terrain-study` | Lymbery, Webber & Didham, [Complex battlefields favor strong soldiers over large armies in social animal warfare](https://pmc.ncbi.nlm.nih.gov/articles/PMC10500280/). PNAS. DOI: 10.1073/pnas.2217973120. [NLM metadata](https://pubmed.ncbi.nlm.nih.gov/37639613/) | 2023 | Two-species comparison, worker forms, terrain and combat mechanism. |
| `uc-ipm` | [UC IPM Argentine-ant identification guide](https://ipm.ucanr.edu/TOOLS/ANTKEY/argentine.html) | No publication date asserted | Worker appearance, colony branching, trails, feeding and honeydew. |
| `doc-nz` | [New Zealand Department of Conservation: Argentine ants](https://www.doc.govt.nz/nature/pests-and-threats/animal-pests-and-threats/argentine-ants/) | No publication date asserted | New Zealand biodiversity and coordinated management context. |

The two PMC landing pages initially returned a browser challenge to direct retrieval. Their NLM-indexed primary full text was readable through search, and PubMed confirmed article identity and publication year. This is an editorial source review, not proof every reader can open every host without an access challenge.

### Important corrections to the research brief

- The actual ant trials in the 2023 paper did **not** demonstrate Argentine-ant victory in open arenas. Meat ants won every tested group battle; complex arenas reduced their fatalities. The game permits either side to win using deliberately balanced coefficients.
- Both playable species have one worker form. “Soldiers” in the paper describes combatants; neither playable species has a separate soldier caste.
- The 2010 findings concern historical samples, collected in 2008–2009. Mutual tolerance across distant samples does not mean a physically continuous nest network. Do not infer present frontlines or colony membership from an occurrence point alone.
- Unverified claims from the pasted brief, including exact eradication timelines, global totals, and current supercolony boundaries, are omitted.

## Observe, participate, and support

| Catalog ID | Official destination | Intended action and limits |
|---|---|---|
| `inaturalist` | [How to Make an Observation](https://help.inaturalist.org/en/support/solutions/articles/151000192921) | Share evidence, time and location worldwide. Community identification is not a guaranteed identification or a regulatory report. |
| `xerces` | [Xerces community science](https://xerces.org/community-science) | Browse insect-monitoring projects, primarily in North America. California participation is documented; Hawaii-specific eligibility was not verified and is not tagged. Locations, seasons and training differ by project. This is broader invertebrate conservation, not an Argentine-ant program. |
| `island-conservation` | [Island Conservation: How to Help](https://www.islandconservation.org/how-to-help/) | Follow restoration updates and explore optional support on the organization’s own site. Broader island biodiversity work; no specific ant-project funding promise. |

The Island Conservation page identifies the organization as a nonprofit and offers newsletter and donation routes. Its purpose was checked; no donation, registration, contact, or financial assessment was performed. Listings imply no partnership, sponsorship, endorsement, or affiliation. No contribution is needed to use this game. Advice from DOC applies to New Zealand; players elsewhere should find their own official guidance.

## Geography, simulation, and assets

The map’s seven regions supply historical and geographic context. Local nests, boundaries, player/rival ownership, routes, transport timing, worker reserves, growth, damage and habitat scores are simulated. They are not surveyed nest locations, a census, current war reporting, forecasts, or conservation treatment instructions. A dashed ocean route abstracts human-assisted dispersal.

Ecologist represents regional native ant communities with a generic, nonplayable habitat proxy. Outside Australia, these communities are not Australian meat ants and have no asserted species distribution, body size, worker caste, or fighting strength. The named meat-ant comparison belongs to the Australian scenario. The native-community profile links to the global study and DOC for ecological context; those links do not validate its numerical simulation values or a worldwide distribution of one native species. Its `global` tag describes game coverage.

Regional anchors should be documented with the bundled geography implementation. Neither a town anchor nor the basemap establishes supercolony membership. The original source papers remain the authority for sampled relationships.

[Natural Earth basemap datasets](https://www.naturalearthdata.com/about/terms-of-use/) are public domain. `public/world.json` bundles the 1:110m land geometry downloaded from [Natural Earth’s `ne_110m_land.geojson`](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson). The game renders this geometry as a simplified world backdrop; no author-created map figures from the research papers are copied. Specimen silhouettes and tactical graphics created for the game are original illustrations. Scientific photographs, organization logos and third-party images are not copied from these resources. Original text summaries and outbound links do not grant permission to redistribute source imagery or articles.

## Catalog maintenance

The catalog is bundled with the application; no runtime scraping or live occurrence feed is used. `reviewedAt` means an editor inspected source identity, purpose and applicability on that date. It is not an uptime guarantee or the page’s publication date. Research entries carry their own publication years.

Before a public release, inspect all seven official URLs, their current purpose, geography and participation requirements. If a destination moves or no longer supports the copy, repair or remove the affected claim and update its review date. Keep the launch catalog at seven entries unless scope is explicitly changed. Global research and worldwide observation resources remain visible alongside regional results; an Australian experiment can still be useful background for a New Zealand reader.

Fact IDs resolve to catalog IDs in `src/data/content.ts`. Educational content stays openly accessible; it is not a collectible unlock. Future playable species need supported regional mechanics and their own evidence review, even though the content interfaces can already be reused.
