import { UnitType } from "../enum/UnitTypes";
import Unit, { blankUnit } from "../types/Unit";

export enum ActionType{
    SET_COUNT = "SET_COUNT",
    SET_UNIT = "SET_UNIT",
    SET_ABILITY = "SET_ABILITY"
}

export type Action = {
    type: ActionType,
    value?: number,
    regType?: UnitType,
    unit?: Unit
}

export type RegimentsState = {
    counts: Record<UnitType, number>,
    units: Record<UnitType, Unit>,
    abilities: Record<UnitType, number>,
};

const defaultUnits = {
    infantry: blankUnit(),
    cavalry: blankUnit("cavalry"),
    artillery: blankUnit("artillery"),
}
export function defaultRegimentsState(units: Record<UnitType, Unit> = defaultUnits): RegimentsState {
    return { 
        counts: {
            infantry: 1,
            cavalry: 0,
            artillery: 0,
        },
        units: {...units},
        abilities: {
            infantry: 1,
            cavalry: 0,
            artillery: 0,
        },
    }
}

export function regimentsReducer(
        state: RegimentsState,
        action: Action
): RegimentsState {
    if (action.type === ActionType.SET_UNIT) {
        if (action.unit !== undefined) {
            return {...state, units: {...state.units, [action.unit.type]: action.unit}}
        } else {
            throw Error("Cannot set unit to undefined")
        }
    } else if (action.type === ActionType.SET_COUNT) {
        if (action.value !== undefined) {
            return {...state, counts: {...state.counts, [action.regType as UnitType]: action.value}}
        } else {
            throw Error("Cannot set count to undefined")
        }
    } else if (action.type === ActionType.SET_ABILITY) {
        if (action.value !== undefined || action.regType !== undefined) {
            return {...state, abilities: {...state.abilities, [action.regType as UnitType]: action.value}}
        } else {
            throw Error("Cannot set combat ability to undefined")
        }
    } else {
        throw Error("Unknown action passed to regimentsReducer")
    }
}
