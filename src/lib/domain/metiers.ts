export type MetierKey =
  | 'coiffure'
  | 'lavage_auto'
  | 'garage'
  | 'immobilier'
  | 'restaurant'
  | 'hotel'
  | 'pharmacie'
  | 'clinique'
  | 'ecole'
  | 'boutique'
  | 'salle_sport';

type Metier = {
  label: string;
  /** Paires [clé, valeur] d'étiquettes OpenStreetMap. */
  osm: Array<[cle: string, valeur: string]>;
  /** Catégories Overture Maps (renseignées en phase 3). */
  overture: string[];
};

export const METIERS: Record<MetierKey, Metier> = {
  coiffure: { label: 'Coiffure et beauté', osm: [['shop', 'hairdresser'], ['shop', 'beauty']], overture: [] },
  lavage_auto: { label: 'Lavage auto', osm: [['amenity', 'car_wash']], overture: [] },
  garage: { label: 'Garage', osm: [['shop', 'car_repair'], ['shop', 'tyres']], overture: [] },
  immobilier: { label: 'Agence immobilière', osm: [['office', 'estate_agent']], overture: [] },
  restaurant: { label: 'Restaurant', osm: [['amenity', 'restaurant'], ['amenity', 'fast_food']], overture: [] },
  hotel: { label: 'Hôtel', osm: [['tourism', 'hotel'], ['tourism', 'guest_house']], overture: [] },
  pharmacie: { label: 'Pharmacie', osm: [['amenity', 'pharmacy']], overture: [] },
  clinique: {
    label: 'Clinique et cabinet',
    osm: [['amenity', 'clinic'], ['amenity', 'doctors'], ['amenity', 'dentist']],
    overture: [],
  },
  ecole: { label: 'École', osm: [['amenity', 'school'], ['amenity', 'kindergarten']], overture: [] },
  boutique: { label: 'Boutique', osm: [['shop', 'clothes'], ['shop', 'boutique']], overture: [] },
  salle_sport: { label: 'Salle de sport', osm: [['leisure', 'fitness_centre']], overture: [] },
};

export const METIER_KEYS = Object.keys(METIERS) as MetierKey[];

export function metierDepuisTags(tags: Record<string, string>): MetierKey | null {
  for (const cle of METIER_KEYS) {
    if (METIERS[cle].osm.some(([k, v]) => tags[k] === v)) return cle;
  }
  return null;
}
