import techs from "../assets/techs.json"
import units from "../assets/units.json"

import Unit from "../types/Unit"
import { RegimentTypes, inRegimentTypes } from "../enum/RegimentTypes"
import TechGroups, { TechGroup } from "../enum/TechGroups"
import { Tech } from "../types/Tech"

const TECH_GROUP_NAMES = {
        "western": TechGroups.WESTERN,
        "eastern": TechGroups.EASTERN,
        "ottoman": TechGroups.ANATOLIAN,
        "muslim": TechGroups.MUSLIM,
        "nomad_group": TechGroups.NOMADIC,
        "sub_saharan": TechGroups.AFRICAN,
        "chinese": TechGroups.CHINESE,
        "indian": TechGroups.INDIAN,
        "mesoamerican": TechGroups.MESOAMERICAN,
        "north_american": TechGroups.NORTH_AMERICAN,
        "south_american": TechGroups.SOUTH_AMERICAN,
        "high_american": TechGroups.HIGH_AMERICAN,
        "aboriginal_tech": TechGroups.ABORIGINAL,
        "polynesian_tech": TechGroups.POLYNESIAN,
} as const

function parseTechGroup(value: string): TechGroup | undefined {
    return value in TECH_GROUP_NAMES ? TECH_GROUP_NAMES[value as keyof typeof TECH_GROUP_NAMES]: undefined;
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
        const group: TechGroup | undefined = parseTechGroup(val.unitType ?? "");
        const type: RegimentTypes | undefined = parseRegType(val.type);
        if (type !== undefined && val.techLevel !== undefined && group !== undefined) {
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