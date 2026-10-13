# Content review

Reviewed **2026-10-13** by the educational-content implementation lane, separately from the simulation/UI lanes. This is an editorial evidence review; automated acceptance results are recorded by the root completion workflow.

## Checks and outcomes

- Catalog contains eight distinct official destinations and thirteen facts after the authorized feedback revision. Every fact references existing catalog IDs. The two catalog paper titles match the actual publications; publication years are 2010 and 2023.
- Facts were compared with primary articles or official guidance. The pasted research is a lead rather than authority. No paper figures, photographs, article passages, logos, or unsupported census estimates were copied.
- Research, participation, and conservation support are distinct groups. Entries carry organization, topic, regional applicability, resource type, and editorial review date.
- Worldwide resources carry a `global` region tag. The terrain paper remains available to a reader filtering for terrain and New Zealand; that tag describes research relevance rather than the experiment’s location.
- Xerces retains California and “Primarily North America.” The reviewed page documents California projects, but Hawaii-specific eligibility was not established; the Hawaii tag was removed.
- Initial direct extraction of the DOC page omitted its spread-prevention section, so the first review used ecological-impact wording. A fuller official indexed extraction now confirms guidance on checking movable plants, soil, materials and gear. The catalog summary explicitly reflects that verified prevention purpose, with New Zealand applicability.
- The new AntWeb account supports ant-focused research and the Paraná-drainage native range. Wild’s 2004 primary taxonomy/distribution study corroborates the basin-scale interpretation. South America is playable in War, and educational context only in Ecologist; native presence is not treated as invasion pressure.
- The iNaturalist card now explicitly describes a photo, date and location shared for community identification. Its action is an observation how-to, rather than an unspecified ant-conservation program.
- Both playable species have one worker form. The game’s numerical growth, strength, damage, movement and habitat values are abstractions.
- No signup, observation upload, donation, contact form, or other submission was made. Links and page purpose were reviewed; project eligibility and public-release link health require another review before publication.

## Destinations reviewed

| Catalog ID | Official URL | Finding |
|---|---|---|
| `global-study` | [The global expansion of a single ant supercolony](https://pmc.ncbi.nlm.nih.gov/articles/PMC3352483/) | Primary indexed full text supports historical colony relationships and recognition. [PubMed metadata](https://pubmed.ncbi.nlm.nih.gov/25567914/) confirms identity and year. |
| `terrain-study` | [Terrain and ant warfare research](https://pmc.ncbi.nlm.nih.gov/articles/PMC10500280/) | Primary indexed full text supports terrain mechanism, body-size comparison and worker forms. [PubMed metadata](https://pubmed.ncbi.nlm.nih.gov/37639613/) confirms identity and year. |
| `uc-ipm` | [UC IPM Argentine-ant documentation](https://ipm.ucanr.edu/TOOLS/ANTKEY/argentine.html) | Official identification, budding and honeydew behavior. |
| `antweb` | [AntWeb Argentine-ant species account](https://www.antweb.org/description.do?genus=linepithema&regionName=Americas&species=humile&statusSet=all) | Official ant images, taxonomy, locality records and native-range context. Records are not live abundance or supercolony boundaries. |
| `inaturalist` | [iNaturalist observation guide](https://help.inaturalist.org/en/support/solutions/articles/151000192921) | Official photo, date and location instructions. General wildlife observation; not an ant-specific conservation project, regulatory report or guaranteed identification. |
| `xerces` | [Xerces community science](https://xerces.org/community-science) | Broader invertebrate monitoring, primarily North America; each project has its own requirements. |
| `doc-nz` | [DOC Argentine-ant guidance](https://www.doc.govt.nz/nature/pests-and-threats/animal-pests-and-threats/argentine-ants/) | Government information and checking movable items to prevent accidental spread, specific to New Zealand. |
| `island-conservation` | [Island Conservation: How to Help](https://www.islandconservation.org/how-to-help/) | Organization’s own restoration-awareness and optional support routes. No affiliation with the game is implied. |

Direct PMC retrieval returned browser challenges. Review used NLM-indexed primary full text and PubMed metadata. The review date describes inspection of the available source evidence, not a guarantee of uninterrupted access for every reader.

Direct AntWeb and publisher retrieval also returned tool errors; review used their official indexed text. [Wild’s primary 2004 study](https://academic.oup.com/aesa/article/97/6/1204/54982) independently supports the native basin, including introduction elsewhere in South America. Exact native limits are not inferred from a country-level tag.

## Fact-to-source audit

| Fact ID | Source IDs | Checked basis |
|---|---|---|
| `native-range` | `antweb` | Lowland Paraná-drainage native context, including parts of northern Argentina, Paraguay, Uruguay and southern Brazil. Native-range presence is not an invasion. |
| `supercolonies` | `global-study` | Historical tolerance among major sampled colonies, with distinct aggressive populations. |
| `budding` | `uc-ipm` | Queens and workers relocate together during colony splitting. |
| `recognition` | `global-study` | Body-surface chemistry, genes and behavior were compared. |
| `transport` | `global-study` | Human commerce and introductions provide context; game ocean routes are fictional. |
| `terrain` | `terrain-study` | Meat ants won all tested ant battles; complex arenas reduced their fatalities. |
| `species` | `terrain-study`, `uc-ipm` | Different body sizes and a single worker form; no specialized soldier caste. |
| `honeydew` | `uc-ipm` | Tending honeydew-producing insects. |
| `biodiversity` | `doc-nz` | Native invertebrate displacement and food competition in New Zealand. |
| `habitats` | `terrain-study` | A controlled two-species test supports a limited terrain mechanism, not a universal restoration recipe. |
| `prevention` | `doc-nz` | Connected nests make coordinated management relevant. Timed interventions are game mechanics. |
| `observation` | `inaturalist`, `xerces` | Sharing wildlife observations and exploring monitoring opportunities. |
| `recovery` | `island-conservation`, `xerces` | Following broader restoration work and insect-monitoring opportunities. |

## Geography and asset provenance

Eight regional source relationships were inspected. Seven supply introduced-population context; South America supplies native-range context. They do not establish current supercolony frontlines or exact playable nest locations. Regional town anchors locate a broad scenario; nest layouts and ownership are simulated. The eighth anchor, Corrientes `[-58.81, -27.49]`, was compared with the existing official Natural Earth reference; see `docs/GEOGRAPHY.md`.

`public/world.json` contains Natural Earth’s 1:110m land geometry from [the official project’s GeoJSON repository](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson). [Natural Earth terms](https://www.naturalearthdata.com/about/terms-of-use/) explicitly place its map datasets in the public domain. The game uses original specimen/tactical drawings and does not copy map figures from the scientific articles.
