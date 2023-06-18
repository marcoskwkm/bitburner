import { type CorpIndustryName, NS, CorpMaterialName } from '@ns'

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
  waitForCycle,
} from 'scripts/corporations/utils'

const TOBACCO_DIV_NAME = 'Nepsmokes'
const AGRICULTURE_DIV_NAME = 'Nepplants'
const CHEM_DIV_NAME = 'Nepchem'
const N_EMPLOYEES = 204
const WAREHOUSE_CAP = 2400
const WAREHOUSE_CAP_LOOP = 4800
const WILSON_ANALYTICS_LVL = 20
const FOCUS_WIRES_LVL = 60
const NEURAL_ACCELERATORS_LVL = 60
const PROJECT_INSIGHT_LVL = 20
const NNII_LVL = 60
const SMART_FACTORIES_LVL = 60
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

export const doit = async (ns: NS) => {
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

  ns.print('Maximizing employee morale and energy')
  await maximizeMoraleAndEnergy(ns, ALL_INDUSTRY_NAMES)

  ns.print('Expanding warehouses')
  for (const [divisionName, cityName] of getDivisionsAndCities(
    ns,
    ALL_INDUSTRY_NAMES
  )) {
    expandWarehouse(ns, divisionName, cityName, WAREHOUSE_CAP)
  }

  ns.print('Computing market values for loop industries')
  for (const cityName of CITY_NAMES) {
    ns.corporation.buyMaterial(
      AGRICULTURE_DIV_NAME,
      cityName,
      MATERIALS.WATER,
      1000
    )
    ns.corporation.buyMaterial(
      AGRICULTURE_DIV_NAME,
      cityName,
      MATERIALS.CHEMICALS,
      1000
    )

    ns.corporation.buyMaterial(CHEM_DIV_NAME, cityName, MATERIALS.WATER, 1000)
    ns.corporation.buyMaterial(CHEM_DIV_NAME, cityName, MATERIALS.PLANTS, 1000)
  }

  await waitForCycle(ns)
  buyTeaAndThrowParties(ns, ALL_INDUSTRY_NAMES)

  for (const cityName of CITY_NAMES) {
    ns.corporation.buyMaterial(
      AGRICULTURE_DIV_NAME,
      cityName,
      MATERIALS.WATER,
      0
    )
    ns.corporation.buyMaterial(
      AGRICULTURE_DIV_NAME,
      cityName,
      MATERIALS.CHEMICALS,
      0
    )

    ns.corporation.buyMaterial(CHEM_DIV_NAME, cityName, MATERIALS.WATER, 0)
    ns.corporation.buyMaterial(CHEM_DIV_NAME, cityName, MATERIALS.PLANTS, 0)
  }

  for (let i = 0; i < 2; i++) {
    await waitForCycle(ns)
    buyTeaAndThrowParties(ns, ALL_INDUSTRY_NAMES)
  }

  for (const cityName of CITY_NAMES) {
    const getAgricultureProduction = (material: CorpMaterialName) =>
      ns.corporation.getMaterial(AGRICULTURE_DIV_NAME, cityName, material)
        .productionAmount
    const getChemicalProduction = (material: CorpMaterialName) =>
      ns.corporation.getMaterial(CHEM_DIV_NAME, cityName, material)
        .productionAmount

    const agricultureWaterConsumption = -getAgricultureProduction(
      MATERIALS.WATER
    )
    ns.corporation.buyMaterial(
      AGRICULTURE_DIV_NAME,
      cityName,
      MATERIALS.WATER,
      agricultureWaterConsumption
    )

    // We don't care about food
    ns.corporation.sellMaterial(
      AGRICULTURE_DIV_NAME,
      cityName,
      MATERIALS.FOOD,
      'MAX',
      '0'
    )

    // In the same conditions, chem should outproduce agriculture.

    const agriculturePlantProduction = getAgricultureProduction(
      MATERIALS.PLANTS
    ) // APP
    const agricultureChemicalsConsumption = -getAgricultureProduction(
      MATERIALS.CHEMICALS
    ) // ACC
    const chemicalPlantConsumption = -getChemicalProduction(MATERIALS.PLANTS) // CPC
    const chemicalChemicalsProduction = getChemicalProduction(
      MATERIALS.CHEMICALS
    ) // CCP

    // If CPC produces CCP, then x produces ACC
    const x =
      (chemicalPlantConsumption * agricultureChemicalsConsumption) /
      chemicalChemicalsProduction

    // Export to chem just what it needs to produce ACC
    ns.corporation.exportMaterial(
      AGRICULTURE_DIV_NAME,
      cityName,
      CHEM_DIV_NAME,
      cityName,
      MATERIALS.PLANTS,
      x
    )

    ns.corporation.exportMaterial(
      CHEM_DIV_NAME,
      cityName,
      AGRICULTURE_DIV_NAME,
      cityName,
      MATERIALS.CHEMICALS,
      agricultureChemicalsConsumption
    )

    ns.corporation.buyMaterial(
      CHEM_DIV_NAME,
      cityName,
      MATERIALS.WATER,
      x / 2 // From equation ratio
    )

    // Sell leftover plants (for now)
    ns.corporation.sellMaterial(
      AGRICULTURE_DIV_NAME,
      cityName,
      MATERIALS.PLANTS,
      (agriculturePlantProduction - x).toFixed(3),
      'MP'
    )
  }

  ns.print('Finished computing market values')

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

    await waitForCycle(ns)
    buyTeaAndThrowParties(ns, ALL_INDUSTRY_NAMES)
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

    await waitForCycle(ns)
    buyTeaAndThrowParties(ns, ALL_INDUSTRY_NAMES)
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

    await waitForCycle(ns)
    buyTeaAndThrowParties(ns, ALL_INDUSTRY_NAMES)
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

    await waitForCycle(ns)
    buyTeaAndThrowParties(ns, ALL_INDUSTRY_NAMES)

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

  ns.print('Developing new products')
  for (let i = 0; i < 3; i++) {
    ns.corporation.makeProduct(
      TOBACCO_DIV_NAME,
      CITIES.SECTOR_12,
      `${PRODUCT_NAME} ${i}`,
      PRODUCT_INVESTMENT,
      PRODUCT_INVESTMENT
    )
  }

  ns.print('Waiting for first product to be completed')
  while (true) {
    if (
      ns.corporation.getProduct(
        TOBACCO_DIV_NAME,
        CITIES.SECTOR_12,
        `${PRODUCT_NAME} 0`
      ).developmentProgress >= 100
    ) {
      ns.print('First product completed')
      break
    }

    await waitForCycle(ns)
    buyTeaAndThrowParties(ns, ALL_INDUSTRY_NAMES)
  }

  ns.print('Activating Market-TA.II for first product')
  ns.corporation.setProductMarketTA2(
    TOBACCO_DIV_NAME,
    `${PRODUCT_NAME} 0`,
    true
  )

  ns.print('Hiring maximum amount of AdVert in Tobacco')
  while (
    ns.corporation.getCorporation().funds >=
    ns.corporation.getHireAdVertCost(TOBACCO_DIV_NAME)
  ) {
    ns.corporation.hireAdVert(TOBACCO_DIV_NAME)
  }

  ns.print('Expanding warehouses of loop divisions')
  for (const [divisionName, cityName] of getDivisionsAndCities(
    ns,
    LOOP_INDUSTRY_NAMES
  )) {
    expandWarehouse(ns, divisionName, cityName, WAREHOUSE_CAP_LOOP)
  }

  ns.print('Redirecting all leftover plants to Tobacco')
  for (const cityName of CITY_NAMES) {
    const amt = ns.corporation.getMaterial(
      AGRICULTURE_DIV_NAME,
      cityName,
      MATERIALS.PLANTS
    ).desiredSellAmount

    ns.corporation.sellMaterial(
      AGRICULTURE_DIV_NAME,
      cityName,
      MATERIALS.PLANTS,
      '0',
      'MP'
    )
    ns.corporation.exportMaterial(
      AGRICULTURE_DIV_NAME,
      cityName,
      TOBACCO_DIV_NAME,
      cityName,
      MATERIALS.PLANTS,
      amt
    )
  }

  ns.print('Waiting for second product to be completed')
  while (true) {
    if (
      ns.corporation.getProduct(
        TOBACCO_DIV_NAME,
        CITIES.SECTOR_12,
        `${PRODUCT_NAME} 1`
      ).developmentProgress >= 100
    ) {
      ns.print('Second product completed')
      break
    }

    await waitForCycle(ns)
    buyTeaAndThrowParties(ns, ALL_INDUSTRY_NAMES)
  }

  ns.print('Activating Market-TA.II for second product')
  ns.corporation.setProductMarketTA2(
    TOBACCO_DIV_NAME,
    `${PRODUCT_NAME} 1`,
    true
  )

  ns.print('Waiting for third product to be completed')
  while (true) {
    if (
      ns.corporation.getProduct(
        TOBACCO_DIV_NAME,
        CITIES.SECTOR_12,
        `${PRODUCT_NAME} 2`
      ).developmentProgress >= 100
    ) {
      ns.print('Third product completed')
      break
    }

    await waitForCycle(ns)
    buyTeaAndThrowParties(ns, ALL_INDUSTRY_NAMES)
  }

  ns.print('Activating Market-TA.II for third product')
  ns.corporation.setProductMarketTA2(
    TOBACCO_DIV_NAME,
    `${PRODUCT_NAME} 2`,
    true
  )

  // TODO 1: Implement per-cycle market adjustment for loop divisions
  // TODO 2: Increase production multiplier by buying real estate

  ns.print('Entering tea party mode')
  while (true) {
    await waitForCycle(ns)
    buyTeaAndThrowParties(ns, ALL_INDUSTRY_NAMES)
  }
}
