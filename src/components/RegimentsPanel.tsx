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

export default function RegimentsPanel(props: {
            update: (val: Map<String, number>, isAttacker: boolean) => void,
            isAttacker: boolean
        }) {
    const [values, setValues] = useState(createDefaultValues())
    props.update(values, props.isAttacker)

    const handleInput: ChangeEventHandler<HTMLInputElement> = (event) => {    
        const name = event.currentTarget.name;
        const value = parseInt(event.currentTarget.value);
        const updatedValues: Map<String, number> = new Map<String, number>(values.entries());
        updatedValues.set(name, value);
        setValues(updatedValues);
        props.update(updatedValues, props.isAttacker)
      }

    return (
            <div className="regiments-panel">
                <span/>
                <h5>Regiments:</h5>
                <h5>Combat Ability(%):</h5>

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