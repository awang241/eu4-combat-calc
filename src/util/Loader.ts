import techs from "../assets/techs.json"
import units from "../assets/units.json"

import Unit from "../types/Unit"
import { RegimentTypes, inRegimentTypes } from "../enum/RegimentTypes"
import TechGroup from "../types/TechGroup"
import { Tech } from "../types/Tech"

function parseTechGroup(value: string): TechGroup {
    if (value === "western")
        return TechGroup.WESTERN;
    else if (value === "eastern")
        return TechGroup.EASTERN;
    else if (value === "ottoman")
        return TechGroup.ANATOLIAN;
    else if (value === "muslim")
        return TechGroup.MUSLIM;
    else if (value === "nomad_group")
        return TechGroup.NOMADIC
    else if (value === "sub_saharan")
        return TechGroup.AFRICAN;
    else if (value === "chinese")
        return TechGroup.CHINESE;
    else if (value === "indian") 
        return TechGroup.INDIAN;
    else if (value === "mesoamerican")
        return TechGroup.MESOAMERICAN;
    else if (value === "north_american")
        return TechGroup.NORTH_AMERICAN;
    else if (value === "south_american")
        return TechGroup.SOUTH_AMERICAN;
    else if (value === "high_american")
        return TechGroup.HIGH_AMERICAN;
    else if (value === "aboriginal_tech")
        return TechGroup.ABORIGINAL;
    else if (value === "polynesian_tech")
        return TechGroup.POLYNESIAN;
    else
        return TechGroup.NONE
} 

function parseRegType(value: string): RegimentTypes | undefined{
    if (value === "infantry") {
        return RegimentTypes.INFANTRY;
    } else if (value === "cavalry") {
        return RegimentTypes.CAVALRY;
    } else if (value === "artillery") {
        return RegimentTypes.ARTILLERY;
    } else {
        return undefined
    }
} 

function deepFreeze<T>(obj: T): Readonly<T> {
  var propNames = Object.getOwnPropertyNames(obj);
  for (let name of propNames) {
    let value = (obj as any)[name];
    if (value && typeof value === "object") {
      deepFreeze(value);
    }
  }
  return Object.freeze(obj);
}

export function parseUnits(): Map<TechGroup, Unit[]> {
    const unitsByTechGroup: Map<TechGroup, Unit[]> = new Map();
    units.forEach(val => {
        const group: TechGroup = parseTechGroup(val.unitType ?? "");
        const type: RegimentTypes | undefined = parseRegType(val.type);
        if (type !== undefined && val.techLevel !== undefined) {
            const unit: Unit = {
                name: val.name,
                type: type,
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
    unitsByTechGroup.forEach(val => val.sort((a, b) => b.techLevel - a.techLevel))
    return unitsByTechGroup;
}

export function parseTechs(): Tech[] {
    const output: Tech[] = [];
    techs.forEach((val, index) => {        
        const tech: Tech = {
            level: index,
            morale: val.landMorale,
            tactics: val.militaryTactics,
            width: val.combatWidth,
            flankingRange: val.maneuverValue,   
            damages: {
                [RegimentTypes.INFANTRY]: {
                    fire: val.infantryFire,
                    shock: val.infantryShock
                },
                [RegimentTypes.CAVALRY]: {
                    fire: val.cavalryFire,
                    shock: val.cavalryShock
                },
                [RegimentTypes.ARTILLERY]: {
                    fire: val.artilleryFire,
                    shock: val.artilleryShock
                }
            }
        };
        output.push(deepFreeze(tech))
    });
    return output;
}