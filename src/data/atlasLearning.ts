import type { LearningActivityDefinition, VisualSummary } from '../game/types';

/** Original summaries; labels describe mechanisms, not measured game outcomes. */
export const visualSummaries: VisualSummary[] = [
  { factId: 'foraging-development', diagram: 'foraging', labels: ['Food access', 'Foraging trails', 'Colony performance'], takeaway: 'Food access matters. Our upgrade numbers are game rules.', resourceIds: ['argentine-diet', 'meat-trails', 'meat-food'] },
  { factId: 'game-growth', diagram: 'growth', labels: ['Game reserves', 'Capacity limit', 'Pause freezes'], takeaway: 'The growth number replenishes game units; it is not a birth rate.', resourceIds: ['uc-ipm', 'argentine-diet'] },
  { factId: 'nest-settings', diagram: 'landscape', labels: ['Gateway connector', 'Open clearing', 'Complex grove'], takeaway: 'Names set the scene. Terrain sets the tactical constraint.', resourceIds: ['terrain-study', 'uc-ipm'] },
  { factId: 'native-range', diagram: 'origin', labels: ['Paraná drainage', 'Native ecosystem', 'Introduced elsewhere'], takeaway: 'Home is a South American river basin, not every place ants now occur.', resourceIds: ['antweb'] },
  { factId: 'supercolonies', diagram: 'network', labels: ['Many nests', 'Shared network', 'Other colonies'], takeaway: 'A supercolony connects nests; it does not make all ants allies.', resourceIds: ['global-study'] },
  { factId: 'budding', diagram: 'network', labels: ['Existing nest', 'Workers + queens', 'Nearby nest'], takeaway: 'A colony can expand through budding.', resourceIds: ['uc-ipm'] },
  { factId: 'recognition', diagram: 'recognition', labels: ['Chemical cues', 'Paired-worker test', 'Reported response'], takeaway: 'Recognition is tested. Missing comparisons are unknown.', resourceIds: ['global-study'] },
  { factId: 'transport', diagram: 'transport', labels: ['Plants + materials', 'Human transport', 'Distant arrival'], takeaway: 'Ocean dispersal needs a lift, not an ant walking trail.', resourceIds: ['global-study'] },
  { factId: 'terrain', diagram: 'terrain', labels: ['Open space', 'Narrow passage', 'Fewer participants'], takeaway: 'A bottleneck can limit how many workers engage at once.', resourceIds: ['terrain-study'] },
  { factId: 'species', diagram: 'anatomy', labels: ['Argentine worker', 'Meat-ant worker', 'One form each'], takeaway: 'Size and strength differ; neither playable species has a soldier caste.', resourceIds: ['terrain-study', 'uc-ipm'] },
  { factId: 'honeydew', diagram: 'foodweb', labels: ['Sap-feeding insects', 'Sugary honeydew', 'Ant visitors'], takeaway: 'Sugar connects Argentine ants with other insects.', resourceIds: ['uc-ipm'] },
  { factId: 'biodiversity', diagram: 'foodweb', labels: ['An introduced ant', 'Other invertebrates', 'A wider food web'], takeaway: 'Ecological effects extend beyond ant-against-ant contests.', resourceIds: ['doc-nz'] },
  { factId: 'habitats', diagram: 'habitat', labels: ['Varied structure', 'Changed interactions', 'Research questions'], takeaway: 'A controlled arena is evidence, not a universal restoration recipe.', resourceIds: ['terrain-study'] },
  { factId: 'prevention', diagram: 'network', labels: ['Connected nests', 'Coordinated effort', 'Official guidance'], takeaway: 'Prevention and management depend on place and coordinated action.', resourceIds: ['doc-nz'] },
  { factId: 'observation', diagram: 'observation', labels: ['Take a photograph', 'Date + location', 'Community ID'], takeaway: 'An observation starts with evidence, not certainty about identity.', resourceIds: ['inaturalist'] },
  { factId: 'recovery', diagram: 'observation', labels: ['Choose a project', 'Check its region', 'Follow its method'], takeaway: 'Participation opportunities have their own locations and requirements.', resourceIds: ['xerces', 'island-conservation'] },
];

export const learningActivities: LearningActivityDefinition[] = [
  { id: 'anatomy', title: 'Anatomy detective', factId: 'species', resourceIds: ['antweb', 'uc-ipm'], steps: [
    { prompt: 'Which parts are the jointed feelers at the front of the head?', choices: ['Antennae', 'Mandibles', 'Gaster'], correctIndex: 0, explanation: 'Antennae are sensory appendages. Mandibles are jaws; the gaster is the rear body region.' },
    { prompt: 'Where do the six legs attach?', choices: ['Head', 'Mesosoma', 'Gaster'], correctIndex: 1, explanation: 'The six legs attach to the mesosoma, the middle body region of the worker.' },
    { prompt: 'Which playable species has a specialized soldier caste?', choices: ['Argentine ants', 'Meat ants', 'Neither'], correctIndex: 2, explanation: 'Both playable species have one worker form. The General’s uniform is comic fiction, not another caste.' },
  ] },
  { id: 'terrain', title: 'Trail bottlenecks', factId: 'terrain', resourceIds: ['terrain-study'], steps: [
    { prompt: 'Which space gives more workers room to engage at once?', choices: ['An open clearing', 'A narrow rock corridor', 'Both always admit the same number'], correctIndex: 0, explanation: 'Open space allows more simultaneous participation. A constricted arena can reduce a numerical advantage.' },
    { prompt: 'What did the controlled ant experiments report?', choices: ['Argentine ants won every arena', 'Meat ants won every arena', 'The game perfectly repeats the experiments'], correctIndex: 1, explanation: 'Meat ants won every tested arena. Complex arenas reduced meat-ant fatalities; game coefficients are balanced abstractions.' },
    { prompt: 'Does that prove one terrain treatment always protects every native community?', choices: ['Yes, everywhere', 'Only if the game score rises', 'No; outcomes depend on species and setting'], correctIndex: 2, explanation: 'Controlled results support a mechanism and further questions. They do not establish a universal conservation treatment.' },
  ] },
  { id: 'recognition', title: 'Recognition detective', factId: 'recognition', resourceIds: ['global-study'], steps: [
    { prompt: 'US1 versus Japan J: 0 aggressive trials out of 50. What can this layer report?', choices: ['No aggression observed in those tests', 'These ants are always peaceful', 'They currently share one continuous territory'], correctIndex: 0, explanation: 'The layer reports the actual historical assay result. It does not guarantee every future encounter or show continuous territory.' },
    { prompt: 'US1 versus Lake Hodges US2: 42 aggressive trials out of 50. Which summary fits?', choices: ['No aggression observed', 'High aggression reported', 'Unknown comparison'], correctIndex: 1, explanation: 'This reported pairing supports a hostile relationship in the game. The test dates remain 2008–2009.' },
    { prompt: 'South Africa SA versus Hawaii H2 has no result in this layer. What should the map show?', choices: ['Allied because both oppose US1', 'Hostile because they are far apart', 'Unknown'], correctIndex: 2, explanation: 'Sharing an opponent or occurring in different places does not establish recognition. An unreported pair stays unknown.' },
  ] },
];
