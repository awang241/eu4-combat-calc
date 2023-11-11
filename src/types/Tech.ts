import { DamageTable } from "./DamageTable"
import TechGroups, { TechGroup } from "../enum/TechGroups"
export type TechState = {
    level: number,
    group: TechGroup
}

export function defaultTechState(): TechState { return {level: 3, group: TechGroups.WESTERN}}


export type Tech = {
    level: number,
    morale: number,
    tactics: number,
    damages: DamageTable
    width: number,
    flankingRange: number
}