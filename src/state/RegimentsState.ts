import { RegimentTypes } from "../model/Regiment";
import Unit, { blankUnit } from "../types/Unit";

type Units = {[type in RegimentTypes]: Unit}
type Counts = {[type in RegimentTypes]: number}

export enum ActionType{
    SET_COUNT = "SET_COUNT",
    SET_UNIT = "SET_UNIT",
    SET_ABILITY = "SET_ABILITY"
}

export type Action = {
    type: ActionType,
    value?: number,
    regType?: RegimentTypes,
    unit?: Unit
}

export type RegimentsState = {
    counts: Counts,
    units: Units,
    abilities: Counts,
};

export function defaultRegimentsState(units?: Units): RegimentsState {
    return {
        counts: {
            infantry: 1,
            cavalry: 0,
            artillery: 0,
        },
        units: {
            infantry: units?.infantry ?? blankUnit(RegimentTypes.INFANTRY),
            cavalry: units?.cavalry ?? blankUnit(RegimentTypes.CAVALRY),
            artillery: units?.artillery ?? blankUnit(RegimentTypes.ARTILLERY),
        },
        abilities: {
            infantry: 0,
            cavalry: 0,
            artillery: 0
        }
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
            return {...state, counts: {...state.counts, [action.regType as RegimentTypes]: action.value}}
        } else {
            throw Error("Cannot set count to undefined")
        }
    } else if (action.type === ActionType.SET_ABILITY) {
        if (action.value !== undefined || action.regType !== undefined) {
            return {...state, abilities: {...state.abilities, [action.regType as RegimentTypes]: action.value}}
        } else {
            throw Error("Cannot set combat ability to undefined")
        }
    } else {
        throw Error("Unknown action passed to regimentsReducer")
    }
}