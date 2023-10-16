import { useState } from "react";
import { RegimentTypes } from "../../model/Regiment";
import Unit, { blankUnit } from "../Unit";

type Units = {[type in RegimentTypes]: Unit}
type Counts = {[type in RegimentTypes]: number}

export type RegimentsSetters = {
    setCount: (val: number, type: RegimentTypes) => void,
    setUnit: (val: Unit) => void,
    setAbility: (val: number, type: RegimentTypes) => void
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

export function useRegimentsState(initialState?: RegimentsState): [RegimentsState, RegimentsSetters] {
    const newState = defaultRegimentsState();
    const [counts, setCounts] = useState((initialState ?? newState).counts);
    const [units, setUnits] = useState((initialState ?? newState).units);
    const [abilities, setAbilities] = useState((initialState ?? newState).abilities);
    const setCount = (val: number, type: RegimentTypes) => {
        setCounts((state) => {return {...state, [type]: val}});
    };
    const setUnit = (val: Unit) => {
        setUnits((state) => {return {...state, [val.type]: val}});
    };
    const setAbility = (val: number, type: RegimentTypes) => {
        setAbilities((state) => {return {...state, [type]: val}});
    };
    return [{counts, units, abilities}, {setCount, setUnit, setAbility}]
}

