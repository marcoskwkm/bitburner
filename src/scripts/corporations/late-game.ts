/*
 * Script to run after or right before 3rd round of investment.
 * Produces new products, expands development city and hire AdVerts.
 */

import { NS } from '@ns'

import {
  CITIES,
  EMPLOYEE_POSITIONS,
  INDUSTRIES,
} from 'scripts/corporations/constants'
import { buyTeaAndThrowParties, waitForCycle } from 'scripts/corporations/utils'

const TOBACCO_DIV_NAME = 'Nepsmokes'
const PRODUCT_NAME = 'Neparette'
const SHOULD_DISCONTINUE_TO_DEVELOP = true
const MAX_PRODUCTS = 5

const getProductName = (version: number) => `${PRODUCT_NAME} ${version}`

let lastInvestment = 13.31e21

const createProductManager = (ns: NS) => {
  const inDevelopment = new Set<string>()

  const develop = (version: number) => {
    const name = getProductName(version)

    lastInvestment = Math.max(
      lastInvestment,
      ns.corporation.getCorporation().funds / 10
    )

    ns.print(
      `Investing ${ns.formatNumber(lastInvestment)} for development of ${name}`
    )

    ns.corporation.makeProduct(
      TOBACCO_DIV_NAME,
      CITIES.SECTOR_12,
      name,
      lastInvestment,
      lastInvestment
    )

    inDevelopment.add(name)
  }

  const discontinue = (version: number) => {
    const discontinued = getProductName(version)
    ns.print(`Discontinuing ${discontinued}`)
    ns.corporation.discontinueProduct(TOBACCO_DIV_NAME, discontinued)
  }

  const curProducts = ns.corporation.getDivision(TOBACCO_DIV_NAME).products
  let curVersion =
    1 + Math.max(...curProducts.map((name) => parseInt(name.split(' ')[1])))

  for (let i = curProducts.length; i < MAX_PRODUCTS; i++) {
    develop(curVersion++)
  }

  for (const name of curProducts) {
    const product = ns.corporation.getProduct(
      TOBACCO_DIV_NAME,
      CITIES.SECTOR_12,
      name
    )
    if (product.developmentProgress < 100) {
      inDevelopment.add(name)
    }
  }

  if (inDevelopment.size === 0 && SHOULD_DISCONTINUE_TO_DEVELOP) {
    discontinue(curVersion - MAX_PRODUCTS)
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

        if (inDevelopment.size === 0 && SHOULD_DISCONTINUE_TO_DEVELOP) {
          discontinue(curVersion - MAX_PRODUCTS)
          develop(curVersion++)
        }
      }
    }
  }
}

export async function main(ns: NS) {
  ns.disableLog('ALL')

  const manageProducts = createProductManager(ns)

  while (true) {
    await waitForCycle(ns)
    buyTeaAndThrowParties(ns, [
      INDUSTRIES.TOBACCO,
      INDUSTRIES.AGRICULTURE,
      INDUSTRIES.CHEMICAL,
      INDUSTRIES.RESTAURANT,
    ])
    manageProducts()

    while (true) {
      const expandCost = ns.corporation.getOfficeSizeUpgradeCost(
        TOBACCO_DIV_NAME,
        CITIES.SECTOR_12,
        15
      )
      const adVertCost = ns.corporation.getHireAdVertCost(TOBACCO_DIV_NAME)
      const funds = ns.corporation.getCorporation().funds

      if (
        expandCost <= adVertCost &&
        expandCost <= funds - 2 * lastInvestment
      ) {
        ns.print('Expanding office')
        ns.corporation.upgradeOfficeSize(TOBACCO_DIV_NAME, CITIES.SECTOR_12, 15)

        for (let i = 0; i < 5; i++) {
          ns.corporation.hireEmployee(
            TOBACCO_DIV_NAME,
            CITIES.SECTOR_12,
            EMPLOYEE_POSITIONS.OPERATIONS
          )
          ns.corporation.hireEmployee(
            TOBACCO_DIV_NAME,
            CITIES.SECTOR_12,
            EMPLOYEE_POSITIONS.ENGINEER
          )
          ns.corporation.hireEmployee(
            TOBACCO_DIV_NAME,
            CITIES.SECTOR_12,
            EMPLOYEE_POSITIONS.MANAGEMENT
          )
        }
      } else if (
        adVertCost <= expandCost &&
        adVertCost <= funds - 2 * lastInvestment
      ) {
        ns.print('Hiring AdVert')
        ns.corporation.hireAdVert(TOBACCO_DIV_NAME)
      } else {
        break
      }
    }
  }
}
