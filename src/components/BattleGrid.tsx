import Regiment from "../model/Regiment";
import UnitTypes from "../enum/UnitTypes";
import "./BattleGrid.css";
import infIcon from "../assets/infantry.png";
import cavIcon from "../assets/cavalry.png";
import artIcon from "../assets/artillery.png";
import ArmySnapshot from "../types/ArmySnapshot";
import { MouseEventHandler, useEffect, useLayoutEffect, useRef, useState } from "react";
import Terrains, { Terrain } from "../enum/Terrain";
import { RollModifiers } from "../types/RollModifiers";

type RegimentData = {
    index: number,
    isAttacker: boolean,
    regiment: Regiment,
}



const MIN_OPACITY: number = 5;
const icons = {
    [UnitTypes.INFANTRY]: infIcon,
    [UnitTypes.CAVALRY]: cavIcon,
    [UnitTypes.ARTILLERY]: artIcon,
} as const;
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
        icon = icons[props.regiment.type];
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
            isAttacker: props.isAttacker,
            regiment: props.regiment,
        }
    }
    return (
        <td className="cell" 
            style={props.cellStyle} 
            onMouseEnter={data ? () => props.hoverCb(data): undefined} 
            onMouseLeave={data ? () => props.hoverCb(undefined): undefined}
        >
            {props.regiment !== undefined && 
                <div className="cell-grid" >
                    <img src={icon} alt="" style= {{opacity: iconOpacity}}/>
                    <div className="morale" style={{height: barHeight}}/>
                </div>
            }
        </td>
    )
}

function ArmyInfoPanel(props: {
    armyData: ArmySnapshot,
    isFirePhase: boolean
    rollsAtTop?: boolean,
    rollModifiers?: RollModifiers,
}) {
    const rollModifierDisplay = (
        <div className="roll-modifier-display">
            <div className="roll-modifier-card">
                    <span>Dice: {props.armyData.roll}</span>
            </div>
            {props.rollModifiers?.leaderFireBonus !== 0 && props.isFirePhase &&
                <div className="roll-modifier-card">
                    <span>Leader: {props.rollModifiers?.leaderFireBonus}</span>
                </div>
            }
            {props.rollModifiers?.leaderShockBonus !== 0&& !props.isFirePhase &&
                <div className="roll-modifier-card">
                    <span>Leader: {props.rollModifiers?.leaderShockBonus}</span>
                </div>
            }
            {props.rollModifiers?.terrainModifier !== 0 &&
                <div className="roll-modifier-card">
                    <span>Terrain: {props.rollModifiers?.terrainModifier}</span>
                </div>
            }
            {props.rollModifiers?.crossingPenalty !== 0 &&
                <div className="roll-modifier-card">
                    <span>Crossing: {props.rollModifiers?.crossingPenalty}</span>
                </div>
            }
        </div>
    )
    
    return (
        <div className="army-info-panel">
            {(props.rollsAtTop ?? false) ? rollModifierDisplay : <></>}
            <div className="info-column">
                <span>Infantry:</span>
                <span>{props.armyData.currentStrengthOfType("infantry")}</span>
                
                <span>Cavalry</span>
                <span>{props.armyData.currentStrengthOfType("cavalry")}</span>

                <span>Artillery</span>
                <span>{props.armyData.currentStrengthOfType("artillery")}</span>
            </div>
            <div className="info-column">
                <span>Morale:</span>
                <span>{props.armyData.currentMorale.toFixed(2)}</span>
                
                <span>Tech</span>
                <span>{props.armyData.techLevel}</span>

                <span>Tactics</span>
                <span>{props.armyData.tactics}</span>
            </div>
            {!(props.rollsAtTop ?? false) ? rollModifierDisplay : <></>}
        </div>
    )
}

export default function BattleGrid(props: {
        results:[ArmySnapshot, ArmySnapshot][],
        terrain?: Terrain,
        attackerRollModifiers?: RollModifiers,
        defenderRollModifiers?: RollModifiers
}) {
    const maxDay: number = Math.max(props.results.length - 1, 0);
    const [day, setDay] = useState(maxDay); 
    const [focusedData, setFocusedData] = useState<RegimentData | undefined>(undefined);
    const [animated, setAnimated] = useState(true);
    const animationId = useRef(setTimeout(() => {}));
    const animationLoops = useRef(0);
    const resultsAreLoaded = day >= 0 && day < props.results.length;

    useEffect(() => {
        runThroughDays()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.results]);

    const isFirePhase = () => {
        return (day - 1) % 6 < 3;
    }

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
        let style: React.CSSProperties = {};
        if (focusedData !== undefined && focusedData.isAttacker !== isAttacker) {
            if (index === focusedData.regiment.targetIndex) {
                style = {
                    outline: "none",
                    borderColor: "red",
                    borderStyle: "double",
                    boxShadow: "0 0 8px red",
                    transform: "translate3d(0, 0, 5)"
                }
            } else if (Math.abs(index - focusedData.index) <= focusedData.regiment.flankingRange()) {
                style = {
                    outline: "none",
                    borderColor: "#6090cc",
                    borderRightStyle: "solid",
                    borderTopStyle: "double",
                    boxShadow: "0 0 4px #80aacc",
                    transform: "translate3d(0, 0, 2)"
                }
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

    const [coords, setCoords] = useState({x: 0, y: 0})
    const [tooltipHeight, setTooltipHeight] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const mouseMoveHandler: MouseEventHandler<HTMLTableElement> = (event) => {
        setCoords({x: event.clientX, y: event.clientY});
    }

    const getFloatingTooltipStyle = (): React.CSSProperties => {
        return {
            top: coords.y - (focusedData?.isAttacker ? tooltipHeight : 0),
            display: focusedData?.index !== undefined ? "inline": "none",
            position: "fixed",
            left: coords.x,
        }
    }

    useLayoutEffect(() => {
        setTooltipHeight(ref.current?.clientHeight ?? 0);
    }, [])

    return (
        <div className="battle-grid">
            <div className="floating-tooltip" ref={ref} style={getFloatingTooltipStyle()}>
                <ul>
                    <li><strong>{`${focusedData?.regiment.type} Regiment`}</strong></li>
                    <li>{`${focusedData?.regiment.unit.name}`}</li>
                    <li>{`ID: ${focusedData?.regiment.id}`}</li>
                    <li>{`Morale: ${focusedData?.regiment.currentMorale.toFixed(2)}/${focusedData?.regiment.maxMorale.toFixed(2)}`}</li>
                    <li>{`Strength: ${focusedData?.regiment.strength}/${Regiment.MAX_STRENGTH}`}</li>
                </ul>
            </div>
            <div className="selector-panel">
                <p>Day {day}</p>
                <div>
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
                </div>
                
                <label htmlFor="animated-checkbox">Animate?</label>

                <input 
                    name="animated-checkbox"
                    type="checkbox" 
                    checked={animated} 
                    onChange={e => setAnimated(e.target.checked)}
                />
            </div>  
            { resultsAreLoaded && 
                <ArmyInfoPanel 
                    armyData={props.results[day][0] }
                    isFirePhase={isFirePhase()}
                    rollModifiers={props.attackerRollModifiers}
                />
            }
            <table onMouseMove={mouseMoveHandler}>
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
                    <tr className="grid-gap" >
                        <td colSpan={getFront(true).length} style={{
                                backgroundImage: `url(${(props.terrain ?? Terrains.GLACIAL).imageString}`,
                                backgroundRepeat: "no-repeat",
                                backgroundSize: "100% 100%",
                                opacity: 0.5
                            }}
                        />
                    </tr>
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
            { resultsAreLoaded && 
                <ArmyInfoPanel 
                    armyData={props.results[day][1]} 
                    isFirePhase={isFirePhase()}
                    rollsAtTop={true}
                    rollModifiers={props.defenderRollModifiers}
                />
            }
        </div>
    )
}