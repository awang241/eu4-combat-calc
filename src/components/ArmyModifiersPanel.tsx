import "./ArmyModifiersPanel.css";
import { ModifierNames, inModifierNames } from "../model/data/Modifiers";
import { ArmyModifiers } from "../App";

export default function ArmyModifiersPanel(props: {
            modifiers: ArmyModifiers,
            callback: (fn: ((state: ArmyModifiers) => ArmyModifiers) | ArmyModifiers) => void,
        }) {

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const name: ModifierNames = event.target.name as ModifierNames
        const value: number = parseFloat(event.target.value);
        if (inModifierNames(name) && !isNaN(value)) {
            props.callback((state) => {
                return {...state, [name]: value};
            })
        }
    }

    return (
        <div className="army-modifiers-panel">
                <label id="morale-label">Morale:</label>
                <span/>
                <input 
                    id="morale-input"
                    type="number"
                    min={0}
                    step={0.1} 
                    name={ModifierNames.MORALE} 
                    onChange={handleInput} 
                    value={props.modifiers[ModifierNames.MORALE] ?? 0}/>
                <label className="column-span-two">Bonus Discipline %:</label>
                <span/>
                <input 
                    className="army-modifier-input" 
                    type="number" 
                    step={0} 
                    name={ModifierNames.DISCIPLINE} 
                    onChange={handleInput} 
                    value={props.modifiers[ModifierNames.DISCIPLINE] ?? 0}/>
                <span/>
                <h5>Dealt</h5>
                <h5>Received</h5>
                <label className="army-modifier-label">Land Fire Damage %:</label>
                <input 
                    type="number" 
                    step={1} 
                    name={ModifierNames.FIRE_DAMAGE} 
                    onChange={handleInput} 
                    value={props.modifiers[ModifierNames.FIRE_DAMAGE] ?? 0}/>
                <input 
                    type="number" 
                    step={0} 
                    max={0} 
                    name={ModifierNames.FIRE_DAMAGE_RECEIVED} 
                    onChange={handleInput} 
                    value={props.modifiers[ModifierNames.FIRE_DAMAGE_RECEIVED] ?? 0}/>

                <label className="army-modifier-label">Shock Damage %:</label>
                <input 
                    className="army-modifier-type" 
                    type="number" 
                    step={0} 
                    name={ModifierNames.SHOCK_DAMAGE} 
                    onChange={handleInput} 
                    value={props.modifiers[ModifierNames.SHOCK_DAMAGE] ?? 0}/>
                <input 
                    type="number" 
                    step={0} 
                    name={ModifierNames.SHOCK_DAMAGE_RECEIVED} 
                    onChange={handleInput} 
                    value={props.modifiers[ModifierNames.SHOCK_DAMAGE_RECEIVED] ?? 0}/>

                <label className="army-modifier-label">Morale Damage %:</label>
                <input 
                    className="army-modifier-input" 
                    type="number" 
                    step={0} 
                    name={ModifierNames.MORALE_DAMAGE} 
                    onChange={handleInput} 
                    value={props.modifiers[ModifierNames.MORALE_DAMAGE] ?? 0}/>
                <input 
                    type="number" 
                    step={0} 
                    name={ModifierNames.MORALE_DAMAGE_RECEIVED} 
                    onChange={handleInput} 
                    value={props.modifiers[ModifierNames.MORALE_DAMAGE_RECEIVED] ?? 0}/>
        </div>
        
    );
};