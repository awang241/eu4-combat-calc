import { RegimentTypes } from "../enum/RegimentTypes";
import Pips, { blankPips } from "./Pips"
import TechGroups, { TechGroup } from "../enum/TechGroups";

const blankProps = {name: "", techGroup: TechGroups.WESTERN, techLevel: 0, pips: blankPips()};

type Unit = {
    name: string,
    type: RegimentTypes,
    techGroup: TechGroup,
    techLevel: number,
    pips: Pips
}

/**
 * Returns a comparison function for sorting arryas of Units. Sorts by the unit's
 * tech level (descending by default), then by unit name alphabetically.
 * @param ascending If true, the returned comparator sorts by tech level ascending,
 * otherwise, the comparator sorts by tech level descending. Ties will be sorted 
 * ascending alphabetically by name regardless 
 * 
 */
export function unitCompare(techAscending? : boolean) {
    const reverseMultiplier = (techAscending ?? false) ? 1 : -1;
    return (a: Unit, b: Unit) => {
        if (a.techLevel !== b.techLevel) 
            return (a.techLevel - b.techLevel) *  reverseMultiplier;
        else {
            return a.name.localeCompare(b.name);
        }
    }
}

export function unitsOfType(source: Unit[], type: RegimentTypes) {
    return source.filter((unit) => unit.type === type);
}

export function blankUnit(type: RegimentTypes = RegimentTypes.INFANTRY): Unit {
    return {...blankProps, type: type}
}

export default Unit