import { ArmyModifiers } from "../../App";

export enum ModifierNames{
    DISCIPLINE = "discipline",
    MORALE = "morale",
    FIRE_DAMAGE = "fireDamage",
    SHOCK_DAMAGE = "shockDamage",
    MORALE_DAMAGE = "moraleDamage",
    FIRE_DAMAGE_RECEIVED = "fireDamageReceived",
    SHOCK_DAMAGE_RECEIVED = "shockDamageReceived",
    MORALE_DAMAGE_RECEIVED = "moraleDamageReceived",
    INFANTRY_DAMAGE = "infantryCombatAbility",
    CAVALRY_DAMAGE = "cavalryCombatAbility"
}

export function inModifierNames(name: string) {
    return Object.values(ModifierNames).includes(name as ModifierNames);
}

export default class Modifiers {
    private _morale: number = 2.5;
    private _discipline: number = 0;
    private _fireDamage: number = 0;
    private _fireDamageReceived: number = 0;
    private _shockDamage: number = 0;
    private _shockDamageReceived: number = 0;
    private _moraleDamage: number = 0;
    private _moraleDamageReceived: number = 0;
    infantryDamage: number = 0;
    cavalryDamage: number = 0;

    constructor(morale?: number,
            discipline?: number,
            fireDamage?: number,
            fireDamageReceived?: number,
            shockDamage?: number,
            shockDamageReceived?: number,
            moraleDamage?: number,
            moraleDamageReceived?: number,
            infantryDamage? : number,
            cavalryDamage?: number) {
        this._morale = morale ?? 2.5;
        this._discipline = discipline ?? 0;
        this._fireDamage = fireDamage ?? 0;
        this._fireDamageReceived = fireDamageReceived ?? 0;
        this._shockDamage = shockDamage ?? 0;
        this._shockDamageReceived = shockDamageReceived ?? 0;
        this._moraleDamage = moraleDamage ?? 0;
        this._moraleDamageReceived = moraleDamageReceived ?? 0;
        this.infantryDamage = infantryDamage ?? 0;
        this.cavalryDamage = cavalryDamage ?? 0
    }

    public static createModifiersFromMap(modifierMap: Map<String, number>): Modifiers {
        return new Modifiers(
            modifierMap.get(ModifierNames.MORALE),
            modifierMap.get(ModifierNames.DISCIPLINE),
            modifierMap.get(ModifierNames.FIRE_DAMAGE),
            modifierMap.get(ModifierNames.FIRE_DAMAGE_RECEIVED),
            modifierMap.get(ModifierNames.SHOCK_DAMAGE),
            modifierMap.get(ModifierNames.SHOCK_DAMAGE_RECEIVED),
            modifierMap.get(ModifierNames.MORALE_DAMAGE),
            modifierMap.get(ModifierNames.MORALE_DAMAGE_RECEIVED)
        );
    }

    public static createModifiersFromObject(modifiers: ArmyModifiers): Modifiers {
        return new Modifiers(
            modifiers[ModifierNames.MORALE],
            modifiers[ModifierNames.DISCIPLINE],
            modifiers[ModifierNames.FIRE_DAMAGE],
            modifiers[ModifierNames.FIRE_DAMAGE_RECEIVED],
            modifiers[ModifierNames.SHOCK_DAMAGE],
            modifiers[ModifierNames.SHOCK_DAMAGE_RECEIVED],
            modifiers[ModifierNames.MORALE_DAMAGE],
            modifiers[ModifierNames.MORALE_DAMAGE_RECEIVED],
            modifiers[ModifierNames.INFANTRY_DAMAGE],
            modifiers[ModifierNames.CAVALRY_DAMAGE]
        );
    }


    private static format(modifier: number, asDecimal?: boolean) {
        return (asDecimal ?? true) ? 1 + modifier / 100: modifier;
    }

    public get morale(): number {return this._morale}
    public set morale(val: number) {this._morale = val}

    public getDiscipline(asDecimal?: boolean): number {
        return Modifiers.format(this._discipline, asDecimal)
    }
    public setDiscipline(value: number): void {
        this._discipline = value;
    }
    public getFireDamage(asDecimal?: boolean): number {
        return Modifiers.format(this._fireDamage, asDecimal)
    }
    public setFireDamage(value: number): void {
        this._fireDamage = value;
    }
    public getFireDamageReceived(asDecimal?: boolean): number {
        return Modifiers.format(this._fireDamageReceived, asDecimal)
    }
    public setFireDamageReceived(value: number): void {
        this._fireDamageReceived = value;
    }
    public getShockDamage(asDecimal?: boolean): number {
        return Modifiers.format(this._shockDamage, asDecimal)
    }
    public setShockDamage(value: number): void {
        this._shockDamage = value;
    }
    public getShockDamageReceived(asDecimal?: boolean): number {
        return Modifiers.format(this._shockDamageReceived, asDecimal)
    }
    public setShockDamageReceived(value: number): void {
        this._shockDamageReceived = value;
    }
    public getMoraleDamage(asDecimal?: boolean): number {
        return Modifiers.format(this._moraleDamage, asDecimal)
    }
    public setMoraleDamage(value: number): void {
        this._moraleDamage = value;
    }
    public getMoraleDamageReceived(asDecimal?: boolean): number {
        return Modifiers.format(this._moraleDamageReceived, asDecimal)
    }
    public setMoraleDamageReceived(value: number): void {
        this._moraleDamageReceived = value;
    }
    
}