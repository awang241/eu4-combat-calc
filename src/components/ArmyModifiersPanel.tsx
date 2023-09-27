import { useState } from "react";
import "./ArmyModifiersPanel.css";
import { ModifierNames } from "../model/data/Modifiers";

function createDefaultModifiersMap(): Map<String, number> {
    const defaultMap = new Map<String, number>()
    defaultMap.set(ModifierNames.DISCIPLINE, 0);
    defaultMap.set(ModifierNames.MORALE, 2.5);
    defaultMap.set(ModifierNames.FIRE_DAMAGE, 0);
    defaultMap.set(ModifierNames.FIRE_DAMAGE_RECEIVED, 0);
    defaultMap.set(ModifierNames.SHOCK_DAMAGE, 0);
    defaultMap.set(ModifierNames.SHOCK_DAMAGE_RECEIVED, 0);
    defaultMap.set(ModifierNames.MORALE_DAMAGE, 0);
    defaultMap.set(ModifierNames.MORALE_DAMAGE_RECEIVED, 0);
    return defaultMap;
}

export default function ArmyModifiersPanel(props: {
            update: (val: Map<String, number>, isAttacker: boolean) => void,
            isAttacker: boolean
        }) {
    const [modifiers, setModifiers] = useState(createDefaultModifiersMap());

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const name: string = event.target.name;
        const value: number = parseFloat(event.target.value);
        const updatedModifiers: Map<String, number> = new Map<String, number>(modifiers.entries());
        updatedModifiers.set(name, value);
        setModifiers(updatedModifiers);
        props.update(updatedModifiers, props.isAttacker);
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
                    value={modifiers.get(ModifierNames.MORALE)}/>
                <label className="column-span-two">Bonus Discipline:</label>
                <span/>
                <input 
                    className="army-modifier-input" 
                    type="number" 
                    step={0} 
                    name={ModifierNames.DISCIPLINE} 
                    onChange={handleInput} 
                    value={modifiers.get(ModifierNames.DISCIPLINE)}/>
                <span/>
                <h5>Dealt</h5>
                <h5>Received</h5>
                <label className="army-modifier-label">Land Fire Damage:</label>
                <input 
                    type="number" 
                    step={1} 
                    name={ModifierNames.FIRE_DAMAGE} 
                    onChange={handleInput} 
                    value={modifiers.get(ModifierNames.FIRE_DAMAGE)}/>
                <input 
                    type="number" 
                    step={0} 
                    max={0} 
                    name={ModifierNames.SHOCK_DAMAGE} 
                    onChange={handleInput} 
                    value={modifiers.get(ModifierNames.FIRE_DAMAGE_RECEIVED)}/>

                <label className="army-modifier-label">Shock Damage:</label>
                <input 
                    className="army-modifier-type" 
                    type="number" 
                    step={0} 
                    name={ModifierNames.SHOCK_DAMAGE} 
                    onChange={handleInput} 
                    value={modifiers.get(ModifierNames.SHOCK_DAMAGE)}/>
                <input 
                    type="number" 
                    step={0} 
                    name={ModifierNames.SHOCK_DAMAGE_RECEIVED} 
                    onChange={handleInput} 
                    value={modifiers.get(ModifierNames.SHOCK_DAMAGE_RECEIVED)}/>

                <label className="army-modifier-label">Morale Damage:</label>
                <input 
                    className="army-modifier-input" 
                    type="number" 
                    step={0} 
                    name={ModifierNames.MORALE_DAMAGE} 
                    onChange={handleInput} 
                    value={modifiers.get(ModifierNames.MORALE_DAMAGE)}/>
                <input 
                    type="number" 
                    step={0} 
                    name={ModifierNames.MORALE_DAMAGE_RECEIVED} 
                    onChange={handleInput} 
                    value={modifiers.get(ModifierNames.MORALE_DAMAGE_RECEIVED)}/>
        </div>
        
    );
};