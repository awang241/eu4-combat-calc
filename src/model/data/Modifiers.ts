export enum ModifierNames{
    DISCIPLINE = "discipline",
    MORALE = "morale",
    FIRE_DAMAGE = "fireDamage",
    SHOCK_DAMAGE = "shockDamage",
    MORALE_DAMAGE = "moraleDamage",
    FIRE_DAMAGE_RECEIVED = "fireDamageReceived",
    SHOCK_DAMAGE_RECEIVED = "shockDamageReceived",
    MORALE_DAMAGE_RECEIVED = "moraleDamageReceived",
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

    constructor(morale?: number,
            discipline?: number,
            fireDamage?: number,
            fireDamageReceived?: number,
            shockDamage?: number,
            shockDamageReceived?: number,
            moraleDamage?: number,
            moraleDamageReceived?: number) {
        this._morale = morale ?? 2.5;
        this._discipline = discipline ?? 0;
        this._fireDamage = fireDamage ?? 0;
        this._fireDamageReceived = fireDamageReceived ?? 0;
        this._shockDamage = shockDamage ?? 0;
        this._shockDamageReceived = shockDamageReceived ?? 0;
        this._moraleDamage = moraleDamage ?? 0;
        this._moraleDamageReceived = moraleDamageReceived ?? 0;
    }

    public static createModifiersFromMap(modifierMap: Map<ModifierNames, number>): Modifiers {
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


    private static format(modifier: number, asDecimal?: boolean) {
        return (asDecimal ?? true) ? 1 + modifier / 100: modifier;
    }

    public get morale(): number {return this._morale}
    public discipline(asDecimal?: boolean): number {
        return Modifiers.format(this._discipline, asDecimal)
    }
    public fireDamage(asDecimal?: boolean): number {
        return Modifiers.format(this._fireDamage, asDecimal)
    }
    public fireDamageReceived(asDecimal?: boolean): number {
        return Modifiers.format(this._fireDamageReceived, asDecimal)
    }
    public shockDamage(asDecimal?: boolean): number {
        return Modifiers.format(this._shockDamage, asDecimal)
    }
    public shockDamageReceived(asDecimal?: boolean): number {
        return Modifiers.format(this._shockDamageReceived, asDecimal)
    }
    public moraleDamage(asDecimal?: boolean): number {
        return Modifiers.format(this._moraleDamage, asDecimal)
    }
    public moraleDamageReceived(asDecimal?: boolean): number {
        return Modifiers.format(this._moraleDamageReceived, asDecimal)
    }
}