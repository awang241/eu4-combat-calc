import { RegimentTypes } from "../enum/RegimentTypes";
import { DamageMultipliers } from "../types/DamageMultipliers";
import { Tech, TechState } from "../types/Tech"
import TechGroup, { getTechGroupName, isTechGroup } from "../types/TechGroup"
import { GlobalCSSClasses as CSSClasses } from "../enum/GlobalCSSClasses";

import fireIcon from "../assets/fire.png"
import shockIcon from "../assets/shock.png"

import "./TechPanel.css";


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
    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        let newLevel: number;
        if (event.target.value === "") {
            props.setter((state) => ({...state, level: 0}));
        } else {
            newLevel = parseInt(event.target.value);
            if (!isNaN(newLevel) && newLevel >= 0 && newLevel <= 32) {
                props.setter((state) => ({...state, level: newLevel}));
            }
        }
        event.target.value = "";
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
            <span className={CSSClasses.TWO_COL_SPAN}>Tech Level:</span>
            <input 
                name="input"
                type="number"
                min={0}
                max={32}
                step={1}
                value={props.level}
                onChange={handleInput}
            />
            <span>Tech Group:</span>
            <select className={CSSClasses.TWO_COL_SPAN} onChange={handleSelect} value={props.group}>
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

function ValuesPanel(props: {tech: Tech}) {
    const getFlankingRangeString = (): string => {
        return `+${100 * props.tech.flankingRange}%`
    }
    return (
        <div className="tech-values-panel">
            <span className={CSSClasses.TWO_COL_SPAN}>Base Morale:</span>
            <span className={CSSClasses.CALC_DISPLAY}>{props.tech.morale.toFixed(1)}</span>
            <span className={CSSClasses.TWO_COL_SPAN}>Base Tactics:</span>
            <span className={CSSClasses.CALC_DISPLAY}>{props.tech.tactics.toFixed(2)}</span>
            <span className={CSSClasses.TWO_COL_SPAN}>Combat Width:</span>
            <span className={CSSClasses.CALC_DISPLAY}>{props.tech.width}</span>
            <span className={CSSClasses.TWO_COL_SPAN}>Flanking Range:</span>
            <span className={CSSClasses.CALC_DISPLAY}>{getFlankingRangeString()}</span>
        </div>
        
    )
}

function DamagePanel(props: {multipliers: DamageMultipliers}) {
    return (
        <div className="tech-damage-panel">
            <div className="tech-damage-header">
                <h4>Damages:</h4>
                <div>
                    <img src={fireIcon} alt="Fire icon"/>
                    <h5>Fire:</h5>  
                </div>
                <div>
                    <img src={shockIcon} alt="Shock icon"/>
                    <h5>Shock:</h5>
                </div>
            </div>
            
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
        <ValuesPanel tech={props.tech}/>
        <DamagePanel multipliers={props.tech.damages}/>
    </div>)
}