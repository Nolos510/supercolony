# Frozen atlas interfaces and direction

Preflight revision, 2026-10-14. No feature implementation yet.

## State and ownership

`sourcePopulationId` is optional outside War and immutable on every War setting. It references US1/US2/F/AU/NZ/J/H1/H2/SA. Captures change occupant `colonyId`, ownership and species, never that reference. `ColonyRelation` has friendly/hostile/unknown values; unclaimed is a separate game claim rule. Fleet `withdrawing` records a deterministic return after an unknown arrival.

`HabitatAssignment` keys are scenario (`regional` or `species`), region and role. Exactly48 regional and12 species assignments resolve individual reviewed photos. UI uses the selected role's primary photo; open/complex alternatives remain explicitly regional examples.

`ResearchViewState` is owned by App and survives layer switching. It contains dataset, sample/site/period/point filters and independent research zoom/pan. Game camera/selection and store remain untouched. Reading, specimen and story return navigation restores focus and pauses the match.

Visual summaries are keyed by the16 existing fact IDs. Three activity definitions have original multiple-choice steps, feedback and resource IDs. Comic scenes store HTML captions separately from the original raster art.

## Component/state map

Home → start → compact map/dock. Game menu → resume/restart/exit/review. Details → resizable desktop inspector or phone reading screen. Inspector/Species article → specimen explorer → Back. Learn index → article + TLDR → optional activity → Back. Learn index → General Mandible → panels/vignettes → Back. Map → Research (paused) → Game (paused) → Resume.

All overlays have one header, one scrolling content container, and visible return controls. Closed/outgoing content is inert or unmounted. Pointer cancellation/menu/layer/layout changes cancel orders and restore pre-drag sources. The inspector resize uses immediate layout updates, never interpolated drag geometry.

## Frozen component boundaries

`HabitatGallery` adds optional roleId and scenario (`regional` default or `species`); the exact assignment is its primary image. Region-only learning can show general examples. `Specimen` and `SpeciesComparison` accept optional `onExplore(speciesId)`. `SpecimenExplorer` accepts speciesId, onBack and optional backLabel; it owns only transient photo pan/zoom/anatomy/comparison. Root owns navigation/pause/focus. Native community proxies do not receive invented specimens.

`ResearchMap` accepts controlled viewState and onViewStateChange(next). App defaults global-2010/US1/TPSR/recent, no selected point, distribution status/region all, zoom1/pan[0,0]. Zoom steps0.5. Geometry and observed points share one projection; game camera is separate.

`Learning` adds onExploreSpecimen and onStory callbacks. `Story` accepts onBack, backLabel and intro (default true); intro shows four panels, and the vignette edition exposes three named replayable scenes. Activities remain inside the reading scroller. Anatomy supplies photo hotspots and equivalent keyboard choices; terrain supplies a Passage width slider and visible participation diagram; recognition supplies First sample/Second sample selectors and literal evidence including unknowns. Quiz feedback does not modify game state or reward reserves.

Ownership: engine lane owns engine/scenarios/new colonies; interface lane owns Map/ResearchMap/Specimen/new SpecimenExplorer/HabitatGallery and atlas-map.css; learning lane owns Learning/new VisualSummary/LearningActivity/Story and atlas-learning.css. Root alone owns App/Inspector/Menu/CooperationTour/styles integration. No agents edit frozen types, metadata or tests, and no agent commits/pushes.

## Visual direction

Approved field atlas + richer terrain. Retain tokens.css unchanged. Use paper typography and moss/ochre illustrations, clear cyan/amber ownership paired with symbols, landscape texture below tactical signals, real photographs with captions. Illustrated regional boards remain schematic; locators show historical samples. No geographic coast underneath fabricated local coordinates.

Transitions.dev reference pinned f63fdc7980bced60281d54439a28aade9d1067bb: adapt panel, page and confirmation patterns into local CSS. Use only transform/opacity, interrupted transitions, reduced-motion static state, no blurred text or repeated number animations. Live resizing is immediate. Hallmark remains sole design authority.

Expected feature files: game/{engine,store,scenarios,types}.ts; data/{colonies,atlasLearning,atlasStory,habitats,research,content}.ts; components/{Map,ResearchMap,Specimen,SpecimenExplorer,HabitatGallery,Inspector,Learning,VisualSummary,LearningActivity,Story,Menu,CooperationTour}.tsx; App.tsx and styles.css. New assets/credits live under public/habitats/atlas-*, public/research and public/story. Existing global tokens and unrelated files stay unchanged. No deletions, runtime dependency, backend, installation or external design upload.
