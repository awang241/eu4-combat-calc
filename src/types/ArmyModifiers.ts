import { Modifier } from "../enum/Modifiers";

const DEFAULT_MORALE = 2.5 

export type ArmyModifiers = {
    [modifier in Modifier]: number
}


export function createDefaultModifiers(): ArmyModifiers {
    return {
        morale: DEFAULT_MORALE,
        discipline: 0,
        fireDamage: 0,
        fireDamageReceived: 0,
        infantryCombatAbility: 0,
        cavalryCombatAbility: 0,
        artilleryCombatAbility: 0,
        shockDamage: 0,
        shockDamageReceived: 0,
        moraleDamage: 0,
        moraleDamageReceived: 0,
        tactics: 0
    }
}

export function toMultiplier(percentValue: number): number {
    return 1 + (percentValue / 100);
}