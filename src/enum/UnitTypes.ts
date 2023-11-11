const UnitTypes = {
    INFANTRY: "infantry",
    CAVALRY: "cavalry",
    ARTILLERY: "artillery",
} as const;

export type UnitType = typeof UnitTypes[keyof typeof UnitTypes];
export default UnitTypes as Record<keyof typeof UnitTypes, UnitType>;

export function isUnitType(name: string): name is UnitType {
    return Object.values(UnitTypes).some(val => val === name);
}