import { DamageTable } from "./DamageTable"

export type Tech = {
    level: number,
    morale: number,
    tactics: number,
    damages: DamageTable
    width: number,
    flankingRange: number
}