import { createContext, useContext } from "react"
import { ArmyState, ArmyStateDispatch } from "../../state/ArmyState"

type ArmySetupContextContent = {
    state: ArmyState,
    dispatch: ArmyStateDispatch,
}

export const ArmySetupContext = createContext<ArmySetupContextContent | null>(null);

export function useArmySetupContext(){
    const content = useContext(ArmySetupContext);
    if (content === null) {
        throw Error("useArmySetupContext must have a provided context");
    }
    return content;
}