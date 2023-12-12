import { Modifier } from "../enum/Modifiers";
import { TechGroup } from "../enum/TechGroups";
import { UnitType } from "../enum/UnitTypes";
import { Leader } from "../types/Leader";
import Unit from "../types/Unit";

export type TechState = {
    level: number,
    group: TechGroup,
}

export type ArmyState = {
    modifiers: Record<Modifier, number>,
    units: Record<UnitType, Unit>,
    regimentCounts: Record<UnitType, number>,
    tech: TechState,
    leader: Leader,
}

type UpdateArmyStateAction<T extends keyof ArmyState> = {
    type: T,
    payload: Partial<ArmyState[T]>
}

export type ArmyStateDispatch = React.Dispatch<UpdateArmyStateAction<keyof ArmyState>>;
export function armyStateReducer<T extends keyof ArmyState>(state: ArmyState, action: UpdateArmyStateAction<T>): ArmyState {
    const updatedState: ArmyState = {
        modifiers: {...state.modifiers},
        units: {...state.units},
        regimentCounts: {...state.regimentCounts},
        tech: {...state.tech},
        leader: {...state.leader},
    }
    updatedState[action.type] = {...state[action.type], ...action.payload};
    return updatedState
}
