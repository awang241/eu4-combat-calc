import { ChangeEventHandler } from "react";
import "./RegimentsPanel.css";
import { RegimentTypes, inRegimentTypes } from "../model/Regiment";
import { ModifierNames, inModifierNames, Modifiers } from "../types/Modifiers";
import Unit from "../types/Unit";
import { RegimentsState } from "../types/state/RegimentsState";

const infCombatAbilityID = "inf-combat-ability-input"
const cavCombatAbilityID = "cav-combat-ability-input"

export default function RegimentsPanel(props: {
            modifiers: Modifiers;
            counts: RegimentsState;
            units: Unit[],
            modifierCb: ((fn: (state: Modifiers) => Modifiers) => void);
            countCb: ((fn: (state: RegimentsState) => RegimentsState) => void)
        }) {

    const handleInput: ChangeEventHandler<HTMLInputElement> = (event) => {  
        let value: number = parseFloat(event.target.value);
        if (!isNaN(value)){
            if (inModifierNames(event.target.name)) {
                props.modifierCb((state) => {
                    return {...state, [event.target.name]: value};
                })
            } else if (inRegimentTypes(event.target.name)) {
                props.countCb((state) => {
                    return {...state, [event.target.name]: value};
                })
            }
        }
    }

    return (
        <div className="regiments-panel">
            <span/>
            <h5>Unit:</h5>
            <h5>Regiments:</h5>
            <h5>Combat Ability(%):</h5>

            <span>Infantry:</span>
            <select>
                {props.units.filter(unit => unit.type === RegimentTypes.INFANTRY).map(unit => (
                    <option key={unit.name}>{`${unit.name} (${unit.techLevel})`}</option>
                ))}
            </select>
            <input type="number" 
                name={RegimentTypes.INFANTRY}
                value= {props.counts[RegimentTypes.INFANTRY]}
                min={0}
                onChange={handleInput}
            />
            <div>
                <input id={infCombatAbilityID}
                    type="number" 
                    name={ModifierNames.INFANTRY_DAMAGE}
                    value= {props.modifiers.infantryCombatAbility}
                    min={0}
                    onChange={handleInput}
                />
                <label htmlFor={infCombatAbilityID}>%</label>
            </div>

            <span>Cavalry:</span>
            <select>
                {props.units.filter(unit => unit.type === RegimentTypes.CAVALRY).map(unit => (
                    <option key={unit.name}>{`${unit.name} (${unit.techLevel})`}</option>
                ))}
            </select>
            <input 
                type="number" 
                name={RegimentTypes.CAVALRY}
                value= {props.counts[RegimentTypes.CAVALRY]}
                min={0}
                onChange={handleInput}
            />
            <div>
                <input id={cavCombatAbilityID}
                    type="number" 
                    name={ModifierNames.CAVALRY_DAMAGE}
                    value= {props.modifiers.cavalryCombatAbility}
                    min={0}
                    onChange={handleInput}
                />
                <label htmlFor={cavCombatAbilityID}>%</label>
            </div>
        </div>
    );
}