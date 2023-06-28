import { type CorpIndustryName, NS } from '@ns'

import {
  CITIES,
  CITY_NAMES,
  EMPLOYEE_POSITIONS,
  INDUSTRIES,
  MATERIALS,
  RESEARCHES,
  UNLOCKABLES,
  UPGRADES,
} from 'scripts/corporations/constants'
import {
  buyTeaAndThrowParties,
  expandToAllCities,
  expandWarehouse,
  getDivisionsAndCities,
  hireEmployees,
  maximizeMoraleAndEnergy,
  upgradeToLevel,
} from 'scripts/corporations/utils'
import { CycleManager } from 'scripts/corporations/cycle-manager'

const TOBACCO_DIV_NAME = 'Nepsmokes'
const AGRICULTURE_DIV_NAME = 'Nepplants'
const CHEM_DIV_NAME = 'Nepchem'
const N_EMPLOYEES = 204
const WAREHOUSE_CAP = 24000
const WILSON_ANALYTICS_LVL = 20
const FOCUS_WIRES_LVL = 60
const NEURAL_ACCELERATORS_LVL = 60
const PROJECT_INSIGHT_LVL = 20
const NNII_LVL = 60
const SMART_FACTORIES_LVL = 60
const SMART_STORAGE_LVL = 50
const AGRICULTURE_REAL_ESTATE = 3e6
const CHEM_REAL_ESTATE = 1e6
const CHEM_ROBOTS = 30e3
const TOBACCO_REAL_ESTATE = 1e6
const TOBACCO_ROBOTS = 30e3
const PLANT_PRODUCTION = 3800
const HI_TECH_RESEARCH = 5000
const MARKET_TA_II_RESEARCH = 70000

const PRODUCT_NAME = 'Neparette'
const PRODUCT_INVESTMENT = 10e9

interface Industry {
  industry: CorpIndustryName
  divisionName: string
}

const LOOP_INDUSTRIES: Industry[] = [
  { industry: INDUSTRIES.AGRICULTURE, divisionName: AGRICULTURE_DIV_NAME },
  { industry: INDUSTRIES.CHEMICAL, divisionName: CHEM_DIV_NAME },
]
const ALL_INDUSTRIES: Industry[] = [
  ...LOOP_INDUSTRIES,
  { industry: INDUSTRIES.TOBACCO, divisionName: TOBACCO_DIV_NAME },
]

const ALL_INDUSTRY_NAMES = ALL_INDUSTRIES.map((industry) => industry.industry)
const LOOP_INDUSTRY_NAMES = LOOP_INDUSTRIES.map((industry) => industry.industry)

const getProductName = (version: number) => `${PRODUCT_NAME} ${version}`

const createProductManager = (ns: NS) => {
  let curVersion = 0
  const inDevelopment = new Set<string>()

  const develop = (version: number) => {
    const name = getProductName(version)
    ns.print(`Starting development of ${name}`)

    ns.corporation.makeProduct(
      TOBACCO_DIV_NAME,
      CITIES.SECTOR_12,
      name,
      PRODUCT_INVESTMENT,
      PRODUCT_INVESTMENT
    )

    inDevelopment.add(name)
  }

  for (let i = 0; i < 3; i++) {
    develop(curVersion++)
  }

  return () => {
    for (const name of inDevelopment) {
      const product = ns.corporation.getProduct(
        TOBACCO_DIV_NAME,
        CITIES.SECTOR_12,
        name
      )

      if (product.developmentProgress === 100) {
        inDevelopment.delete(name)
        ns.print(`Finished developing ${name}`)
        ns.print(`Activating Market-TA.II for ${name}`)
        ns.corporation.setProductMarketTA2(TOBACCO_DIV_NAME, name, true)

        if (inDevelopment.size === 0) {
          const discontinued = getProductName(curVersion - 3)
          ns.print(`Discontinuing ${discontinued}`)
          ns.corporation.discontinueProduct(TOBACCO_DIV_NAME, discontinued)

          develop(curVersion++)
        }
      }
    }
  }
}

export const doit = async (ns: NS) => {
  const cycleManager = new CycleManager(ns)

  while (ns.corporation.getCorporation().divisions.length > 0) {
    ns.print('Please sell all existing divisions')
    await ns.sleep(2000)
  }

  ns.print('Creating Tobacco, Agriculture and Chemical divisions')
  for (const { industry, divisionName } of ALL_INDUSTRIES) {
    ns.corporation.expandIndustry(industry, divisionName)
  }

  ns.print('Expanding divisions to all cities')
  for (const { divisionName } of ALL_INDUSTRIES) {
    expandToAllCities(ns, divisionName)
  }

  ns.print('Hiring employees')
  for (const [divisionName, cityName] of getDivisionsAndCities(
    ns,
    ALL_INDUSTRY_NAMES
  )) {
    hireEmployees(ns, divisionName, cityName, N_EMPLOYEES)
  }

  ns.print('Assigning all Tobacco employees to R&D')
  for (const cityName of CITY_NAMES) {
    ns.corporation.setAutoJobAssignment(
      TOBACCO_DIV_NAME,
      cityName,
      EMPLOYEE_POSITIONS.R_AND_D,
      N_EMPLOYEES
    )
  }

  ns.print(
    'Assigning Agriculture and Chemical employees to Operations, Engineer, Management and R&D'
  )
  const loopPositions = [
    EMPLOYEE_POSITIONS.OPERATIONS,
    EMPLOYEE_POSITIONS.ENGINEER,
    EMPLOYEE_POSITIONS.MANAGEMENT,
    EMPLOYEE_POSITIONS.R_AND_D,
  ]

  for (const [divisionName, cityName] of getDivisionsAndCities(
    ns,
    LOOP_INDUSTRY_NAMES
  )) {
    for (const position of loopPositions) {
      ns.corporation.setAutoJobAssignment(
        divisionName,
        cityName,
        position,
        Math.round(N_EMPLOYEES / 4)
      )
    }
  }

  ns.print('Preparing restaurants for round 4')
  for (let i = 0; i < 17; i++) {
    const divName = `Nepfoods ${i}`
    ns.corporation.expandIndustry(INDUSTRIES.RESTAURANT, divName)

    hireEmployees(ns, divName, CITIES.SECTOR_12, N_EMPLOYEES)
    const employeesPerPosition = Math.round(N_EMPLOYEES / 3)
    ns.corporation.setAutoJobAssignment(
      divName,
      CITIES.SECTOR_12,
      EMPLOYEE_POSITIONS.OPERATIONS,
      employeesPerPosition
    )
    ns.corporation.setAutoJobAssignment(
      divName,
      CITIES.SECTOR_12,
      EMPLOYEE_POSITIONS.ENGINEER,
      employeesPerPosition
    )
    ns.corporation.setAutoJobAssignment(
      divName,
      CITIES.SECTOR_12,
      EMPLOYEE_POSITIONS.MANAGEMENT,
      employeesPerPosition
    )

    ns.corporation.makeProduct(
      divName,
      CITIES.SECTOR_12,
      'Nepmeals',
      PRODUCT_INVESTMENT,
      PRODUCT_INVESTMENT
    )

    expandToAllCities(ns, divName)

    for (const cityName of CITY_NAMES) {
      if (cityName === CITIES.SECTOR_12) {
        continue
      }

      hireEmployees(ns, divName, cityName, N_EMPLOYEES)
      ns.corporation.setAutoJobAssignment(
        divName,
        cityName,
        EMPLOYEE_POSITIONS.R_AND_D,
        N_EMPLOYEES
      )
    }
  }
  cycleManager.registerRecurrentFunction(() =>
    buyTeaAndThrowParties(ns, [INDUSTRIES.RESTAURANT])
  )

  ns.print('Buying export unlockable')
  // For some reason the script is able to set export without this unlockable.
  // Must be a bug (v2.3.1).
  ns.corporation.purchaseUnlock(UNLOCKABLES.EXPORT)

  ns.print('Leveling upgrades')
  upgradeToLevel(ns, UPGRADES.WILSON_ANALYTICS, WILSON_ANALYTICS_LVL)
  upgradeToLevel(ns, UPGRADES.FOCUS_WIRES, FOCUS_WIRES_LVL)
  upgradeToLevel(ns, UPGRADES.NEURAL_ACCELERATORS, NEURAL_ACCELERATORS_LVL)
  upgradeToLevel(ns, UPGRADES.PROJECT_INSIGHT, PROJECT_INSIGHT_LVL)
  upgradeToLevel(ns, UPGRADES.NNII, NNII_LVL)
  upgradeToLevel(ns, UPGRADES.SMART_FACTORIES, SMART_FACTORIES_LVL)
  upgradeToLevel(ns, UPGRADES.SMART_STORAGE, SMART_STORAGE_LVL)

  ns.print('Maximizing employee morale and energy')
  await maximizeMoraleAndEnergy(ns, ALL_INDUSTRY_NAMES)
  cycleManager.registerRecurrentFunction(() =>
    buyTeaAndThrowParties(ns, ALL_INDUSTRY_NAMES)
  )

  ns.print('Expanding warehouses')
  for (const [divisionName, cityName] of getDivisionsAndCities(
    ns,
    ALL_INDUSTRY_NAMES
  )) {
    expandWarehouse(ns, divisionName, cityName, WAREHOUSE_CAP)
  }

  ns.print('Setting up loop exports')
  for (const cityName of CITY_NAMES) {
    // Buy initial chemicals to start agriculture for 2 cycles
    ns.corporation.buyMaterial(
      AGRICULTURE_DIV_NAME,
      cityName,
      MATERIALS.CHEMICALS,
      (2 * PLANT_PRODUCTION) / 5
    )

    // Production boosting materials
    ns.corporation.buyMaterial(
      TOBACCO_DIV_NAME,
      cityName,
      MATERIALS.REAL_ESTATE,
      TOBACCO_REAL_ESTATE / 10
    )
    ns.corporation.buyMaterial(
      TOBACCO_DIV_NAME,
      cityName,
      MATERIALS.ROBOTS,
      TOBACCO_ROBOTS / 10
    )
    ns.corporation.buyMaterial(
      AGRICULTURE_DIV_NAME,
      cityName,
      MATERIALS.REAL_ESTATE,
      AGRICULTURE_REAL_ESTATE / 10
    )
    ns.corporation.buyMaterial(
      CHEM_DIV_NAME,
      cityName,
      MATERIALS.REAL_ESTATE,
      CHEM_REAL_ESTATE / 10
    )
    ns.corporation.buyMaterial(
      CHEM_DIV_NAME,
      cityName,
      MATERIALS.ROBOTS,
      CHEM_ROBOTS / 10
    )
  }

  await cycleManager.waitForCycle()

  for (const cityName of CITY_NAMES) {
    ns.corporation.buyMaterial(
      AGRICULTURE_DIV_NAME,
      cityName,
      MATERIALS.CHEMICALS,
      0
    )

    ns.corporation.buyMaterial(
      TOBACCO_DIV_NAME,
      cityName,
      MATERIALS.REAL_ESTATE,
      0
    )
    ns.corporation.buyMaterial(TOBACCO_DIV_NAME, cityName, MATERIALS.ROBOTS, 0)
    ns.corporation.buyMaterial(
      AGRICULTURE_DIV_NAME,
      cityName,
      MATERIALS.REAL_ESTATE,
      0
    )
    ns.corporation.buyMaterial(
      CHEM_DIV_NAME,
      cityName,
      MATERIALS.REAL_ESTATE,
      0
    )
    ns.corporation.buyMaterial(CHEM_DIV_NAME, cityName, MATERIALS.ROBOTS, 0)
  }

  for (const cityName of CITY_NAMES) {
    ns.corporation.buyMaterial(
      AGRICULTURE_DIV_NAME,
      cityName,
      MATERIALS.WATER,
      PLANT_PRODUCTION / 2
    )

    ns.corporation.buyMaterial(
      CHEM_DIV_NAME,
      cityName,
      MATERIALS.WATER,
      PLANT_PRODUCTION / 10
    )

    // Setup exports
    ns.corporation.exportMaterial(
      AGRICULTURE_DIV_NAME,
      cityName,
      CHEM_DIV_NAME,
      cityName,
      MATERIALS.PLANTS,
      PLANT_PRODUCTION / 5
    )
    ns.corporation.exportMaterial(
      CHEM_DIV_NAME,
      cityName,
      AGRICULTURE_DIV_NAME,
      cityName,
      MATERIALS.CHEMICALS,
      PLANT_PRODUCTION / 5
    )

    // Sell leftovers
    ns.corporation.sellMaterial(
      AGRICULTURE_DIV_NAME,
      cityName,
      MATERIALS.FOOD,
      'MAX',
      '0'
    )
    ns.corporation.sellMaterial(
      AGRICULTURE_DIV_NAME,
      cityName,
      MATERIALS.PLANTS,
      'MAX',
      '0'
    )
  }

  await cycleManager.waitForCycle()

  ns.print('Waiting for Hi-Tech research in Tobacco')
  while (true) {
    if (
      ns.corporation.getDivision(TOBACCO_DIV_NAME).researchPoints >
      HI_TECH_RESEARCH
    ) {
      ns.corporation.research(TOBACCO_DIV_NAME, RESEARCHES.HI_TECH)
      ns.print('Purchased Hi-Tech research in Tobacco')
      break
    }

    await cycleManager.waitForCycle()
  }

  ns.print('Waiting for Hi-Tech research in loop divisions')
  while (true) {
    if (
      ns.corporation.getDivision(AGRICULTURE_DIV_NAME).researchPoints >
        HI_TECH_RESEARCH &&
      ns.corporation.getDivision(CHEM_DIV_NAME).researchPoints >
        HI_TECH_RESEARCH
    ) {
      ns.corporation.research(AGRICULTURE_DIV_NAME, RESEARCHES.HI_TECH)
      ns.corporation.research(CHEM_DIV_NAME, RESEARCHES.HI_TECH)
      ns.print('Purchased Hi-Tech research in loop divisions')
      break
    }

    await cycleManager.waitForCycle()
  }

  ns.print('Waiting for Market-TA.II in Tobacco')
  while (true) {
    if (
      ns.corporation.getDivision(TOBACCO_DIV_NAME).researchPoints >
      MARKET_TA_II_RESEARCH
    ) {
      ns.corporation.research(TOBACCO_DIV_NAME, RESEARCHES.MARKET_TA_I)
      ns.corporation.research(TOBACCO_DIV_NAME, RESEARCHES.MARKET_TA_II)
      ns.print('Purchased Market-TA.II in Tobacco')
      break
    }

    await cycleManager.waitForCycle()
  }

  ns.print('Reassigning Tobacco employees')
  for (const cityName of CITY_NAMES) {
    for (const position of Object.values(EMPLOYEE_POSITIONS)) {
      if (position !== 'Unassigned') {
        ns.corporation.setAutoJobAssignment(
          TOBACCO_DIV_NAME,
          cityName,
          position,
          0
        )
      }
    }

    await cycleManager.waitForCycle()

    if (cityName === CITIES.SECTOR_12) {
      const thirdEmployees = Math.round(N_EMPLOYEES / 3)

      ns.corporation.setAutoJobAssignment(
        TOBACCO_DIV_NAME,
        cityName,
        EMPLOYEE_POSITIONS.OPERATIONS,
        thirdEmployees
      )
      ns.corporation.setAutoJobAssignment(
        TOBACCO_DIV_NAME,
        cityName,
        EMPLOYEE_POSITIONS.ENGINEER,
        thirdEmployees
      )
      ns.corporation.setAutoJobAssignment(
        TOBACCO_DIV_NAME,
        cityName,
        EMPLOYEE_POSITIONS.MANAGEMENT,
        thirdEmployees
      )
    } else {
      const fourthEmployees = Math.round(N_EMPLOYEES / 4)

      ns.corporation.setAutoJobAssignment(
        TOBACCO_DIV_NAME,
        cityName,
        EMPLOYEE_POSITIONS.OPERATIONS,
        fourthEmployees
      )
      ns.corporation.setAutoJobAssignment(
        TOBACCO_DIV_NAME,
        cityName,
        EMPLOYEE_POSITIONS.ENGINEER,
        fourthEmployees
      )
      ns.corporation.setAutoJobAssignment(
        TOBACCO_DIV_NAME,
        cityName,
        EMPLOYEE_POSITIONS.MANAGEMENT,
        fourthEmployees
      )
      ns.corporation.setAutoJobAssignment(
        TOBACCO_DIV_NAME,
        cityName,
        EMPLOYEE_POSITIONS.R_AND_D,
        fourthEmployees
      )
    }
  }

  cycleManager.registerRecurrentFunction(createProductManager(ns))

  ns.print('Waiting for first product to be completed')
  while (
    ns.corporation.getProduct(
      TOBACCO_DIV_NAME,
      CITIES.SECTOR_12,
      getProductName(0)
    ).developmentProgress < 100
  ) {
    await cycleManager.waitForCycle()
  }

  ns.print('Hiring maximum amount of AdVert in Tobacco')
  while (
    ns.corporation.getCorporation().funds >=
    ns.corporation.getHireAdVertCost(TOBACCO_DIV_NAME)
  ) {
    ns.corporation.hireAdVert(TOBACCO_DIV_NAME)
  }

  ns.print('Redirecting all leftover plants to Tobacco')
  for (const cityName of CITY_NAMES) {
    ns.corporation.exportMaterial(
      AGRICULTURE_DIV_NAME,
      cityName,
      TOBACCO_DIV_NAME,
      cityName,
      MATERIALS.PLANTS,
      `EPROD - ${(PLANT_PRODUCTION / 5).toFixed(6)}`
    )
  }

  ns.print('Entering tea party mode')
  while (true) {
    await cycleManager.waitForCycle()
  }
}
