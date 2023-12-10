import { TechGroup } from "../enum/TechGroups";
import Unit from "../types/Unit";
import { parseTechs, parseUnits } from "../util/Loader"

const [groupUnits, artilleryUnits] = parseUnits();
for (const [group, units] of groupUnits) {
    groupUnits.set(group, [...units, ...artilleryUnits]);
}

const GLOBAL_SETUP_STATE = {
    techs: [...parseTechs()] as const,
    units: groupUnits as ReadonlyMap<TechGroup, readonly Unit[]>,
}

export default GLOBAL_SETUP_STATE;