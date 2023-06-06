import { NS } from '@ns'

export class Server {
  private ns: NS

  name: string
  minDifficulty: number
  maxMoney: number

  constructor(ns: NS, name: string) {
    this.ns = ns
    this.name = name
    this.minDifficulty = ns.getServerMinSecurityLevel(name)
    this.maxMoney = ns.getServerMaxMoney(name)
  }

  getDifficulty() {
    return this.ns.getServerSecurityLevel(this.name)
  }

  getMoney() {
    return this.ns.getServerMoneyAvailable(this.name)
  }
}
