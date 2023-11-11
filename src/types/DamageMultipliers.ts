import { UnitType } from "../enum/UnitTypes";

export type DamageMultipliers = {
    [Type in UnitType]: {
        fire: number,
        shock: number
    }
}