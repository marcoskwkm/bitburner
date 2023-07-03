/*
 * Implements corporation management strategy for 3rd investment round.
 * Expects corporation to have no divisions.
 * As of 2.3.1, this goes infinite.
 * Estimated run time (in BN-3.x): 5h 30m
 */

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
  getDivisions,
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
const SMART_STORAGE_LVL = 50
const AGRICULTURE_REAL_ESTATE = 3e6
const CHEM_REAL_ESTATE = 1e6
const CHEM_ROBOTS = 30e3
const TOBACCO_REAL_ESTATE = 1e6
const TOBACCO_ROBOTS = 30e3
const PLANT_PRODUCTION = 3800
const HI_TECH_RESEARCH = 5000
const MARKET_TA_II_RESEARCH = 70000
const HIRE_STEP = 12

const PRODUCT_NAME = 'Neparette'
const PRODUCT_INVESTMENT = 10e9
const RESTAURANT_NAME = 'Nepmeals'

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

const getRestaurantDivision = (idx: number) => `Nepfoods ${idx}`

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

const makeUpgrades = (ns: NS, fullRND: boolean) => {
  while (true) {
    const funds = ns.corporation.getCorporation().funds - 2 * PRODUCT_INVESTMENT

    const actions = [
      ...[
        UPGRADES.WILSON_ANALYTICS,
        UPGRADES.FOCUS_WIRES,
        UPGRADES.NEURAL_ACCELERATORS,
        UPGRADES.PROJECT_INSIGHT,
        UPGRADES.NNII,
        UPGRADES.SMART_FACTORIES,
        UPGRADES.ABC_SALESBOTS,
      ].map((upgrade) => ({
        cost: ns.corporation.getUpgradeLevelCost(upgrade),
        action: () => ns.corporation.levelUpgrade(upgrade),
      })),
      {
        cost: ns.corporation.getHireAdVertCost(TOBACCO_DIV_NAME),
        action: () => ns.corporation.hireAdVert(TOBACCO_DIV_NAME),
      },
      {
        cost:
          CITY_NAMES.length *
          ns.corporation.getOfficeSizeUpgradeCost(
            TOBACCO_DIV_NAME,
            CITIES.SECTOR_12,
            HIRE_STEP
          ),
        action: () =>
          CITY_NAMES.forEach((cityName) => {
            ns.corporation.upgradeOfficeSize(
              TOBACCO_DIV_NAME,
              cityName,
              HIRE_STEP
            )
            if (fullRND) {
              for (let i = 0; i < HIRE_STEP; i++) {
                ns.corporation.hireEmployee(
                  TOBACCO_DIV_NAME,
                  cityName,
                  EMPLOYEE_POSITIONS.R_AND_D
                )
              }
            } else {
              if (cityName === CITIES.SECTOR_12) {
                const third = Math.round(HIRE_STEP / 3)
                for (let i = 0; i < third; i++) {
                  ns.corporation.hireEmployee(
                    TOBACCO_DIV_NAME,
                    cityName,
                    EMPLOYEE_POSITIONS.OPERATIONS
                  )
                  ns.corporation.hireEmployee(
                    TOBACCO_DIV_NAME,
                    cityName,
                    EMPLOYEE_POSITIONS.ENGINEER
                  )
                  ns.corporation.hireEmployee(
                    TOBACCO_DIV_NAME,
                    cityName,
                    EMPLOYEE_POSITIONS.MANAGEMENT
                  )
                }
              } else {
                const fourth = Math.round(HIRE_STEP / 4)
                for (let i = 0; i < fourth; i++) {
                  ns.corporation.hireEmployee(
                    TOBACCO_DIV_NAME,
                    cityName,
                    EMPLOYEE_POSITIONS.OPERATIONS
                  )
                  ns.corporation.hireEmployee(
                    TOBACCO_DIV_NAME,
                    cityName,
                    EMPLOYEE_POSITIONS.ENGINEER
                  )
                  ns.corporation.hireEmployee(
                    TOBACCO_DIV_NAME,
                    cityName,
                    EMPLOYEE_POSITIONS.MANAGEMENT
                  )
                  ns.corporation.hireEmployee(
                    TOBACCO_DIV_NAME,
                    cityName,
                    EMPLOYEE_POSITIONS.R_AND_D
                  )
                }
              }
            }
          }),
      },
    ].sort((a, b) => a.cost - b.cost)

    const action = actions[0]

    if (action.cost > funds) {
      return
    }

    action.action()
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

  ns.print('Creating Restaurant divisions for round 4')
  let nRestaurantDivisions = 0
  for (let i = 0; i < 17; i++) {
    try {
      ns.corporation.expandIndustry(
        INDUSTRIES.RESTAURANT,
        getRestaurantDivision(i)
      )

      nRestaurantDivisions++
    } catch (err) {
      ns.print('Error while expanding industry. Most likely reached limit.')
      break
    }
  }

  ns.print('Expanding divisions to all cities')
  for (const divisionName of getDivisions(ns, [
    ...ALL_INDUSTRY_NAMES,
    INDUSTRIES.RESTAURANT,
  ])) {
    expandToAllCities(ns, divisionName)
  }

  ns.print('Hiring employees')
  for (const [divisionName, cityName] of getDivisionsAndCities(ns, [
    ...ALL_INDUSTRY_NAMES,
    INDUSTRIES.RESTAURANT,
  ])) {
    hireEmployees(ns, divisionName, cityName, N_EMPLOYEES)
  }

  ns.print('Assigning all Tobacco and Restaurant employees to R&D')
  for (const [divisionName, cityName] of getDivisionsAndCities(ns, [
    INDUSTRIES.TOBACCO,
    INDUSTRIES.RESTAURANT,
  ])) {
    ns.corporation.setAutoJobAssignment(
      divisionName,
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

  ns.print('Leveling Smart Storage')
  upgradeToLevel(ns, UPGRADES.SMART_STORAGE, SMART_STORAGE_LVL)

  ns.print('Expanding warehouses')
  for (const [divisionName, cityName] of getDivisionsAndCities(ns, [
    ...ALL_INDUSTRY_NAMES,
    INDUSTRIES.RESTAURANT,
  ])) {
    expandWarehouse(ns, divisionName, cityName, WAREHOUSE_CAP)
  }

  ns.print('Maximizing employee morale and energy')
  await maximizeMoraleAndEnergy(ns, [
    ...ALL_INDUSTRY_NAMES,
    INDUSTRIES.RESTAURANT,
  ])
  // cycleManager.registerRecurrentFunction(() =>
  //   buyTeaAndThrowParties(ns, [...ALL_INDUSTRY_NAMES, INDUSTRIES.RESTAURANT])
  // )

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
    // Prices should be low enough to sell everything, but also high enough
    // so the company profit stays positive.
    ns.corporation.sellMaterial(
      AGRICULTURE_DIV_NAME,
      cityName,
      MATERIALS.FOOD,
      'MAX',
      '0.2*MP'
    )
    ns.corporation.sellMaterial(
      AGRICULTURE_DIV_NAME,
      cityName,
      MATERIALS.PLANTS,
      'MAX',
      '0.4*MP'
    )
  }

  await cycleManager.waitForCycle()

  ns.print('Buying all other upgrades')
  makeUpgrades(ns, true)

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

  ns.print('Waiting for Hi-Tech research in Restaurants')
  while (true) {
    const divName = getRestaurantDivision(0)
    if (ns.corporation.getDivision(divName).researchPoints > HI_TECH_RESEARCH) {
      ns.corporation.research(divName, RESEARCHES.HI_TECH)
      ns.print('Purchased Hi-Tech research in Restaurants')
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

  ns.print('Waiting for Market-TA.II in Restaurants')
  while (true) {
    const divName = getRestaurantDivision(0)
    if (
      ns.corporation.getDivision(divName).researchPoints > MARKET_TA_II_RESEARCH
    ) {
      ns.corporation.research(divName, RESEARCHES.MARKET_TA_I)
      ns.corporation.research(divName, RESEARCHES.MARKET_TA_II)
      ns.print('Purchased Market-TA.II in Restaurants')
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

    const nEmployees = ns.corporation.getOffice(
      TOBACCO_DIV_NAME,
      cityName
    ).numEmployees

    if (cityName === CITIES.SECTOR_12) {
      const thirdEmployees = Math.round(nEmployees / 3)

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
      const fourthEmployees = Math.round(nEmployees / 4)

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

  cycleManager.registerRecurrentFunction(() =>
    buyTeaAndThrowParties(ns, [...ALL_INDUSTRY_NAMES, INDUSTRIES.RESTAURANT])
  )

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

  ns.print('Waiting until profit reaches 1Q/s')
  while (ns.corporation.getDivision(TOBACCO_DIV_NAME).lastCycleRevenue < 1e18) {
    await cycleManager.waitForCycle()
    makeUpgrades(ns, false)
  }

  ns.print('Using restaurants to go to the moon')
  for (let i = 0; i < nRestaurantDivisions; i++) {
    const divName = getRestaurantDivision(i)
    ns.corporation.makeProduct(
      divName,
      CITIES.SECTOR_12,
      RESTAURANT_NAME,
      PRODUCT_INVESTMENT,
      PRODUCT_INVESTMENT
    )

    ns.corporation.setAutoJobAssignment(
      divName,
      CITIES.SECTOR_12,
      EMPLOYEE_POSITIONS.R_AND_D,
      0
    )
  }

  await cycleManager.waitForCycle()

  for (let i = 0; i < nRestaurantDivisions; i++) {
    const divName = getRestaurantDivision(i)
    const thirdEmployees = Math.round(N_EMPLOYEES / 3)

    ns.corporation.setAutoJobAssignment(
      divName,
      CITIES.SECTOR_12,
      EMPLOYEE_POSITIONS.OPERATIONS,
      thirdEmployees
    )
    ns.corporation.setAutoJobAssignment(
      divName,
      CITIES.SECTOR_12,
      EMPLOYEE_POSITIONS.ENGINEER,
      thirdEmployees
    )
    ns.corporation.setAutoJobAssignment(
      divName,
      CITIES.SECTOR_12,
      EMPLOYEE_POSITIONS.MANAGEMENT,
      thirdEmployees
    )
  }

  ns.print(`Waiting for product developments`)
  while (
    [...new Array(nRestaurantDivisions)].some(
      (_, i) =>
        ns.corporation.getProduct(
          getRestaurantDivision(i),
          CITIES.SECTOR_12,
          RESTAURANT_NAME
        ).developmentProgress < 100
    )
  ) {
    await cycleManager.waitForCycle()
  }

  ns.print('Activating Market-TA.II')
  for (let i = 0; i < nRestaurantDivisions; i++) {
    ns.corporation.setProductMarketTA2(
      getRestaurantDivision(i),
      RESTAURANT_NAME,
      true
    )
  }

  ns.print(`Buying production boosting materials`)
  for (const [divName, cityName] of getDivisionsAndCities(ns, [
    INDUSTRIES.RESTAURANT,
  ])) {
    ns.corporation.buyMaterial(
      divName,
      cityName,
      MATERIALS.REAL_ESTATE,
      TOBACCO_REAL_ESTATE / 10
    )
    ns.corporation.buyMaterial(
      divName,
      cityName,
      MATERIALS.ROBOTS,
      TOBACCO_ROBOTS / 10
    )
  }

  await cycleManager.waitForCycle()

  for (const [divName, cityName] of getDivisionsAndCities(ns, [
    INDUSTRIES.RESTAURANT,
  ])) {
    ns.corporation.buyMaterial(divName, cityName, MATERIALS.REAL_ESTATE, 0)
    ns.corporation.buyMaterial(divName, cityName, MATERIALS.ROBOTS, 0)
  }

  ns.print('Reassigning employees')
  for (const [divName, cityName] of getDivisionsAndCities(ns, [
    INDUSTRIES.RESTAURANT,
  ])) {
    for (const position of Object.values(EMPLOYEE_POSITIONS)) {
      if (position !== 'Unassigned') {
        ns.corporation.setAutoJobAssignment(divName, cityName, position, 0)
      }
    }
  }

  await cycleManager.waitForCycle()
  for (const [divName, cityName] of getDivisionsAndCities(ns, [
    INDUSTRIES.RESTAURANT,
  ])) {
    const fourthEmployees = Math.round(N_EMPLOYEES / 4)

    ns.corporation.setAutoJobAssignment(
      divName,
      cityName,
      EMPLOYEE_POSITIONS.OPERATIONS,
      fourthEmployees
    )
    ns.corporation.setAutoJobAssignment(
      divName,
      cityName,
      EMPLOYEE_POSITIONS.ENGINEER,
      fourthEmployees
    )
    ns.corporation.setAutoJobAssignment(
      divName,
      cityName,
      EMPLOYEE_POSITIONS.MANAGEMENT,
      fourthEmployees
    )
    ns.corporation.setAutoJobAssignment(
      divName,
      cityName,
      EMPLOYEE_POSITIONS.BUSINESS,
      fourthEmployees
    )
  }

  const offer = ns.corporation.getInvestmentOffer().funds
  ns.print(`Accepting 3rd offer (${ns.formatNumber(offer)})`)
  ns.corporation.acceptInvestmentOffer()

  ns.print('Buying all possible Wilson upgrades')
  while (
    ns.corporation.getUpgradeLevelCost(UPGRADES.WILSON_ANALYTICS) <=
    ns.corporation.getCorporation().funds
  ) {
    ns.corporation.levelUpgrade(UPGRADES.WILSON_ANALYTICS)
  }

  for (let i = 0; i < nRestaurantDivisions; i++) {
    ns.print(`Launching restaurant ${i}`)
    const divName = getRestaurantDivision(i)

    for (const cityName of CITY_NAMES) {
      if (i > 0) {
        ns.corporation.cancelExportMaterial(
          AGRICULTURE_DIV_NAME,
          cityName,
          getRestaurantDivision(i - 1),
          cityName,
          MATERIALS.FOOD
        )
      }
      ns.corporation.exportMaterial(
        AGRICULTURE_DIV_NAME,
        cityName,
        divName,
        cityName,
        MATERIALS.FOOD,
        500
      )

      ns.corporation.buyMaterial(divName, cityName, MATERIALS.WATER, 500)
    }

    const wilsonCost = ns.corporation.getUpgradeLevelCost(
      UPGRADES.WILSON_ANALYTICS
    )
    while (wilsonCost > ns.corporation.getCorporation().funds) {
      while (
        ns.corporation.getHireAdVertCost(divName) <
        Math.min(wilsonCost, ns.corporation.getCorporation().funds)
      ) {
        ns.corporation.hireAdVert(divName)
      }

      await cycleManager.waitForCycle()
    }

    while (
      ns.corporation.getUpgradeLevelCost(UPGRADES.WILSON_ANALYTICS) <=
      ns.corporation.getCorporation().funds
    ) {
      ns.corporation.levelUpgrade(UPGRADES.WILSON_ANALYTICS)
    }
  }

  ns.print('Reaching the moon')
  const lastDivName = getRestaurantDivision(nRestaurantDivisions - 1)
  while (ns.corporation.getDivision(lastDivName).awareness < 1.79e308) {
    while (
      ns.corporation.getHireAdVertCost(lastDivName) <
      ns.corporation.getCorporation().funds
    ) {
      ns.corporation.hireAdVert(lastDivName)
    }

    await cycleManager.waitForCycle()
  }

  ns.print('Welcome to the moon')
}
