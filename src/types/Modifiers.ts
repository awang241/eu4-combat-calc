const DEFAULT_MORALE = 2.5 

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
    CAVALRY_DAMAGE = "cavalryCombatAbility",
    BONUS_TACTICS = "bonusTactics"
}

export function inModifierNames(name: string) {
    return Object.values(ModifierNames).includes(name as ModifierNames);
}

export type Modifiers = {
    [modifier in ModifierNames]: number
}

export function createDefaultModifiers(): Modifiers {
    return {
        morale: DEFAULT_MORALE,
        discipline: 0,
        fireDamage: 0,
        fireDamageReceived: 0,
        infantryCombatAbility: 0,
        cavalryCombatAbility: 0,
        shockDamage: 0,
        shockDamageReceived: 0,
        moraleDamage: 0,
        moraleDamageReceived: 0,
        bonusTactics: 0
    }
}

export function toMultiplier(percentValue: number): number {
    return 1 + (percentValue / 100);
}