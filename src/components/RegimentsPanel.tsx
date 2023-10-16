import "./RegimentsPanel.css";
import { RegimentTypes } from "../model/Regiment";
import Unit, { blankUnit, unitCompare } from "../types/Unit";
import { RegimentsSetters, RegimentsState } from "../types/state/RegimentsState";
import {v4 as uuidv4} from 'uuid';
import { useEffect, useMemo, useState } from "react";

const USE_LATEST_PREFIX = "Use Latest: ";
const NONE = "(none)"


function handleNumericInput(
        value: string,
        regType: RegimentTypes,
        setFn: (val: number, type: RegimentTypes) => void
): void {
    const result = parseFloat(value);
    if (!isNaN(result)) {
        setFn(result, regType);
    }
}


function handleUnitSelect(
    value: string,
    unitList: Unit[],
    setUnitFn: (val: Unit) => void,
    setSelectedFn: (val: string) => void
): void {
    let selectedUnit: Unit | undefined = undefined;
    if (value === USE_LATEST_PREFIX) {
        selectedUnit = getLatestUnit(unitList);
    } else {
        if (value !== NONE) {
            selectedUnit = unitList.find(unit => value.startsWith(unit.name));
        }
    }
    if (selectedUnit !== undefined) {
        setUnitFn(selectedUnit);
        setSelectedFn(value);
    }
}


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
        regType: RegimentTypes, 
        units: Unit[], 
        setter: (val: Unit) => void
    }
): JSX.Element => {
    const [selected, setSelected] = useState(USE_LATEST_PREFIX);

    const options = useMemo(() => {
        const options: string[] = new Array(...props.units).sort(unitCompare()).map(unit => unit.name + ` (${unit.techLevel})`);
        options.unshift(options.length === 0 ? NONE: USE_LATEST_PREFIX);
        return options;
    }, [props.units])

    useEffect(() => {
        if (props.units.length === 0) {
            setSelected(NONE)
            props.setter(blankUnit(props.regType))
        } else {
            if (selected === USE_LATEST_PREFIX || !props.units.some(unit => selected.startsWith(unit.name))) {
                setSelected(USE_LATEST_PREFIX);
                props.setter(getLatestUnit(props.units) ?? blankUnit(props.units.at(0)?.type ?? RegimentTypes.INFANTRY))
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.units])
    

    return (
        <select 
            className="unit-select"
            value={selected}
            onChange={e => handleUnitSelect(e.target.value, props.units, props.setter, setSelected)}
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
        type: RegimentTypes, 
        setter: (val: number, type: RegimentTypes) => void
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
                onChange={e => handleNumericInput(e.target.value, props.type, props.setter)}
            />
            <label htmlFor={id}>%</label>
        </div>
    )
}

function RegimentsRow(props: {
    state: RegimentsState,
    setters: RegimentsSetters,
    type: RegimentTypes
    units: Unit[],
}): JSX.Element {
    return (
        <div className="regiments-row">
            <span>{`${props.type[0].toUpperCase()}${props.type.slice(1)}:`}</span>
            <UnitSelector 
                units={props.units} 
                regType={props.type} 
                setter={props.setters.setUnit}
            />
            <input 
                type="number" 
                value= {props.state.counts[props.type]}
                min={0}
                onChange={e => handleNumericInput(e.target.value, props.type, props.setters.setCount)}
            />
            <CombatAbilityInput 
                value={props.state.abilities[props.type]} 
                setter={props.setters.setAbility} 
                type={props.type}
            />
        </div>
    )
}


export default function RegimentsPanel(props: {
            state: RegimentsState,
            setters: RegimentsSetters,
            units: Unit[],
        }) {
    const [infantry, cavalry, artillery] = useMemo(() => {
        let infantry: Unit[] = [];
        let cavalry: Unit[] = [];
        let artillery: Unit[] = [];
        props.units.forEach(unit => {
            if (unit.type === RegimentTypes.INFANTRY) {
                infantry.push(unit);
            } else if (unit.type === RegimentTypes.CAVALRY) {
                cavalry.push(unit);
            } else {
                artillery.push(unit);
            }
        });
        const result = [infantry, cavalry, artillery];
        result.forEach(units => units.sort(unitCompare()))
        return result;
    }, [props.units])
    

    return (
        <div className="regiments-panel">
            <span/>
            <h5>Unit:</h5>
            <h5>Regiments:</h5>
            <h5>Combat Ability(%):</h5>

            <RegimentsRow state={props.state} setters={props.setters} units={infantry} type={RegimentTypes.INFANTRY} />
            <RegimentsRow state={props.state} setters={props.setters} units={cavalry} type={RegimentTypes.CAVALRY} />

        </div>
    );
}