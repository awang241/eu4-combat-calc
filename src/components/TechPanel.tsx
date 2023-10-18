import { v4 } from "uuid";
import { RegimentTypes } from "../model/Regiment";
import { DamageMultipliers } from "../types/DamageMultipliers";
import { Tech, TechState } from "../types/Tech"
import TechGroup, { getTechGroupName, isTechGroup } from "../types/TechGroup"

import "./TechPanel.css";
import { GlobalCSSClasses as CSSClasses } from "../enum/GlobalCSSClasses";


function DamagesRow(props: {
        damages: {fire: number, shock: number},
        type: RegimentTypes
}): JSX.Element {
    return (
        <>
            <span>{`${props.type}:`}</span>
            <span className={CSSClasses.CALC_DISPLAY}>{props.damages.fire.toFixed(2)}</span>
            <span className={CSSClasses.CALC_DISPLAY}>{props.damages.shock.toFixed(2)}</span>
        </>
    )
}

function SelectorPanel(props: {  
        group: TechGroup,
        level: number,
        setter: (fn: ((state: TechState) => TechState)) => unknown;
}) {
    const id = v4();
    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newLevel: number = parseInt(event.target.value);
        if (!isNaN(newLevel) && newLevel >= 1 && newLevel <= 32) {
            props.setter((state) => {
                return {...state, level: newLevel};
            })
        }
    }

    const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        if (isTechGroup(event.target.value)) {
            props.setter((state) => {
                [].reverse()
                return {...state, group: event.target.value as TechGroup};
            })
        }
    }
    
    return (
        <>
            <label htmlFor={id}>Tech Level:</label>
            <input 
                id={id}
                name="input"
                type="number"
                min={1}
                max={32}
                step={1}
                value={props.level}
                onChange={handleInput}
            />
            <select onChange={handleSelect} value={props.group}>
                {Object.values(TechGroup)
                    .filter(group => group !== TechGroup.NONE)
                    .map(group => {
                        return (
                            <option key={group} value={group}>
                                {getTechGroupName(group)}
                            </option>
                        )
                    })
                }
            </select>
        </                                      >
    )
}

function ValuesPanel(props: {multipliers: DamageMultipliers}) {
    return (
        <div className="tech-values-panel">

            <span></span>
            <h5>Fire:</h5>
            <h5>Shock:</h5>
            <DamagesRow 
                damages={props.multipliers[RegimentTypes.INFANTRY]}
                type={RegimentTypes.INFANTRY}
            />
            <DamagesRow 
                damages={props.multipliers[RegimentTypes.CAVALRY]}
                type={RegimentTypes.CAVALRY}
            />
            <DamagesRow 
                damages={props.multipliers[RegimentTypes.ARTILLERY]}
                type={RegimentTypes.ARTILLERY}
            />
        </div>
        
    )
}
export default function TechPanel(props: {  
        className?: string,
        group: TechGroup,
        tech: Tech,
        updater: (fn: ((state: TechState) => TechState)) => unknown;
}) { 
    return (
    <div className={`${props.className} tech-panel`}>
        <SelectorPanel group={props.group} level={props.tech.level} setter={props.updater}/>
        <ValuesPanel multipliers={props.tech.damages}/>
    </div>)
}