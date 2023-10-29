
export enum RegimentTypes {
    INFANTRY = "Infantry",
    CAVALRY = "Cavalry",
    ARTILLERY = "Artillery"
}

export function inRegimentTypes(name: string) {
    return Object.values(RegimentTypes).includes(name as RegimentTypes);
}
