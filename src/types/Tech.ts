import { DamageMultipliers } from "./DamageMultipliers"

export type Tech = {
    level: number,
    morale: number,
    tactics: number,
    damages: DamageMultipliers
    width: number,
    flankingRange: number
}