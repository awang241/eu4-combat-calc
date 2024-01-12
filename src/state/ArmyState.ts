import { Modifier } from "../enum/Modifiers";
import { TechGroup } from "../enum/TechGroups";
import { UnitType } from "../enum/UnitTypes";
import { Leader } from "../types/Leader";
import Unit from "../types/Unit";

const allActionTypes = {
    SET_MODIFIER: "setModifier",
    SET_UNIT_STATE: "setUnitState",
    SET_TECH_STATE: "setTechState",
    SET_LEADER: "setLeader",
} as const;

export type ActionType = typeof allActionTypes[keyof typeof allActionTypes];
export const ActionTypes = allActionTypes as Record<keyof typeof allActionTypes, ActionType>;

export type Action = {
    actionType: typeof allActionTypes.SET_MODIFIER,
    value: [Modifier, number],
} | {
    actionType: typeof allActionTypes.SET_UNIT_STATE,
    value: number | Unit,
    unitType: UnitType
} | {
    actionType: typeof allActionTypes.SET_TECH_STATE,
    value: number | TechGroup,
} | {
    actionType: typeof allActionTypes.SET_LEADER,
    value: [keyof Leader, number],
};

export type TechState = {
    techLevel: number,
    techGroup: TechGroup,
}

export type ArmyState = Record<Modifier, number>
    & Record<UnitType, [Unit, number]>
    & TechState
    & {leader: Leader};

export function armyStateReducer(state: ArmyState, action: Action): ArmyState {
    const newProps: Partial<ArmyState> = {};
    if (action.actionType === "setModifier") {
        const [modifier, value] = action.value;
        newProps[modifier] = value;
    } else if (action.actionType === "setUnitState") {
        const unitState: [Unit, number] = [...state[action.unitType]];
        if (typeof action.value === "number") {
            unitState[1] = action.value;
        } else if (action.unitType === action.value.type){
            unitState[0] = action.value;
        } else {
            throw Error(`Action Error: New unit for ${action.unitType} has wrong unit type (${action.value.type}).`);
        }
        newProps[action.unitType] = unitState;
    } else if (action.actionType === "setTechState") {
        if (typeof action.value === "number") {
            newProps.techLevel = action.value;
        } else {
            newProps.techGroup = action.value;
        }
    } else if (action.actionType === "setLeader"){
        const [key, value] = action.value;
        newProps.leader = {...state.leader, [key]: value};
    } else {
        throw new Error("Error processing action: actionType was not recognized.");
    }
    return {...state, ...newProps};
}