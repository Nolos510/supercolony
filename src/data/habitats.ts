import type { HabitatPhotoAsset } from '../game/types';
import west from '../../public/habitats/west/credits.json';
import east from '../../public/habitats/east/credits.json';

// Bundled, individually reviewed photographs. These are representative settings.
export const habitats = [...west, ...east] as HabitatPhotoAsset[];
