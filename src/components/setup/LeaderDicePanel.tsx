import { ChangeEvent } from "react";
import { Action, ArmyState } from "../../state/ArmyState";
import "./LeaderDicePanel.css";
import { Leader } from "../../types/Leader";

export default function LeaderDicePanel(props: {
    state: ArmyState,
    dispatch: React.Dispatch<Action>,
}) {
    const inputChangeHandler = (e: ChangeEvent<HTMLInputElement>, key: keyof Leader): void => {
        const intValue = parseInt(e.target.value);
        if (!isNaN(intValue) && intValue >= 0 && intValue <= 6) {
            props.dispatch({actionType: "setLeader", value: [key, intValue]});
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
                    value={props.state.leader.fire}
                    onChange={e => inputChangeHandler(e, "fire")}
                />

                <span>Shock</span>
                <input 
                    type="number"
                    min={0}
                    max={6}
                    value={props.state.leader.shock}
                    onChange={e => inputChangeHandler(e, "shock")}
                />
                
                <span>Maneuver</span>
                <input 
                    type="number"
                    min={0}
                    max={6}
                    value={props.state.leader.maneuver}
                    onChange={e => inputChangeHandler(e, "maneuver")}

                />
            </div>
        </div>
    )
}