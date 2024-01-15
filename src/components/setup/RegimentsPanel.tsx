import "./RegimentsPanel.css";
import UnitTypes, { UnitType } from "../../enum/UnitTypes";
import Unit, { blankUnit, unitCompare } from "../../types/Unit";
import {v4 as uuidv4} from 'uuid';
import { ChangeEvent, ChangeEventHandler, useEffect, useMemo, useState } from "react";
import { combatAbility } from "../../enum/Modifiers";
import { ArmyState, ArmyStateDispatch } from "../../state/ArmyState";

const USE_LATEST_PREFIX = "Use Latest: ";
const NONE = "(none)";

const UNIT_SELECT = "unit-select";

function getLatestUnit(unitsList: Unit[]): Unit | undefined {
    if (unitsList.length === 0) {
        return undefined
    } else {
        const unit = unitsList.reduce((prev, curr) => prev.techLevel < curr.techLevel ? curr : prev);
        return unit;
    }
}


//Sub-components start here
const UnitSelector = (
    props: {
        regType: UnitType, 
        availableUnits: Unit[],
        currentUnit: Unit,
        dispatch: ArmyStateDispatch
    }
): JSX.Element => {
    const [selected, setSelected] = useState(USE_LATEST_PREFIX);
    
    const options = useMemo(() => {
        const options: string[] = new Array(...props.availableUnits).sort(unitCompare()).map(unit => unit.name + ` (${unit.techLevel})`);
        options.unshift(options.length === 0 ? NONE: USE_LATEST_PREFIX);
        return options;
    }, [props.availableUnits])

    const handleSelectUnit = (event: ChangeEvent<HTMLSelectElement>): void => {
        let selectedUnit: Unit | undefined = undefined;
        const value = event.target.value
        if (value === USE_LATEST_PREFIX) {
            selectedUnit = getLatestUnit(props.availableUnits);
        } else {
            if (value !== NONE) {
                selectedUnit = props.availableUnits.find(unit => value.startsWith(unit.name));
            }
        }
        if (selectedUnit !== undefined) {
            props.dispatch({type: "units", payload: {[selectedUnit.type]: selectedUnit} });
            setSelected(event.target.value);
        }
    }

    useEffect(() => {
        let updated: Unit | undefined;
        if (props.availableUnits.length === 0 && selected !== NONE) {
            setSelected(NONE);
            updated = blankUnit(props.regType);
        } else if (selected === USE_LATEST_PREFIX) {
            const latestUnit = getLatestUnit(props.availableUnits);
            if (latestUnit !== props.currentUnit) {
                updated = latestUnit;
            }
        } else if (!props.availableUnits.includes(props.currentUnit)) {
            setSelected(USE_LATEST_PREFIX);
            updated = getLatestUnit(props.availableUnits);
        }
        if (updated !== undefined) {
            props.dispatch({type: "units", payload: {[updated.type]: updated} });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.availableUnits])
    

    return (
        <select 
            className={UNIT_SELECT}
            value={selected}
            onChange={handleSelectUnit}
            disabled={options.at(0) === NONE}>
                {options.map(name => 
                <option key={name} value={name}>
                    {name === USE_LATEST_PREFIX ? USE_LATEST_PREFIX + options.at(1): name}
                </option>)}
        </select>
    )
}

const CombatAbilityInput = (
    props: {
        value: number, 
        handler: ChangeEventHandler<HTMLInputElement>,
    }
): JSX.Element => {
    const id = uuidv4();
    
    return (
        <div className="combat-ability-input">
            <input id={id}
                type="number" 
                value={props.value}
                min={0}
                step={0.1}
                onChange={props.handler}
            />
            <label htmlFor={id}>%</label>
        </div>
    )
}

function RegimentsRow(props: {
    state: ArmyState,
    dispatch: ArmyStateDispatch,
    type: UnitType,
    availableUnits: Unit[],
}): JSX.Element {
    
    const handleCountInput = (e: ChangeEvent<HTMLInputElement>): void => {
        let result = parseInt(e.target.value);
        if (!isNaN(result)) {
            props.dispatch({type: "regimentCounts", payload: {[props.type]: result} });
        }
    }

    const handleAbilityInput = (e: ChangeEvent<HTMLInputElement>): void => {
        let result = parseFloat(e.target.value);
        if (!isNaN(result)) {
            props.dispatch({type: "modifiers", payload: {[combatAbility(props.type)]: result} });
        }
    }

    return (
        <div className="regiments-row">
            <span>{`${props.type[0].toUpperCase()}${props.type.slice(1)}:`}</span>
            <UnitSelector 
                availableUnits={props.availableUnits}
                currentUnit={props.state.units[props.type]}
                regType={props.type}
                dispatch={props.dispatch}
            />
            <input 
                type="number" 
                disabled={props.availableUnits.length === 0}
                value= {props.state.regimentCounts[props.type]}
                min={0}
                onChange={handleCountInput}
            />
            <CombatAbilityInput 
                value={props.state.modifiers[combatAbility(props.type)]} 
                handler={handleAbilityInput} 
            />
        </div>
    )
}


export default function RegimentsPanel(props: {
            className?: string,
            state: ArmyState,
            dispatch: ArmyStateDispatch,
            units: Unit[],
        }) {
    const {infantry, cavalry, artillery} = useMemo(() => {
        const unitLists: Record<UnitType, Unit[]> = {infantry: [], cavalry: [], artillery: []}
        props.units.forEach(unit => unitLists[unit.type].push(unit));
        for (const type of Object.values(UnitTypes)) {
            unitLists[type as UnitType].sort(unitCompare())
        }
        return unitLists;
    }, [props.units]);

    return (
        <div className={`${props.className} regiments-panel`}>
            <span/>
            <h5 className={UNIT_SELECT}>Unit:</h5>
            <h5>Regiments:</h5>
            <h5>Combat Ability(%):</h5>

            <RegimentsRow
                state={props.state} 
                dispatch={props.dispatch} 
                availableUnits={infantry} 
                type="infantry" 
            />

            <RegimentsRow 
                state={props.state} 
                dispatch={props.dispatch} 
                availableUnits={cavalry} 
                type="cavalry"
            />

            <RegimentsRow 
                state={props.state} 
                dispatch={props.dispatch} 
                availableUnits={artillery} 
                type="artillery" 
            />
        </div>
    );
}