import { TechState } from "../types/Tech"
import TechGroup, { getTechGroupName, isTechGroup } from "../types/TechGroup"

export default function TechPanel(props: {  
        level: number,
        group: TechGroup,
        updater: (fn: ((state: TechState) => TechState)) => unknown;
}) {
    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newLevel: number = parseInt(event.target.value);
        if (!isNaN(newLevel) && newLevel >= 1 && newLevel <= 32) {
            props.updater((state) => {
                return {...state, level: newLevel};
            })
        }
    }

    const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        if (isTechGroup(event.target.value)) {
            props.updater((state) => {
                return {...state, group: event.target.value as TechGroup};
            })
        }
    }
    
    return (
    <div className="tech-panel">
        <input 
            type="number"
            min={1}
            max={32}
            step={1}
            value={props.level}
            onChange={handleInput}
        />
        <select onChange={handleSelect} value={props.group}>
            {Object.values(TechGroup)
                .filter(group => group !== TechGroup.NONE)
                .map(group => {
                    return (
                        <option key={group} value={group}>
                            {getTechGroupName(group)}
                        </option>
                    )
                })
            }
        </select>
    </div>)
}