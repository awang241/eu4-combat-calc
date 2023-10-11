import { RegimentTypes } from "../model/Regiment"
import Pips, { blankPips } from "./Pips"
import TechGroup from "./TechGroup"

type Unit = {
    name: string,
    type: RegimentTypes,
    techGroup: TechGroup,
    techLevel: number,
    pips: Pips
}

export function blankUnit(type: RegimentTypes): Unit {
    return {
        name: "",
        type: type,
        techGroup: TechGroup.NONE,
        techLevel: 0,
        pips: blankPips()
    }
}

export default Unit