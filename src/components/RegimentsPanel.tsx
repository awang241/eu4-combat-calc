import React, { useState, ChangeEventHandler } from "react";
import "./RegimentsPanel.css";

const CAVALRY = "cavalry";
const INFANTRY = "infantry";
const CAVALRY_COMBAT_ABILITY = "cavalryCombatAbility";
const INFANTRY_COMBAT_ABILITY = "infantryCombatAbility";

function createDefaultValues(): Map<String, number> {
    const map = new Map();
    map.set(INFANTRY, 1);
    map.set(CAVALRY, 0);
    map.set(INFANTRY_COMBAT_ABILITY, 0);
    map.set(CAVALRY_COMBAT_ABILITY, 0);
    return map;
}

export default function RegimentsPanel(props: {update: Function, isAttacker: boolean}) {
    const [values, setValues] = useState(createDefaultValues())

    const handleInput: ChangeEventHandler<HTMLInputElement> = (event) => {    
        const name = event.currentTarget.name;
        const value = parseInt(event.currentTarget.value);
        const updatedValues: Map<String, number> = new Map<String, number>(values.entries());
        updatedValues.set(name, value);
        setValues(updatedValues);
        props.update(updatedValues, props.isAttacker)
      }

    props.update(createDefaultValues());
    return (
            <div className="regiments-panel">
                <span/>
                <label>Regiments:</label>
                <label>Combat Ability:</label>

                <label>Infantry:</label>
                <input type="number" name={INFANTRY}
                    value= {values.get(INFANTRY)}
                    onChange={handleInput}/>
                <input type="number" name={INFANTRY_COMBAT_ABILITY}
                    value= {values.get(INFANTRY_COMBAT_ABILITY)}
                    onChange={handleInput}/>

                <label>Cavalry:</label>
                <input type="number" name={CAVALRY}
                    value= {values.get(CAVALRY)}
                    onChange={handleInput}/>
                <input type="number" name={CAVALRY_COMBAT_ABILITY}
                    value= {values.get(CAVALRY_COMBAT_ABILITY)}
                    onChange={handleInput}/>
            </div>
    );
}