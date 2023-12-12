import { ChangeEvent } from "react";
import "./LeaderDicePanel.css";
import { Leader } from "../../types/Leader";
import { useArmySetupContext } from "./ArmySetupContext";

export default function LeaderDicePanel() {
    const {state, dispatch} = useArmySetupContext();
    const inputChangeHandler = (e: ChangeEvent<HTMLInputElement>, key: keyof Leader): void => {
        const intValue = parseInt(e.target.value);
        if (!isNaN(intValue) && intValue >= 0 && intValue <= 6) {
            dispatch({type: "leader", payload: {[key]: intValue}});
        }
    }
    return (
        <div className="leader-dice-panel">
            <div className="leader-subpanel">
                <h5>Leader</h5>
                <span>Fire</span>
                <input 
                    type="number"
                    min={0}
                    max={6}
                    value={state.leader.fire}
                    onChange={e => inputChangeHandler(e, "fire")}
                />

                <span>Shock</span>
                <input 
                    type="number"
                    min={0}
                    max={6}
                    value={state.leader.shock}
                    onChange={e => inputChangeHandler(e, "shock")}
                />
                
                <span>Maneuver</span>
                <input 
                    type="number"
                    min={0}
                    max={6}
                    value={state.leader.maneuver}
                    onChange={e => inputChangeHandler(e, "maneuver")}
                />
            </div>
        </div>
    )
}