/** Original, fictional atlas scenery. These plates are not survey photographs or nest coordinates. */
export interface AtlasArtboard {
  regionId: string;
  src: string;
  surroundings: string;
  objectPosition: string;
}

export const atlasArtboards: Record<string, AtlasArtboard> = {
  california: { regionId: 'california', src: '/art/terrain/california.jpg', surroundings: 'Coastal scrub, oak woodland, and urban edges', objectPosition: '42% 50%' },
  mediterranean: { regionId: 'mediterranean', src: '/art/terrain/mediterranean.jpg', surroundings: 'Dry coastal scrub, stone terraces, and olive woodland', objectPosition: '50% 50%' },
  japan: { regionId: 'japan', src: '/art/terrain/japan.jpg', surroundings: 'Humid woodland, river margins, and garden paths', objectPosition: '50% 50%' },
  africa: { regionId: 'africa', src: '/art/terrain/africa.jpg', surroundings: 'Fynbos slopes, sandy clearings, and rocky ground', objectPosition: '50% 50%' },
  australia: { regionId: 'australia', src: '/art/terrain/australia.jpg', surroundings: 'Eucalypt woodland, dry tracks, and grassland', objectPosition: '50% 50%' },
  newzealand: { regionId: 'newzealand', src: '/art/terrain/newzealand.jpg', surroundings: 'Fern-filled woodland, coastal grass, and garden edges', objectPosition: '50% 50%' },
  hawaii: { regionId: 'hawaii', src: '/art/terrain/hawaii.jpg', surroundings: 'Volcanic ground, forest patches, and ocean margins', objectPosition: '50% 50%' },
  southamerica: { regionId: 'southamerica', src: '/art/terrain/southamerica.jpg', surroundings: 'River corridors, subtropical woodland, and floodplain grasses', objectPosition: '50% 50%' },
};

const medallionRoles = ['gateway-nest', 'garden-edge', 'open-clearing', 'shaded-grove', 'leaf-litter-trail', 'habitat-margin'];
/** Three columns by two rows; Australian scenario roles reuse compatible fictional habitat illustrations. */
export function habitatMedallionPosition(roleId: string, terrain: 'open' | 'complex', gateway: boolean): string {
  const found = medallionRoles.indexOf(roleId);
  const index = gateway ? 0 : found >= 0 ? found : roleId.includes('litter') || roleId.includes('bark') ? 4 : terrain === 'complex' ? 3 : 2;
  return `${index % 3 * 50}% ${Math.floor(index / 3) * 100}%`;
}
