import techs from "../assets/techs.json"
import units from "../assets/units.json"

import Unit from "../types/Unit"
import { RegimentTypes, inRegimentTypes } from "../model/Regiment"
import { TechGroup } from "../types/TechGroup"

function parseUnitType(unitType: string): TechGroup {
    if (unitType === "western") {
        return TechGroup.WESTERN;

    } else if (unitType === "eastern") {
        return TechGroup.EASTERN;

    } else if (unitType === "ottoman") {
        return TechGroup.ANATOLIAN;

    } else if (unitType === "muslim") {
        return TechGroup.MUSLIM;

    } else if (unitType === "sub_saharan") {
        return TechGroup.AFRICAN;

    } else if (unitType === "chinese") {
        return TechGroup.CHINESE;

    } else if (unitType === "indian") {
        return TechGroup.INDIAN;

    } else if (unitType === "mesoamerican") {
        return TechGroup.MESOAMERICAN;

    } else if (unitType === "north_american") {
        return TechGroup.NORTH_AMERICAN;

    } else if (unitType === "south_american") {
        return TechGroup.SOUTH_AMERICAN;

    } else if (unitType === "high_american") {
        return TechGroup.HIGH_AMERICAN;

    } else if (unitType === "aboriginal_tech") {
        return TechGroup.ABORIGINAL;

    } else if (unitType === "polynesian_tech") {
        return TechGroup.POLYNESIAN;

    } else {
        return TechGroup.NONE
    }
} 

export function parseUnits(): Map<TechGroup, Unit[]> {
    const unitsByTechGroup: Map<TechGroup, Unit[]> = new Map();
    units.forEach(val => {
        const group: TechGroup = parseUnitType(val.unitType ?? "");
        if (inRegimentTypes(val.type)) {
            const unit: Unit = {
                name: val.name,
                type: val.type as RegimentTypes,
                techGroup: group,
                techLevel: val.techLevel ?? 1,
                pips: {
                    fireOffence: val.offensiveFire ?? 0,
                    fireDefence: val.defensiveFire ?? 0,
                    shockOffence: val.offensiveShock ?? 0,
                    shockDefence: val.defensiveShock ?? 0,
                    moraleOffence: val.offensiveMorale ?? 0,
                    moraleDefence: val.defensiveMorale ?? 0,
                }
            }
            if (unitsByTechGroup.has(group)) {
                unitsByTechGroup.get(group)?.push(unit);
            } else {
                unitsByTechGroup.set(group, [unit]);
            }
        }
    })
    unitsByTechGroup.forEach(val => val.sort((a, b) => a.techLevel - b.techLevel))
    return unitsByTechGroup;
}