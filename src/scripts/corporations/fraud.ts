import { NS } from '@ns'

import { MATERIALS } from 'scripts/corporations/constants'

const getCurState = (ns: NS) => ns.corporation.getCorporation().state

export const waitForCycle = async (ns: NS) => {
  const curState = getCurState(ns)

  while (curState === getCurState(ns)) {
    await ns.sleep(100)
  }

  while (curState !== getCurState(ns)) {
    await ns.sleep(100)
  }
}

export const commitFraud = async (ns: NS) => {
  for (const divisionName of ns.corporation.getCorporation().divisions) {
    const division = ns.corporation.getDivision(divisionName)
    for (const cityName of division.cities) {
      const warehouse = ns.corporation.getWarehouse(divisionName, cityName)
      const freeSpace = warehouse.size - warehouse.sizeUsed
      const realEstateObj = ns.corporation.getMaterialData(
        MATERIALS.REAL_ESTATE
      )
      const buyAmt = freeSpace / realEstateObj.size

      ns.corporation.buyMaterial(
        divisionName,
        cityName,
        realEstateObj.name,
        buyAmt / 10
      )

      ns.print(
        `Set ${realEstateObj.name} buy amount in ${cityName} to ${buyAmt}`
      )
    }
  }

  ns.print('Waiting for cycle')
  await waitForCycle(ns)

  for (const divisionName of ns.corporation.getCorporation().divisions) {
    const division = ns.corporation.getDivision(divisionName)
    for (const cityName of division.cities) {
      ns.corporation.buyMaterial(
        divisionName,
        cityName,
        MATERIALS.REAL_ESTATE,
        0
      )
      ns.print(`Set ${MATERIALS.REAL_ESTATE} buy amount in ${cityName} to 0`)
    }
  }
}

export async function main(ns: NS) {
  ns.disableLog('ALL')
  await commitFraud(ns)
}
