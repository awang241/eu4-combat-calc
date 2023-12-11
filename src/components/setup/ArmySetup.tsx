import { useMemo } from "react";
import Unit from "../../types/Unit";
import ArmyModifiersPanel from "./ArmyModifiersPanel";
import RegimentsPanel from "./RegimentsPanel";
import TechPanel from "./TechPanel";

import "./ArmySetup.css";
import { Action, ArmyState } from "../../state/ArmyState";
import GLOBAL_SETUP_STATE from "../../state/GlobalSetupState";
import LeaderDicePanel from "./LeaderDicePanel";
const {techs, units} = GLOBAL_SETUP_STATE;

export default function ArmySetupPanel(props: {
        areHeadersVisible?: false,
        headerHeight?: number,
        state: ArmyState,
        dispatch: React.Dispatch<Action>,
}) {
    const availableUnits = useMemo(() => {
        const source: readonly Unit[] = units.get(props.state.techGroup) ?? [];
        return source.filter(unit => (unit.techLevel <= props.state.techLevel)).sort((a, b) => b.techLevel - a.techLevel);
    }, [props.state.techLevel, props.state.techGroup]);

    const currentTech = techs[props.state.techLevel];
    
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
                    group={props.state.techGroup} 
                    updater={props.dispatch}
                />
            </div>
            <div id="army-modifiers" className='collapsing-panel'>
                <h3 className='full-width'>Army Modifiers</h3>
                <ArmyModifiersPanel 
                    className='half-width'
                    modifiers={props.state} 
                    callback={props.dispatch} 
                    tech={techs[currentTech.level]}
                />
            </div>
        </div>
    );
}