import "./ArmyModifiersPanel.css";
import { ModifierNames, inModifierNames, Modifiers, toMultiplier } from "../types/Modifiers";
import { Tech } from "../types/Tech";
import { useState } from "react";
import Unit from "../types/Unit";
import { RegimentTypes } from "../model/Regiment";



export default function ArmyModifiersPanel(props: {
            modifiers: Modifiers,
            tech: Tech,
            callback: (fn: ((state: Modifiers) => Modifiers)) => void,
        }) {
    const [moralePercent, setMoralePercent] = useState(0);

    const calculatePercentChange = (baseValue: number, percent: number): number => {
        return baseValue * toMultiplier(percent);
    }

    const handleModifierInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const name: ModifierNames = event.target.name as ModifierNames
        const value: number = (event.target.value === "") ? 0 : parseFloat(event.target.value);
        if (inModifierNames(name) && !isNaN(value)) {
            let modifierValue: number = value;
            if (name === ModifierNames.MORALE) {
                modifierValue = calculatePercentChange(props.tech.morale, value);
                setMoralePercent(value);
            }
            props.callback((state) => {
                return {...state, [name]: modifierValue};
            })
        }
    }

    return (
        <div className="army-modifiers-panel">
            <div className="top-grid">
                <div className="two-column-grid">
                    <h4 id="morale-label">Morale</h4>

                    <span>Base Morale:</span>
                    <input
                        disabled={true}
                        type="number"
                        value={props.tech.morale}
                    />

                    <span>Bonus:</span>
                    <div style={{display: "inline"}}>
                        <input 
                            id="morale-input"
                            type="number"
                            min={0}
                            step={0.1} 
                            name={ModifierNames.MORALE} 
                            onChange={handleModifierInput} 
                            value={moralePercent}
                        />
                        <label htmlFor="morale-input">%</label>
                    </div>
                    
                    <span>Total Morale:</span>
                    <input 
                        disabled={true}
                        type="number"
                        value={calculatePercentChange(props.tech.morale, moralePercent).toFixed(2)}
                    />
                </div>
                <div className="two-column-grid">
                    <h4>Discipline and Tactics</h4>

                    <span>Base Tactics:</span>
                    <input
                        disabled={true}
                        type="number"
                        value={props.tech.tactics}
                    />

                    <span>Bonus Tactics</span>
                    <input 
                        id="bonus-tactics"
                        className="army-modifier-input" 
                        type="number" 
                        min={0}
                        step={0.1} 
                        name={ModifierNames.BONUS_TACTICS} 
                        onChange={handleModifierInput} 
                        value={props.modifiers[ModifierNames.BONUS_TACTICS] ?? 0}
                    />

                    <span>Discipline:</span>
                    <div>
                        <input 
                            id="discipline"
                            className="army-modifier-input" 
                            type="number" 
                            min={0}
                            step={0.5} 
                            name={ModifierNames.DISCIPLINE} 
                            onChange={handleModifierInput} 
                            value={props.modifiers[ModifierNames.DISCIPLINE] ?? 0}
                        />
                        <label htmlFor="discipline">%</label>
                    </div>

                    <span>Total Tactics:</span>
                    <input
                        disabled={true}
                        type="number"
                        value={calculatePercentChange(
                            props.tech.tactics + props.modifiers.bonusTactics,
                             props.modifiers.discipline).toFixed(2)}
                    />
                </div>
            </div>
            <div className="modifier-grid">
                <h4>Damage Dealt/Received</h4>    
                <h5>Dealt</h5>
                <h5>Received</h5>
                <label className="army-modifier-label">Land Fire Damage %:</label>
                <input 
                    type="number" 
                    step={1} 
                    min={0}
                    name={ModifierNames.FIRE_DAMAGE} 
                    onChange={handleModifierInput} 
                    value={props.modifiers[ModifierNames.FIRE_DAMAGE] ?? 0}/>
                <input 
                    type="number" 
                    step={1}
                    min={-99}
                    max={0} 
                    name={ModifierNames.FIRE_DAMAGE_RECEIVED} 
                    onChange={handleModifierInput} 
                    value={props.modifiers[ModifierNames.FIRE_DAMAGE_RECEIVED] ?? 0}/>

                <label className="army-modifier-label">Shock Damage %:</label>
                <input 
                    className="army-modifier-type" 
                    type="number" 
                    step={1} 
                    min={0}
                    name={ModifierNames.SHOCK_DAMAGE} 
                    onChange={handleModifierInput} 
                    value={props.modifiers[ModifierNames.SHOCK_DAMAGE] ?? 0}/>
                <input 
                    type="number" 
                    step={1}
                    min={-99}
                    max={0}
                    name={ModifierNames.SHOCK_DAMAGE_RECEIVED} 
                    onChange={handleModifierInput} 
                    value={props.modifiers[ModifierNames.SHOCK_DAMAGE_RECEIVED] ?? 0}/>

                <label className="army-modifier-label">Morale Damage %:</label>
                <input 
                    className="army-modifier-input" 
                    type="number" 
                    min={0}
                    step={0} 
                    name={ModifierNames.MORALE_DAMAGE} 
                    onChange={handleModifierInput} 
                    value={props.modifiers[ModifierNames.MORALE_DAMAGE] ?? 0}/>
                <input 
                    type="number" 
                    min={-99}
                    max={0}
                    name={ModifierNames.MORALE_DAMAGE_RECEIVED} 
                    onChange={handleModifierInput} 
                    value={props.modifiers[ModifierNames.MORALE_DAMAGE_RECEIVED] ?? 0}
                />
            </div>
        </div>
        
    );
};