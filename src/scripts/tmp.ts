import { NS } from '@ns'

import {
  CITIES,
  CITY_NAMES,
  EMPLOYEE_POSITIONS,
  INDUSTRIES,
  MATERIALS,
} from 'scripts/corporations/constants'
import { expandWarehouse, hireEmployees } from 'scripts/corporations/utils'

const WAREHOUSE_CAP = 50400

export async function main(ns: NS) {
  for (let i = 0; i < 14; i++) {
    const divName = `Nepfoods ${i + 3}`
    ns.corporation.expandIndustry(INDUSTRIES.RESTAURANT, divName)

    for (const city of CITY_NAMES) {
      if (city !== CITIES.SECTOR_12) {
        ns.corporation.expandCity(divName, city)
        ns.corporation.purchaseWarehouse(divName, city)
      }

      expandWarehouse(ns, divName, city, WAREHOUSE_CAP)
      ns.corporation.buyMaterial(divName, city, MATERIALS.REAL_ESTATE, 1e6)
      ns.corporation.buyMaterial(divName, city, MATERIALS.AI_CORES, 1e5)
      ns.corporation.buyMaterial(divName, city, MATERIALS.ROBOTS, 1e4)

      hireEmployees(ns, divName, city, 303)
      if (city !== CITIES.SECTOR_12) {
        ns.corporation.setAutoJobAssignment(
          divName,
          city,
          EMPLOYEE_POSITIONS.R_AND_D,
          303
        )
      } else {
        ns.corporation.setAutoJobAssignment(
          divName,
          city,
          EMPLOYEE_POSITIONS.OPERATIONS,
          101
        )
        ns.corporation.setAutoJobAssignment(
          divName,
          city,
          EMPLOYEE_POSITIONS.ENGINEER,
          101
        )
        ns.corporation.setAutoJobAssignment(
          divName,
          city,
          EMPLOYEE_POSITIONS.MANAGEMENT,
          101
        )
      }
    }

    ns.corporation.makeProduct(
      divName,
      CITIES.SECTOR_12,
      'Nepmeals',
      1e21,
      1e21
    )
  }
}
