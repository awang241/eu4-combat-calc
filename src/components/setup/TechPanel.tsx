import UnitTypes, { UnitType } from "../../enum/UnitTypes";
import { DamageTable } from "../../types/DamageTable";
import { Tech } from "../../types/Tech"
import TechGroups, { TechGroup } from "../../enum/TechGroups";
import { GlobalCSSClasses as CSSClasses } from "../../enum/GlobalCSSClasses";

import fireIcon from "../../assets/fire.png"
import shockIcon from "../../assets/shock.png"

import "./TechPanel.css";
import { useArmySetupContext } from "./ArmySetupContext";

function DamagesRow(props: {
        damages: {fire: number, shock: number},
        type: UnitType
}): JSX.Element {
    return (
        <>
            <span>{`${props.type}:`}</span>
            <span className={CSSClasses.CALC_DISPLAY}>{props.damages.fire.toFixed(2)}</span>
            <span className={CSSClasses.CALC_DISPLAY}>{props.damages.shock.toFixed(2)}</span>
        </>
    )
}

function SelectorPanel() {
    const {state, dispatch} = useArmySetupContext()
    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        let newLevel: number;
        if (event.target.value === "") {
            dispatch({type: "tech", payload: {level: 0}})
        } else {
            newLevel = parseInt(event.target.value);
            if (!isNaN(newLevel) && newLevel >= 0 && newLevel <= 32) {
                dispatch({type: "tech", payload: {level: newLevel}})
            }
        }
    }

    const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const group: TechGroup | undefined = TechGroups.byDescription(event.target.value);
        if (group !== undefined) {
            dispatch({type: "tech", payload: {group}})
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
                value={state.tech.level}
                onChange={handleInput}
            />
            <span>Tech Group:</span>
            <select className={CSSClasses.TWO_COL_SPAN} onChange={handleSelect} value={state.tech.group.description}>
                {TechGroups.values.map(group => {
                        return (
                            <option key={group.propName} value={group.description}>
                                {group.description}
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

function DamagePanel(props: {multipliers: DamageTable}) {
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
                damages={props.multipliers[UnitTypes.INFANTRY]}
                type={UnitTypes.INFANTRY}
            />
            <DamagesRow 
                damages={props.multipliers[UnitTypes.CAVALRY]}
                type={UnitTypes.CAVALRY}
            />
            <DamagesRow 
                damages={props.multipliers[UnitTypes.ARTILLERY]}
                type={UnitTypes.ARTILLERY}
            />
        </div>
        
    )
}

export default function TechPanel(props: {  
        className?: string,
        tech: Tech,
}) { 
    return (
    <div className={`${props.className} tech-panel`}>
        <SelectorPanel/>
        <ValuesPanel tech={props.tech}/>
        <DamagePanel multipliers={props.tech.damages}/>
    </div>)
}