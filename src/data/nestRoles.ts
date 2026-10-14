import type { NestRoleEntry } from '../game/types';

// Fictional site settings. Terrain and current species remain separate fields.
export const nestRoles: NestRoleEntry[] = [
  {"id": "gateway-nest", "name": "Gateway nest", "description": "A regional transport connector and rally point.", "purpose": "Mustering workers here prepares them for connected trails and dispersal routes."},
  {"id": "garden-edge", "name": "Garden edge", "description": "The boundary of a planted or maintained area.", "purpose": "A fictional setting for the influence of human-altered surroundings."},
  {"id": "open-clearing", "name": "Open clearing", "description": "A patch with relatively uninterrupted ground.", "purpose": "Open game terrain gives groups more room to engage."},
  {"id": "shaded-grove", "name": "Shaded grove", "description": "A stand of trees with sheltered ground beneath.", "purpose": "This scenario uses complex terrain to represent restricted combat space."},
  {"id": "leaf-litter-trail", "name": "Leaf-litter trail", "description": "A route among fallen leaves and ground cover.", "purpose": "Its complex game terrain limits simultaneous participation."},
  {"id": "habitat-margin", "name": "Habitat margin", "description": "A transition between neighboring habitat patches.", "purpose": "A fictional connection at the edge of the local network."},
  {"id": "port-verge", "name": "Port verge", "description": "Ground at the edge of a transport area.", "purpose": "Species Clash’s regional gateway and rally point; no actual port nest is claimed."},
  {"id": "sandy-clearing", "name": "Sandy clearing", "description": "An exposed sandy patch.", "purpose": "An open game battlefield rather than a measured soil survey."},
  {"id": "scrub-edge", "name": "Scrub edge", "description": "The boundary of low woody vegetation.", "purpose": "A fictional connection between nearby sites."},
  {"id": "garden-bed", "name": "Garden bed", "description": "A planted patch in a maintained setting.", "purpose": "A local source and reinforcement site."},
  {"id": "dry-creek", "name": "Dry creek", "description": "A channel that is dry in this fictional scenario.", "purpose": "Its complex game terrain introduces a bottleneck."},
  {"id": "open-track", "name": "Open track", "description": "A relatively unobstructed ground route.", "purpose": "Open game terrain allows more workers to engage."},
  {"id": "leaf-litter", "name": "Leaf litter", "description": "Fallen leaves and ground debris.", "purpose": "Complex game terrain stands in for restricted movement."},
  {"id": "woodland-floor", "name": "Woodland floor", "description": "Ground beneath a tree canopy.", "purpose": "This scenario assigns it complex game terrain."},
  {"id": "established-nest", "name": "Established nest", "description": "An already occupied site in the scenario.", "purpose": "The name does not identify its current species as native or introduced."},
  {"id": "bark-corridor", "name": "Bark corridor", "description": "A route across a bark-like surface.", "purpose": "The scenario assigns open terrain; a setting name alone does not define combat complexity."},
  {"id": "rocky-refuge", "name": "Rocky refuge", "description": "Sheltered spaces among rocks.", "purpose": "A complex game site with limited combat participation."},
  {"id": "gravel-mound", "name": "Gravel mound", "description": "A gravel-covered mound setting.", "purpose": "Meat ants can have gravel-covered nests; this fictional site can change ownership."},
];
