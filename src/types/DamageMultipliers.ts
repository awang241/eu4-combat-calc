import { RegimentTypes } from "../model/Regiment";

export type DamageMultipliers = {
    [Type in RegimentTypes]: {
        fire: number,
        shock: number
    }
}