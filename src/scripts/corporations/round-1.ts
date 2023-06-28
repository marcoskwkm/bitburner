/*
 * Implements corporation management strategy for 1st investment round.
 * Expects corporation in initial state.
 * As of 2.3.1, this should get an offer between 16t and 18t.
 * Estimated run time (in BN-3.x): 2m 14s
 */

import { type CorpIndustryName, NS } from '@ns'

import {
  CITY_NAMES,
  EMPLOYEE_POSITIONS,
  INDUSTRIES,
  MATERIALS,
  UPGRADES,
} from 'scripts/corporations/constants'
import {
  expandToAllCities,
  expandWarehouse,
  findInvestors,
  hireEmployees,
  maximizeMoraleAndEnergy,
  upgradeToLevel,
  waitForCycle,
} from 'scripts/corporations/utils'

const DIVISION_NAME = 'Nepfoods'
const INDUSTRY: CorpIndustryName = 'Restaurant'
const WAREHOUSE_CAP = 200
const N_EMPLOYEES = 6
const WILSON_ANALYTICS_UPGRADES = 1
const ABC_SALESBOTS_UPGRADES = 2
const N_ADVERT_HIRES = 27

export const doit = async (ns: NS) => {
  ns.print('Creating new Restaurant division')
  ns.corporation.expandIndustry(INDUSTRY, DIVISION_NAME)

  ns.print('Expanding to all cities')
  expandToAllCities(ns, DIVISION_NAME)

  ns.print('Expanding warehouses')
  for (const cityName of CITY_NAMES) {
    expandWarehouse(ns, DIVISION_NAME, cityName, WAREHOUSE_CAP)
  }

  ns.print('Hiring employees')
  for (const cityName of CITY_NAMES) {
    hireEmployees(ns, DIVISION_NAME, cityName, N_EMPLOYEES)

    ns.corporation.setAutoJobAssignment(
      DIVISION_NAME,
      cityName,
      EMPLOYEE_POSITIONS.BUSINESS,
      N_EMPLOYEES
    )
  }

  ns.print('Buying upgrades')
  upgradeToLevel(ns, UPGRADES.WILSON_ANALYTICS, WILSON_ANALYTICS_UPGRADES)
  upgradeToLevel(ns, UPGRADES.ABC_SALESBOTS, ABC_SALESBOTS_UPGRADES)

  ns.print('Hiring AdVert')
  for (let i = 0; i < N_ADVERT_HIRES; i++) {
    ns.corporation.hireAdVert(DIVISION_NAME)
  }

  ns.print('Maximizing employee morale and energy')
  await maximizeMoraleAndEnergy(ns, [INDUSTRIES.RESTAURANT])

  ns.print('Filling warehouses with Real Estate')
  for (const cityName of CITY_NAMES) {
    const warehouse = ns.corporation.getWarehouse(DIVISION_NAME, cityName)
    const freeSpace = warehouse.size - warehouse.sizeUsed
    const realEstateObj = ns.corporation.getMaterialData(MATERIALS.REAL_ESTATE)
    const buyAmt = freeSpace / realEstateObj.size

    ns.corporation.buyMaterial(
      DIVISION_NAME,
      cityName,
      realEstateObj.name,
      buyAmt / 10
    )
  }

  await waitForCycle(ns)

  for (const cityName of CITY_NAMES) {
    ns.corporation.buyMaterial(
      DIVISION_NAME,
      cityName,
      MATERIALS.REAL_ESTATE,
      0
    )
  }

  ns.print('Starting fraud')
  for (const cityName of CITY_NAMES) {
    ns.corporation.sellMaterial(
      DIVISION_NAME,
      cityName,
      MATERIALS.REAL_ESTATE,
      'MAX',
      'MP'
    )
  }

  return await findInvestors(ns)
}
