import Regiment, { RegimentTypes } from "../model/Regiment";
import "./BattleGrid.css";
import infIcon from "../assets/Infantry.png"
import cavIcon from "../assets/Cavalry.png"
import ArmySnapshot from "../model/ArmySnapshot";
import { useState } from "react";

const MIN_OPACITY: number = 5;

function createRegimentCells(front: (Regiment | undefined)[]): Array<JSX.Element> {
    return front.map((val, index) => {
        if (val === undefined) {
            return <td className="cell"/>
        }

        let icon: string = "";
        if (val.type === RegimentTypes.INFANTRY) {
            icon = infIcon;
        } else if (val.type === RegimentTypes.CAVALRY) {
            icon = cavIcon;
        }
        const iconOpacity: string = `${MIN_OPACITY + (100 - MIN_OPACITY) * (val.strength / Regiment.MAX_STRENGTH)}%`;
        const barHeight: string = `${100 * (val.currentMorale / val.maxMorale)}%`;
        return (
            <td className="cell" key={index}>
                <div className="cell-grid">
                    <img src={icon} alt="" style= {{opacity: iconOpacity}}/>
                    <div className="morale" style={{height: barHeight}}/>
                    <div className="tooltip">
                        <ul>
                            <li><strong>{`${val.type} Regiment`}</strong></li>
                            <li>{`Morale: ${val.currentMorale.toFixed(2)}/${val.maxMorale.toFixed(2)}`}</li>
                            <li>{`Strength: ${val.strength}/${Regiment.MAX_STRENGTH}`}</li>
                        </ul>
                        
                    </div>
                </div>
            </td>
        )
    });
}

export default function BattleGrid(props: {results:[ArmySnapshot, ArmySnapshot][]}) {
    const maxDay: number = Math.max(props.results.length - 1, 0);
    const [day, setDay] = useState(maxDay); 
    
    const attackerResults: ArmySnapshot[] = props.results.map(val => val[0]);
    const defenderResults: ArmySnapshot[] = props.results.map(val => val[1]);
    let attackerLastResult = attackerResults[day];
    let defenderLastResult = defenderResults[day];
    const attackerFront = attackerLastResult === undefined ? new Array(20).fill(undefined): attackerLastResult.front;
    const defenderFront = defenderLastResult === undefined ? new Array(20).fill(undefined): defenderLastResult.front;

    return (
        <div className="battle-grid">
            <div className="selector-panel">
                <button disabled={day === 0} onClick={() => setDay(day - 1)}>&#60;</button>
                <input 
                    type="range" 
                    min={0}
                    max={maxDay} 
                    step={1} 
                    value={day}
                    disabled={props.results.length === 0}
                    onChange={(event)=> setDay(parseInt(event.target.value))}>
                </input>
                <button 
                    disabled={day === maxDay}
                    onClick={() => setDay(day + 1)}>
                    &#62;
                </button>
                <p> Day {day}</p>
            </div>
            <table>
                <tbody>
                    <tr>
                        {createRegimentCells(attackerFront)}
                    </tr>
                    <tr className="grid-gap"/>
                    <tr>
                        {createRegimentCells(defenderFront)}
                    </tr>
                </tbody>
            </table>
        </div>
    )
}