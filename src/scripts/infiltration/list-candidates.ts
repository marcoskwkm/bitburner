import type { NS } from '@ns'
import { locationsMetadata } from 'scripts/utils/locations-metadata'

const calcReward = (
  maxLevel: number,
  reward: number,
  difficulty: number,
  ns: NS
) => {
  const levelBonus = maxLevel * Math.pow(1.01, maxLevel)

  return (
    Math.pow(reward + 1, 2) *
    Math.pow(difficulty, 3) *
    3e3 *
    levelBonus *
    ns.getBitNodeMultipliers().InfiltrationMoney
  )
}

export async function main(ns: NS) {
  const res = locationsMetadata
    .filter((location) => 'infiltrationData' in location)
    .map((company) => ({
      name: company.name,
      city: company.city,
      rounds: company.infiltrationData?.maxClearanceLevel ?? 0,
      reward: calcReward(
        company.infiltrationData?.maxClearanceLevel ?? 0,
        3,
        company.infiltrationData?.startingSecurityLevel ?? 0,
        ns
      ),
    }))
    .sort((a, b) => b.reward - a.reward)
    .map(
      (company) =>
        `${company.name} (${company.city}, ${
          company.rounds
        } rounds): ${ns.formatNumber(company.reward)} (${ns.formatNumber(
          company.reward / company.rounds
        )} per round)`
    )
    .join('\n')

  ns.tprint('\n' + res)
}
