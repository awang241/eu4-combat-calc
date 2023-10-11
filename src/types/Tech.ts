import { DamageMultipliers } from "./DamageMultipliers"
import TechGroup from "./TechGroup"

export type TechState = {
    level: number,
    group: TechGroup
}

export function defaultTechState(): TechState { return {level: 3, group: TechGroup.WESTERN}}


export type Tech = {
    level: number,
    morale: number,
    tactics: number,
    damages: DamageMultipliers
    width: number,
    flankingRange: number
}