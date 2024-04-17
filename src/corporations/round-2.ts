/*
 * Implements corporation management strategy for 2nd investment round.
 * Expects corporation to have no divisions.
 * As of 2.3.1, this should get about 20q funds in investment, assuming
 * round 1 got at least 16t.
 * Estimated run time (in BN-3.x): 2m 20s
 */

import { NS } from '@ns'

import {
  EMPLOYEE_POSITIONS,
  INDUSTRIES,
  MATERIALS,
  UPGRADES,
} from 'corporations/constants'
import {
  expandToAllCities,
  expandWarehouse,
  findInvestors,
  getDivisions,
  getDivisionsAndCities,
  hireEmployees,
  maximizeMoraleAndEnergy,
  upgradeToLevel,
  waitForCycle,
} from 'corporations/utils'

const N_DIVISIONS = 20
const DIVISON_NAME = 'Nepfoods'
const WAREHOUSE_CAP = 1200
const SMART_STORAGE_LVL = 20
const WILSON_ANALYTICS_LVL = 10
const N_EMPLOYEES = 12

const getRestaurantDivisions = (ns: NS) =>
  getDivisions(ns, [INDUSTRIES.RESTAURANT])

const getRestaurantCities = (ns: NS) =>
  getDivisionsAndCities(ns, [INDUSTRIES.RESTAURANT])

export const doit = async (ns: NS) => {
  while (ns.corporation.getCorporation().divisions.length > 0) {
    ns.print('Please sell all existing divisions')
    await ns.sleep(2000)
  }

  ns.print('Creating Restaurant divisions')
  const curRestaurantCnt = getRestaurantDivisions(ns).length

  for (let i = curRestaurantCnt; i < N_DIVISIONS; i++) {
    try {
      ns.corporation.expandIndustry(
        INDUSTRIES.RESTAURANT,
        `${DIVISON_NAME} ${i + 1}`
      )
    } catch (err) {
      ns.print('Error while expanding industry. Most likely reached limit.')
      break
    }
  }

  ns.print('Expanding to all cities')
  for (const divisionName of getRestaurantDivisions(ns)) {
    expandToAllCities(ns, divisionName)
  }

  ns.print('Buying upgrades')
  upgradeToLevel(ns, UPGRADES.SMART_STORAGE, SMART_STORAGE_LVL)
  upgradeToLevel(ns, UPGRADES.WILSON_ANALYTICS, WILSON_ANALYTICS_LVL)

  ns.print('Expanding warehouses')
  for (const [divisionName, cityName] of getRestaurantCities(ns)) {
    expandWarehouse(ns, divisionName, cityName, WAREHOUSE_CAP)
  }

  ns.print('Hiring employees')
  for (const [divisionName, cityName] of getRestaurantCities(ns)) {
    hireEmployees(ns, divisionName, cityName, N_EMPLOYEES)

    ns.corporation.setAutoJobAssignment(
      divisionName,
      cityName,
      EMPLOYEE_POSITIONS.BUSINESS,
      N_EMPLOYEES
    )
  }

  ns.print('Maximizing employee morale and energy')
  await maximizeMoraleAndEnergy(ns, [INDUSTRIES.RESTAURANT])

  ns.print('Hiring AdVert')
  let advertCnt = 0
  for (; ; advertCnt++) {
    const divisionsToHire = getRestaurantDivisions(ns).filter(
      (div) => ns.corporation.getHireAdVertCount(div) <= advertCnt
    )

    const cost = divisionsToHire.reduce(
      (acc, div) => acc + ns.corporation.getHireAdVertCost(div),
      0
    )

    if (cost > ns.corporation.getCorporation().funds) {
      break
    }

    for (const divisionName of divisionsToHire) {
      ns.corporation.hireAdVert(divisionName)
    }
  }
  ns.print(`Hired AdVert ${advertCnt} times`)

  ns.print('Upgrading FocusWires')
  let focusWiresCnt = 0
  while (
    ns.corporation.getUpgradeLevelCost(UPGRADES.FOCUS_WIRES) <
    ns.corporation.getCorporation().funds
  ) {
    ns.corporation.levelUpgrade(UPGRADES.FOCUS_WIRES)
    focusWiresCnt += 1
  }
  ns.print(`Upgraded FocusWires ${focusWiresCnt} times`)

  ns.print(
    `${ns.formatNumber(
      ns.corporation.getCorporation().funds
    )} leftover funds before fraud`
  )

  ns.print('Filling warehouses with Real Estate')
  for (const [divisionName, cityName] of getRestaurantCities(ns)) {
    const warehouse = ns.corporation.getWarehouse(divisionName, cityName)
    const freeSpace = warehouse.size - warehouse.sizeUsed
    const buyAmt =
      freeSpace / ns.corporation.getMaterialData(MATERIALS.REAL_ESTATE).size

    ns.corporation.buyMaterial(
      divisionName,
      cityName,
      MATERIALS.REAL_ESTATE,
      buyAmt / 10
    )
  }

  await waitForCycle(ns)

  for (const [divisionName, cityName] of getRestaurantCities(ns)) {
    ns.corporation.buyMaterial(divisionName, cityName, MATERIALS.REAL_ESTATE, 0)
  }

  ns.print(
    `Starting fraud (leftover funds: ${ns.formatNumber(
      ns.corporation.getCorporation().funds
    )})`
  )

  for (const [divisionName, cityName] of getRestaurantCities(ns)) {
    ns.corporation.sellMaterial(
      divisionName,
      cityName,
      MATERIALS.REAL_ESTATE,
      'MAX',
      'MP'
    )
  }

  return await findInvestors(ns)
}
