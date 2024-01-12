import { useMemo } from "react";
import Unit from "../../types/Unit";
import ArmyModifiersPanel from "./ArmyModifiersPanel";
import RegimentsPanel from "./RegimentsPanel";
import TechPanel from "./TechPanel";

import "./ArmySetup.css";
import { ArmyState, ArmyStateDispatch } from "../../state/ArmyState";
import GLOBAL_SETUP_STATE from "../../state/GlobalSetupState";
import LeaderDicePanel from "./LeaderDicePanel";
const {techs, units} = GLOBAL_SETUP_STATE;

export default function ArmySetupPanel(props: {
        areHeadersVisible?: false,
        headerHeight?: number,
        state: ArmyState,
        dispatch: ArmyStateDispatch,
}) {
    const availableUnits = useMemo(() => {
        const source: readonly Unit[] = units.get(props.state.tech.group) ?? [];
        return source.filter(unit => (unit.techLevel <= props.state.tech.level)).sort((a, b) => b.techLevel - a.techLevel);
    }, [props.state.tech]);

    const currentTech = techs[props.state.tech.level];
        
    return (
        <div className="army-setup">
            <LeaderDicePanel 
                state={props.state} 
                dispatch={props.dispatch}
            />
                <div id="regiment-modifiers" className='collapsing-panel'>
                    <h3 className='full-width'>Regiments and Regiment Modifiers</h3>
                    <RegimentsPanel 
                        className='half-width'
                        state={props.state} 
                        units={availableUnits} 
                        dispatch={props.dispatch}
                    />
                </div>
                <div className='collapsing-panel'>
                    <h3 className='full-width'>Military Technology</h3>
                    <TechPanel 
                        className='half-width'
                        tech={currentTech} 
                        group={props.state.tech.group} 
                        updater={props.dispatch}
                    />
                </div>
                <div id="army-modifiers" className='collapsing-panel'>
                    <h3 className='full-width'>Army Modifiers</h3>
                    <ArmyModifiersPanel 
                        className='half-width'
                        modifiers={props.state.modifiers} 
                        dispatch={props.dispatch} 
                        tech={techs[currentTech.level]}
                    />
                </div>
                    </div>
    );
}