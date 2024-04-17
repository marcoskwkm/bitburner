import { type CorpIndustryName, NS } from '@ns'

import { CITY_NAMES } from 'corporations/constants'

const getCurState = (ns: NS) => ns.corporation.getCorporation().prevState

export const waitForCycle = async (ns: NS) => {
  // Forces state to be START
  while (getCurState(ns) !== 'START') {
    await ns.sleep(100)
  }

  while (getCurState(ns) === 'START') {
    await ns.sleep(100)
  }

  while (getCurState(ns) !== 'START') {
    await ns.sleep(100)
  }
}

export const upgradeToLevel = (ns: NS, name: string, level: number) => {
  const curLevel = ns.corporation.getUpgradeLevel(name)

  for (let i = curLevel; i < level; i++) {
    ns.corporation.levelUpgrade(name)
  }
}

export const expandWarehouse = (
  ns: NS,
  division: string,
  city: (typeof CITY_NAMES)[number],
  capacity: number
) => {
  if (!ns.corporation.hasWarehouse(division, city)) {
    ns.corporation.purchaseWarehouse(division, city)
  }

  while (ns.corporation.getWarehouse(division, city).size < capacity) {
    ns.corporation.upgradeWarehouse(division, city)
  }
}

export const expandToAllCities = (ns: NS, division: string) => {
  const curCities = ns.corporation.getDivision(division)
    .cities as typeof CITY_NAMES

  for (const cityName of CITY_NAMES) {
    if (!curCities.includes(cityName)) {
      ns.corporation.expandCity(division, cityName)
    }
  }
}

export const getDivisions = (ns: NS, industries: CorpIndustryName[]) =>
  ns.corporation
    .getCorporation()
    .divisions.filter((divName) =>
      industries.includes(ns.corporation.getDivision(divName).type)
    )

export const getDivisionsAndCities = (
  ns: NS,
  industries: CorpIndustryName[]
) => {
  const dnc: [string, (typeof CITY_NAMES)[number]][] = []

  const divisions = getDivisions(ns, industries)

  for (const divisionName of divisions) {
    for (const cityName of ns.corporation.getDivision(divisionName).cities) {
      dnc.push([divisionName, cityName])
    }
  }

  return dnc
}

export const hireEmployees = (
  ns: NS,
  division: string,
  city: (typeof CITY_NAMES)[number],
  desiredEmployees: number
) => {
  const positionsToOpen =
    desiredEmployees - ns.corporation.getOffice(division, city).size
  if (positionsToOpen > 0) {
    const reqCost = ns.corporation.getOfficeSizeUpgradeCost(
      division,
      city,
      positionsToOpen
    )

    if (reqCost > ns.corporation.getCorporation().funds) {
      throw new Error('Insufficient funds to hire employees')
    }

    ns.corporation.upgradeOfficeSize(division, city, positionsToOpen)
  }

  while (
    ns.corporation.getOffice(division, city).numEmployees < desiredEmployees
  ) {
    if (!ns.corporation.hireEmployee(division, city)) {
      throw new Error('Failed to hire employee')
    }
  }
}

export const buyTeaAndThrowParties = (
  ns: NS,
  industries: CorpIndustryName[]
) => {
  let minStat = 100

  for (const [divisionName, cityName] of getDivisionsAndCities(
    ns,
    industries
  )) {
    const { avgEnergy, avgMorale } = ns.corporation.getOffice(
      divisionName,
      cityName
    )

    minStat = Math.min(minStat, avgEnergy, avgMorale)

    if (!ns.corporation.buyTea(divisionName, cityName)) {
      ns.print(`Can't buy tea for ${divisionName} in ${cityName}`)
      return -1
    }

    const amt = (110.5 - avgMorale) * 100000
    if (!ns.corporation.throwParty(divisionName, cityName, amt)) {
      ns.print(`Can't throw party for ${divisionName} in ${cityName}`)
      return -1
    }
  }

  return minStat
}

export const maximizeMoraleAndEnergy = async (
  ns: NS,
  industries: CorpIndustryName[]
) => {
  while (true) {
    const minStat = buyTeaAndThrowParties(ns, industries)

    if (minStat < 0) {
      return
    } else if (minStat > 99) {
      break
    } else {
      ns.print(
        `-- Buying tea and throwing parties (min stat: ${minStat.toFixed(3)})`
      )
    }

    await waitForCycle(ns)
  }
}

export const findInvestors = async (ns: NS) => {
  let lastOffer = 0

  for (let i = 0; ; i++) {
    await waitForCycle(ns)
    const offer = ns.corporation.getInvestmentOffer()
    ns.print(`Offer after cycle ${i + 1}: ${ns.formatNumber(offer.funds)}`)

    if (offer.funds <= lastOffer) {
      ns.corporation.acceptInvestmentOffer()
      ns.print(`Accepted offer of ${ns.formatNumber(offer.funds)}`)
      lastOffer = offer.funds
      break
    }

    lastOffer = offer.funds
  }

  return lastOffer
}
