import { useMemo, useReducer, useState } from "react";
import { Tech, TechState } from "../../types/Tech";
import Unit from "../../types/Unit";
import ArmyModifiersPanel from "./ArmyModifiersPanel";
import RegimentsPanel from "./RegimentsPanel";
import TechPanel from "./TechPanel";
import TechGroups, { TechGroup } from "../../enum/TechGroups";
import { createEnumRecord } from "../../util/StringEnumUtils";
import Modifiers from "../../enum/Modifiers";
import { defaultRegimentsState, regimentsReducer } from "../../state/RegimentsState";

import "./ArmySetup.css";
import Army from "../../model/Army";

function SectionHeading(props: {
    height: number,
    isVisible: boolean,
    text: string,
}) {
    return <h3>{props.isVisible ? props.text: ""}</h3>
}

export default function ArmySetupPanel(props: {
        areHeadersVisible?: false,
        headerHeight?: number,
        techs: Tech[],
        units: Map<TechGroup, Unit[]>,
}) {
    const [modifiers, setModifiers] = useState(createEnumRecord(0, Modifiers));
    const [tech, setTech] = useState<TechState>({level: 3, group: TechGroups.WESTERN});
    const [regiments, regimentDispatch] = useReducer(regimentsReducer, undefined, defaultRegimentsState)

    const availableUnits = useMemo(() => {
        const source: Unit[] = props.units.get(tech.group) ?? [];
        return source.filter(unit => (unit.techLevel <= tech.level)).sort((a, b) => b.techLevel - a.techLevel);
    }, [tech, props.units]);

    const createArmy = (): Army => {
        return new Army({...regiments.units}, {...regiments.counts}, modifiers, props.techs[tech.level]);
    }
    
    return (
        <div className="army-setup">
            <div id="regiment-modifiers" className='collapsing-panel'>
                <h3 className='full-width'>Regiments and Regiment Modifiers</h3>
                <RegimentsPanel 
                    className='half-width'
                    state={regiments} 
                    units={availableUnits} 
                    dispatch={regimentDispatch}
                />
            </div>
            <div className='collapsing-panel'>
                <h3 className='full-width'>Military Technology</h3>
                <TechPanel 
                    className='half-width'
                    tech={props.techs[tech.level]} 
                    group={tech.group} 
                    updater={setTech}
                />
            </div>
            <div id="army-modifiers" className='collapsing-panel'>
                <h3 className='full-width'>Army Modifiers</h3>
                <ArmyModifiersPanel 
                    className='half-width'
                    modifiers={modifiers} 
                    callback={setModifiers} 
                    tech={props.techs[tech.level]}
                />
            </div>
        </div>
    );
}