import { UnitType } from "../enum/UnitTypes";

export type DamageTable = {
    [type in UnitType]: {
        fire: number,
        shock: number
    }
}