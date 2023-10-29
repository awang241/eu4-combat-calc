import { RegimentTypes } from "../enum/RegimentTypes";
import { blankPips } from "../types/Pips";
import TechGroup from "../types/TechGroup";
import Unit from "../types/Unit";

export const DUMMY_INFANTRY: Unit = {
    name: "", 
    type: RegimentTypes.INFANTRY,
    techGroup: TechGroup.NONE,
    techLevel: 0,
    pips: blankPips()
} as const;