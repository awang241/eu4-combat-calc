import Regiment from "../model/Regiment";
import UnitTypes from "../enum/UnitTypes";
import "./BattleGrid.css";
import infIcon from "../assets/infantry.png";
import cavIcon from "../assets/cavalry.png";
import artIcon from "../assets/artillery.png";
import ArmySnapshot from "../types/ArmySnapshot";
import { useEffect, useRef, useState } from "react";

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
        cellStyle?: React.CSSProperties, 
        hoverCb: (state: any) => unknown}) {
    let barHeight: string = "";
    let iconOpacity: string = "";
    let icon: string = "";
    let data: RegimentData | undefined;
    if (props.regiment !== undefined) {
        if (props.regiment.type === UnitTypes.INFANTRY) {
            icon = infIcon;
        } else if (props.regiment.type === UnitTypes.CAVALRY) {
            icon = cavIcon;
        } else if (props.regiment.type === "artillery") {
            icon = artIcon;
        }
        iconOpacity = `${MIN_OPACITY + (100 - MIN_OPACITY) * (props.regiment.strength / Regiment.MAX_STRENGTH)}%`;
        let moralePercent: number = 100 * (props.regiment.currentMorale / props.regiment.maxMorale);
        if (moralePercent > 2) {
            barHeight =  `${moralePercent}%`;
        } else if (moralePercent > 0) {
            barHeight = "2%";
        } else {
            barHeight = "0";
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
    const [animated, setAnimated] = useState(true);
    const animationId = useRef(setTimeout(() => {}))
    const animationLoops = useRef(0)

    useEffect(() => {
        runThroughDays()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.results]);

    const runThroughDays = () => {
        setDay(0);
        const nextDay = (max: number) => {
            if (animationLoops.current < max) {
                setDay((day) => day + 1);
                animationLoops.current++;
            } else {
                clearInterval(animationId.current);
            }
        }
        if (animated) {
            clearInterval(animationId.current);
            animationLoops.current = 0;
            animationId.current = setInterval(() => nextDay(maxDay), 200);
        }
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
                boxShadow: "0 0 12px red"
            }
        } else {
            style = {
                outline: "none",
                borderColor: "#80aacc",
                borderRightStyle: "solid",
                boxShadow: "0 0 6px #80aacc",
            }
        }
        return style;
    }

    const getFront = (attacker: boolean) => getRow(attacker, true);
    const getBack = (attacker: boolean) => getRow(attacker, false);

    const getRow = (attacker: boolean, front: boolean) => {
        const results: ArmySnapshot[] = props.results.map(val => val[attacker ? 0 : 1]);
        const row = front ? results.at(day)?.front : results.at(day)?.back;
        return row ?? new Array(20).fill(undefined)
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
                <p>Day {day}</p>
                <label htmlFor="animated-checkbox">Animate?</label>

                <input 
                    name="animated-checkbox"
                    type="checkbox" 
                    checked={animated} 
                    onChange={e => setAnimated(e.target.checked)}
                />
            </div>  
            <table>
                <tbody>
                    <tr>
                        {getBack(true).map((regiment, index) => (
                            <RegimentCell 
                                key={index} 
                                index={index}
                                regiment={regiment}
                                isAttacker={true}
                                hoverCb={setFocusedData}
                            />
                            )
                        )}
                    </tr>
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
                    <tr>
                        {getBack(false).map((regiment, index) => (
                            <RegimentCell 
                                key={index} 
                                index={index}
                                regiment={regiment}
                                isAttacker={false}
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