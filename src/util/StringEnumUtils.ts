
export function createEnumRecord<T extends string>(defaultVal: string, enumObject: Record<any, T>): Record<T, string>;
export function createEnumRecord<T extends string>(defaultVal: boolean, enumObject: Record<any, T>): Record<T, boolean>;
export function createEnumRecord<T extends string>(defaultVal: number, enumObject: Record<any, T>): Record<T, number>;
export function createEnumRecord<T extends string>(defaultVal: (string | boolean | number), enumObject: Record<any, T>): Record<T, typeof defaultVal> {
    return Object.fromEntries(Object.values(enumObject).map(val => [val, defaultVal])) as Record<T, typeof defaultVal>;
}

export function enumIncludes<T extends string>(value: string, enumObject: Record<any, T>): value is T {
    return Object.values(enumObject).some(enumVal => enumVal === value);
}

