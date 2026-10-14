import type { SpecimenAsset } from '../game/types';

export const specimens: SpecimenAsset[] = [
  {
    id: 'argentine-worker', speciesId: 'argentine', path: '/specimens/argentine-worker.jpg',
    label: 'Argentine ant worker · profile photograph', scientificName: 'Linepithema humile',
    photographer: 'April Nobile · from www.antweb.org',
    license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    sourceUrl: 'https://www.antweb.org/bigPicture.do?name=casent0006019&number=1&shot=p',
    sourceImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Linepithema_humile_casent0006019_profile_1.jpg',
    specimenCode: 'CASENT0006019', viewerUrl: 'https://biomedisa.info/antscan/specimen/1040/',
    reviewedAt: '2026-10-13', changes: 'Unchanged archived AntWeb JPEG; original embedded CC BY-SA 3.0 license retained.',
  },
  {
    id: 'meat-worker', speciesId: 'meat', path: '/specimens/meat-worker.jpg',
    label: 'Two Australian meat ant workers · field photograph', scientificName: 'Iridomyrmex purpureus',
    photographer: 'Steve Shattuck · CSIRO',
    license: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:CSIRO_ScienceImage_3225_Meat_ant_Iridomyrmex_purpureus_Formicidae.jpg',
    sourceImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/79/CSIRO_ScienceImage_3225_Meat_ant_Iridomyrmex_purpureus_Formicidae.jpg',
    specimenCode: 'CSIRO ScienceImage 3225', reviewedAt: '2026-10-13',
    changes: 'Unchanged archived CSIRO JPEG. Original ScienceImage host unavailable; CSIRO collection reuse grant and archive credit verified.',
  },
];
