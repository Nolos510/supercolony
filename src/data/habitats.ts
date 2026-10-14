import type { HabitatAssignment, HabitatPhotoAsset } from '../game/types';
import west from '../../public/habitats/west/credits.json';
import east from '../../public/habitats/east/credits.json';
import atlasWest from '../../public/habitats/atlas-west/credits.json';
import atlasEast from '../../public/habitats/atlas-east/credits.json';

// Legacy Open/Complex examples remain available as explicitly regional alternatives.
export const habitats = [...west, ...east] as HabitatPhotoAsset[];
export const habitatPhotos = [...habitats, ...atlasWest.photos, ...atlasEast.photos] as HabitatPhotoAsset[];
export const habitatAssignments = [...atlasWest.assignments, ...atlasEast.assignments] as HabitatAssignment[];
