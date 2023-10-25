import "./ArmyModifiersPanel.css";
import { ModifierNames, inModifierNames, Modifiers, toMultiplier } from "../types/Modifiers";
import { Tech } from "../types/Tech";
import { ChangeEventHandler, useEffect, useState } from "react";
import { GlobalCSSClasses } from "../enum/GlobalCSSClasses";

const MoralePanel = (props: {
        baseMorale: number, 
        setter: (type: ModifierNames, value: number) => void,
}): JSX.Element => {
    const [bonusMoralePercent, setBonusMoralePercent] = useState(0);

    const totalMorale = (bonusPercent?: number) => {
        return props.baseMorale * toMultiplier(bonusPercent ?? bonusMoralePercent)
    }

    useEffect(() => props.setter(ModifierNames.MORALE, totalMorale()),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props.baseMorale])

    const handleInput: ChangeEventHandler<HTMLInputElement> = (e) => {
        const value: number = (e.target.value === "") ? 0 : parseFloat(e.target.value);
        if (!isNaN(value)) {
            props.setter(ModifierNames.MORALE, totalMorale(value));
            setBonusMoralePercent(value);
        }
        e.target.value = "";
    }

    return (
        <div className="morale-panel">
            <h4 className={GlobalCSSClasses.ALL_COL_SPAN}>Morale</h4>

            <span className={GlobalCSSClasses.TWO_COL_SPAN}>Base Morale:</span>
            <span className={GlobalCSSClasses.CALC_DISPLAY}>{props.baseMorale}</span>

            <span className={GlobalCSSClasses.TWO_COL_SPAN}>Bonus Morale:</span>
            <div style={{display: "inline"}}>
                <input 
                    id="morale-input"
                    type="number"
                    min={0}
                    step={0.1} 
                    name={ModifierNames.MORALE} 
                    onChange={handleInput} 
                    value={bonusMoralePercent}
                />
                <label htmlFor="morale-input">%</label>
            </div>

            <span className={GlobalCSSClasses.TWO_COL_SPAN}>Total Morale:</span>
            <span className={GlobalCSSClasses.CALC_DISPLAY}>{totalMorale()}</span>
        </div>
    )
}

const TacticsPanel = (props: {
        discipline: number,
        baseTactics: number,
        setter: (type: ModifierNames, value: number) => void,
}): JSX.Element => {
    const [bonusTactics, setBonusTactics] = useState(0);

    const totalTactics = (bonus?: number, discipline?: number) => {
        const base = (props.baseTactics + (bonus ?? bonusTactics))
        return base * toMultiplier(discipline ?? props.discipline);
    }

    useEffect(() => props.setter(ModifierNames.TACTICS, totalTactics()),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props.baseTactics, props.discipline])

    const handleInput: ChangeEventHandler<HTMLInputElement> = (e) => {
        const name: ModifierNames = e.target.name as ModifierNames
        const value: number = (e.target.value === "") ? 0 : parseFloat(e.target.value);
        if (!isNaN(value)) {
            if (name === ModifierNames.DISCIPLINE) {
                props.setter(ModifierNames.DISCIPLINE, value);
            } else if (name === ModifierNames.TACTICS) {
                props.setter(name, totalTactics(value));
                setBonusTactics(value);
            }
        }
        e.target.value = "";
    }

    return (
        <div className={`${GlobalCSSClasses.THREE_COL_SPAN} tactics-panel`}>
            <h4 className={GlobalCSSClasses.THREE_COL_SPAN}>Discipline and Tactics</h4>

            <span className={GlobalCSSClasses.TWO_COL_SPAN}>Base Tactics:</span>
            <span className={GlobalCSSClasses.CALC_DISPLAY}>{props.baseTactics}</span>

            <span className={GlobalCSSClasses.TWO_COL_SPAN}>Bonus Tactics</span>
            <input 
                id="bonus-tactics"
                className="army-modifier-input" 
                type="number" 
                min={0}
                step={0.1} 
                name={ModifierNames.TACTICS} 
                onChange={handleInput} 
                value={bonusTactics}
            />

            <span className={GlobalCSSClasses.TWO_COL_SPAN}>Discipline:</span>
            <div>
                <input 
                    id="discipline"
                    className="army-modifier-input" 
                    type="number" 
                    min={0}
                    step={0.5} 
                    name={ModifierNames.DISCIPLINE} 
                    onChange={handleInput} 
                    value={props.discipline}
                />
                <label htmlFor="discipline">%</label>
            </div>

            <span className={GlobalCSSClasses.TWO_COL_SPAN}>Total Tactics:</span>
            <span className={GlobalCSSClasses.CALC_DISPLAY}>{totalTactics(bonusTactics).toFixed(2)}</span>
        </div>
    )
}

export default function ArmyModifiersPanel(props: {
            modifiers: Modifiers,
            tech: Tech,
            className?: string,
            callback: (fn: ((state: Modifiers) => Modifiers)) => void,
        }) { 
    const setModifier = (name: ModifierNames, value: number) => {
        props.callback(state => ({...state, [name]: value}));
    }

    const handleModifierInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const name: ModifierNames = event.target.name as ModifierNames
        const value: number = (event.target.value === "") ? 0 : parseFloat(event.target.value);
        if (inModifierNames(name) && !isNaN(value)) {
            setModifier(name, value);
        }
    }

    return (
        <div className={`${props.className} army-modifiers-panel`}>
            <MoralePanel baseMorale={props.tech.morale} setter={setModifier}/>
            <TacticsPanel 
                discipline={props.modifiers.discipline} 
                baseTactics={props.tech.tactics}
                setter={setModifier}
            />
            <div className={`${GlobalCSSClasses.ALL_COL_SPAN} modifiers-panel`}>
                <h4 className={GlobalCSSClasses.FOUR_COL_SPAN}>Damage Dealt/Received</h4>    
                <h5>Dealt</h5>
                <h5>Received</h5>
                <span className={GlobalCSSClasses.FOUR_COL_SPAN}>Land Fire Damage:</span>
                <div>
                    <input 
                        type="number" 
                        step={1} 
                        min={0}
                        name={ModifierNames.FIRE_DAMAGE} 
                        onChange={handleModifierInput} 
                        value={props.modifiers[ModifierNames.FIRE_DAMAGE] ?? 0}/>
                    <label>%</label>
                </div>
                <div>
                    <input 
                        type="number" 
                        step={1}
                        min={-99}
                        max={0} 
                        name={ModifierNames.FIRE_DAMAGE_RECEIVED} 
                        onChange={handleModifierInput} 
                        value={props.modifiers[ModifierNames.FIRE_DAMAGE_RECEIVED] ?? 0}
                    />
                    <label>%</label>
                </div>
                <span className={GlobalCSSClasses.FOUR_COL_SPAN}>Shock Damage:</span>
                <div>
                    <input 
                        className="army-modifier-type" 
                        type="number" 
                        step={1} 
                        min={0}
                        name={ModifierNames.SHOCK_DAMAGE} 
                        onChange={handleModifierInput} 
                        value={props.modifiers[ModifierNames.SHOCK_DAMAGE] ?? 0}
                    />
                    <label>%</label>
                </div>
                <div>
                    <input 
                        type="number" 
                        step={1}
                        min={-99}
                        max={0}
                        name={ModifierNames.SHOCK_DAMAGE_RECEIVED} 
                        onChange={handleModifierInput} 
                        value={props.modifiers[ModifierNames.SHOCK_DAMAGE_RECEIVED] ?? 0}
                    />
                    <label>%</label>
                </div>

                <span className={GlobalCSSClasses.FOUR_COL_SPAN}>Morale Damage:</span>
                <div>
                    <input 
                        className="army-modifier-input" 
                        type="number" 
                        min={0}
                        step={0} 
                        name={ModifierNames.MORALE_DAMAGE} 
                        onChange={handleModifierInput} 
                        value={props.modifiers[ModifierNames.MORALE_DAMAGE] ?? 0}/>
                    <label>%</label>
                </div>
                <div>
                    <input 
                        type="number" 
                        min={-99}
                        max={0}
                        name={ModifierNames.MORALE_DAMAGE_RECEIVED} 
                        onChange={handleModifierInput} 
                        value={props.modifiers[ModifierNames.MORALE_DAMAGE_RECEIVED] ?? 0}
                    />
                    <label>%</label>
                </div>
            </div>
        </div>
        
    );
};