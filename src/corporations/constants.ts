import type {
  CorpMaterialName,
  CityName,
  CorpEmployeePosition,
  CorpIndustryName,
} from '@ns'

export const CITIES = {
  SECTOR_12: 'Sector-12',
  AEVUM: 'Aevum',
  CHONGQING: 'Chongqing',
  NEW_TOKYO: 'New Tokyo',
  ISHIMA: 'Ishima',
  VOLHAVEN: 'Volhaven',
} as const satisfies Record<string, `${CityName}`>

export const CITY_NAMES = Object.values(CITIES)

export const MATERIALS = {
  MINERALS: 'Minerals',
  ORE: 'Ore',
  WATER: 'Water',
  FOOD: 'Food',
  PLANTS: 'Plants',
  METAL: 'Metal',
  HARDWARE: 'Hardware',
  CHEMICALS: 'Chemicals',
  DRUGS: 'Drugs',
  ROBOTS: 'Robots',
  AI_CORES: 'AI Cores',
  REAL_ESTATE: 'Real Estate',
} as const satisfies Record<string, CorpMaterialName>

export const EMPLOYEE_POSITIONS = {
  UNASSIGNED: 'Unassigned',
  OPERATIONS: 'Operations',
  ENGINEER: 'Engineer',
  BUSINESS: 'Business',
  MANAGEMENT: 'Management',
  R_AND_D: 'Research & Development',
  INTERN: 'Intern',
} as const satisfies Record<string, CorpEmployeePosition>

export const UNLOCKABLES = {
  EXPORT: 'Export',
} as const

export const UPGRADES = {
  WILSON_ANALYTICS: 'Wilson Analytics',
  ABC_SALESBOTS: 'ABC SalesBots',
  SMART_STORAGE: 'Smart Storage',
  FOCUS_WIRES: 'FocusWires',
  NEURAL_ACCELERATORS: 'Neural Accelerators',
  PROJECT_INSIGHT: 'Project Insight',
  NNII: 'Nuoptimal Nootropic Injector Implants',
  SMART_FACTORIES: 'Smart Factories',
} as const

export const INDUSTRIES = {
  RESTAURANT: 'Restaurant',
  TOBACCO: 'Tobacco',
  AGRICULTURE: 'Agriculture',
  CHEMICAL: 'Chemical',
} as const satisfies Record<string, CorpIndustryName>

export const RESEARCHES = {
  HI_TECH: 'Hi-Tech R&D Laboratory',
  MARKET_TA_I: 'Market-TA.I',
  MARKET_TA_II: 'Market-TA.II',
} as const
