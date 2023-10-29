import { RegimentTypes } from "../enum/RegimentTypes";

export type DamageMultipliers = {
    [Type in RegimentTypes]: {
        fire: number,
        shock: number
    }
}