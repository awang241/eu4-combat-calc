import Regiment, { RegimentTypes } from "../model/Regiment";
import "./BattleGrid.css";
import infIcon from "../assets/Infantry.png"
import cavIcon from "../assets/Cavalry.png"
import ArmySnapshot from "../types/ArmySnapshot";
import { useEffect, useState } from "react";

type RegimentData = {
    index: number | undefined,
    targetIndex: number | undefined,
    flankingRange: number,
    isAttacker: boolean
}

const MIN_OPACITY: number = 5;
const initData: RegimentData = {index: undefined, targetIndex: undefined, flankingRange: 0, isAttacker: false};

function RegimentCell(props: {
        regiment: Regiment | undefined, 
        index: number, 
        isAttacker: boolean,
        cellStyle: React.CSSProperties, 
        hoverCb: (state: any) => unknown}) {
    let barHeight: string = "";
    let iconOpacity: string = "";
    let icon: string = "";
    let data: RegimentData | undefined;
    if (props.regiment !== undefined) {
        if (props.regiment.type === RegimentTypes.INFANTRY) {
            icon = infIcon;
        } else if (props.regiment.type === RegimentTypes.CAVALRY) {
            icon = cavIcon;
        }
        iconOpacity = `${MIN_OPACITY + (100 - MIN_OPACITY) * (props.regiment.strength / Regiment.MAX_STRENGTH)}%`;
        let moralePercent: number = 100 * (props.regiment.currentMorale / props.regiment.maxMorale);
        if (moralePercent > 2) {
            barHeight =  `${moralePercent}%`;
        } else if (moralePercent > 0) {
            barHeight = "2%"
        } else {
            barHeight = "0"
        }
        data = {
            index: props.index,
            targetIndex: props.regiment.targetIndex,
            isAttacker: props.isAttacker,
            flankingRange: props.regiment.flankingRange()
        }
    }
    return (
        <td className="cell" 
            style={props.cellStyle} 
            onMouseEnter={data ? () => props.hoverCb(data): undefined} 
            onMouseLeave={data ? () => props.hoverCb(initData): undefined}
        >
            {props.regiment !== undefined ? (
                <div className="cell-grid" >
                    <img src={icon} alt="" style= {{opacity: iconOpacity}}/>
                    <div className="morale" style={{height: barHeight}}/>
                    <div className="tooltip">
                        <ul>
                            <li><strong>{`${props.regiment.type} Regiment`}</strong></li>
                            <li>{`${props.regiment.unit.name}`}</li>
                            <li>{`ID: ${props.regiment.id}`}</li>
                            <li>{`Morale: ${props.regiment.currentMorale.toFixed(2)}/${props.regiment.maxMorale.toFixed(2)}`}</li>
                            <li>{`Strength: ${props.regiment.strength}/${Regiment.MAX_STRENGTH}`}</li>
                        </ul>
                    </div>
                </div>
            ) : <></> }
        </td>
    )
}

export default function BattleGrid(props: {results:[ArmySnapshot, ArmySnapshot][]}) {
    const maxDay: number = Math.max(props.results.length - 1, 0);
    const [day, setDay] = useState(maxDay); 
    const [focusedData, setFocusedData] = useState(initData);

    useEffect(() => {
        runThroughDays()
    }, [props.results]);

    const runThroughDays = () => {
        const nextDay = (max: number, current: number) => {
            if (current <= max) {
                setDay(current);
                setTimeout(() => {nextDay(max, current + 1)}, 300);
            }
        }
        nextDay(maxDay, 0);
    }

    const getCellStyle = (index: number, isAttacker: boolean): React.CSSProperties => {
        let style: React.CSSProperties;
        if (focusedData.index === undefined || isAttacker === focusedData.isAttacker || Math.abs(index - focusedData.index) > focusedData.flankingRange) {
            style = {}
        } else if (index === focusedData.targetIndex) {
            style = {
                outline: "none",
                borderColor: "red",
                borderStyle: "double",
                boxShadow: "0 0 10px red"
            }
        } else {
            style = {
                outline: "none",
                borderColor: "#80aacc",
                borderRightStyle: "solid",
                boxShadow: "0 0 10px #80aacc",
            }
        }
        return style;
    }

    const getFront = (attacker: boolean) => {
        const results: ArmySnapshot[] = props.results.map(val => val[attacker ? 0 : 1]);
        return results.at(day)?.front ?? new Array(20).fill(undefined)
    }

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
                    onChange={(event)=> setDay(parseInt(event.target.value))}
                />
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
                        {getFront(true).map((regiment, index) => (
                            <RegimentCell 
                                key={index} 
                                index={index}
                                regiment={regiment}
                                isAttacker={true}
                                cellStyle={getCellStyle(index, true)}
                                hoverCb={setFocusedData}
                            />
                            )
                        )}
                    </tr>
                    <tr className="grid-gap"/>
                    <tr>
                        {getFront(false).map((regiment, index) => (
                            <RegimentCell 
                                key={index} 
                                index={index}
                                regiment={regiment}
                                isAttacker={false}
                                cellStyle={getCellStyle(index, false)}
                                hoverCb={setFocusedData}
                            />
                            )
                        )}
                    </tr>
                </tbody>
            </table>
        </div>
    )
}