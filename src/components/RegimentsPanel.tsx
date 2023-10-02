import { ChangeEventHandler } from "react";
import "./RegimentsPanel.css";
import { RegimentTypes } from "../model/Regiment";
import { ModifierNames, inModifierNames } from "../model/data/Modifiers";
import { ArmyModifiers } from "../App";

function isRegimentType(name: string) {
    return Object.values(RegimentTypes).includes(name as RegimentTypes);
}

export type RegimentCounts = {
    [regimentType in RegimentTypes]: number
}

export default function RegimentsPanel(props: {
            modifiers: ArmyModifiers;
            counts: RegimentCounts;
            modifierCb: ((fn: (state: ArmyModifiers) => ArmyModifiers) => void);
            countCb: ((fn: (state: RegimentCounts) => RegimentCounts) => void)
        }) {

    const handleInput: ChangeEventHandler<HTMLInputElement> = (event) => {  
        let value: number = parseFloat(event.target.value);
        if (!isNaN(value)){
            if (inModifierNames(event.target.name)) {
                props.modifierCb((state) => {
                    return {...state, [event.target.name]: value};
                })
            } else if (isRegimentType(event.target.name)) {
                props.countCb((state) => {
                    return {...state, [event.target.name]: value};
                })
            }
        }
      }

    return (
            <div className="regiments-panel">
                <span/>
                <h5>Regiments:</h5>
                <h5>Combat Ability(%):</h5>

                <label>Infantry:</label>
                <input type="number" name={RegimentTypes.INFANTRY}
                    value= {props.counts[RegimentTypes.INFANTRY]}
                    onChange={handleInput}/>
                <input type="number" name={ModifierNames.INFANTRY_DAMAGE}
                    value= {props.modifiers.infantryCombatAbility}
                    onChange={handleInput}/>

                <label>Cavalry:</label>
                <input type="number" name={RegimentTypes.CAVALRY}
                    value= {props.counts[RegimentTypes.CAVALRY]}
                    onChange={handleInput}/>
                <input type="number" name={ModifierNames.CAVALRY_DAMAGE}
                    value= {props.modifiers.cavalryCombatAbility}
                    onChange={handleInput}/>
            </div>
    );
}