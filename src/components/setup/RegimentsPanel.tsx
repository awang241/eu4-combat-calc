import "./RegimentsPanel.css";
import UnitTypes, { UnitType } from "../../enum/UnitTypes";
import Unit, { blankUnit, unitCompare } from "../../types/Unit";
import {v4 as uuidv4} from 'uuid';
import { ChangeEvent, ChangeEventHandler, Dispatch, useEffect, useMemo, useState } from "react";
import { Action, ArmyState } from "../../state/ArmyState";
import { combatAbility } from "../../enum/Modifiers";

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
        units: Unit[], 
        dispatch: Dispatch<Action>
    }
): JSX.Element => {
    const [selected, setSelected] = useState(USE_LATEST_PREFIX);

    const options = useMemo(() => {
        const options: string[] = new Array(...props.units).sort(unitCompare()).map(unit => unit.name + ` (${unit.techLevel})`);
        options.unshift(options.length === 0 ? NONE: USE_LATEST_PREFIX);
        return options;
    }, [props.units])

    const handleSelectUnit = (event: ChangeEvent<HTMLSelectElement>): void => {
        let selectedUnit: Unit | undefined = undefined;
        const value = event.target.value
        if (value === USE_LATEST_PREFIX) {
            selectedUnit = getLatestUnit(props.units);
        } else {
            if (value !== NONE) {
                selectedUnit = props.units.find(unit => value.startsWith(unit.name));
            }
        }
        if (selectedUnit !== undefined) {
            props.dispatch({actionType: "setUnitState", value: selectedUnit, unitType: selectedUnit.type});
            setSelected(event.target.value);
        }
    }

    useEffect(() => {
        let updated: Unit | undefined;
        if (props.units.length === 0) {
            setSelected(NONE);
            updated = blankUnit(props.regType);
        } else if (selected === USE_LATEST_PREFIX || !props.units.some(unit => selected.startsWith(unit.name))) {
            setSelected(USE_LATEST_PREFIX);
            updated = getLatestUnit(props.units);
        }
        if (updated !== undefined) {
            props.dispatch({actionType: "setUnitState", value: updated, unitType: updated.type});
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.units])
    

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
    dispatch: Dispatch<Action>,
    type: UnitType,
    units: Unit[],
}): JSX.Element {

    const handleCountInput = (e: ChangeEvent<HTMLInputElement>): void => {
        let result = parseInt(e.target.value);
        if (!isNaN(result)) {
            props.dispatch({actionType: "setUnitState", value: result, unitType: props.type});
        }
    }

    const handleAbilityInput = (e: ChangeEvent<HTMLInputElement>): void => {
        let result = parseFloat(e.target.value);
        if (!isNaN(result)) {
            props.dispatch({actionType: "setModifier", value: [combatAbility(props.type), result]});
        }
    }

    return (
        <div className="regiments-row">
            <span>{`${props.type[0].toUpperCase()}${props.type.slice(1)}:`}</span>
            <UnitSelector 
                units={props.units} 
                regType={props.type} 
                dispatch={props.dispatch}
            />
            <input 
                type="number" 
                disabled={props.units.length === 0}
                value= {props.state[props.type][1]}
                min={0}
                onChange={handleCountInput}
            />
            <CombatAbilityInput 
                value={props.state[combatAbility(props.type)]} 
                handler={handleAbilityInput} 
            />
        </div>
    )
}


export default function RegimentsPanel(props: {
            className?: string,
            state: ArmyState,
            dispatch: Dispatch<Action>,
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
                units={infantry} 
                type="infantry" 
            />

            <RegimentsRow 
                state={props.state} 
                dispatch={props.dispatch} 
                units={cavalry} 
                type="cavalry"
            />

            <RegimentsRow 
                state={props.state} 
                dispatch={props.dispatch} 
                units={artillery} 
                type="artillery" 
            />
        </div>
    );
}