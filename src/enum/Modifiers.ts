const Modifiers = {
    DISCIPLINE: "discipline",
    MORALE: "morale",
    FIRE_DAMAGE: "fireDamage",
    SHOCK_DAMAGE: "shockDamage",
    MORALE_DAMAGE: "moraleDamage",
    FIRE_DAMAGE_RECEIVED: "fireDamageReceived",
    SHOCK_DAMAGE_RECEIVED: "shockDamageReceived",
    MORALE_DAMAGE_RECEIVED: "moraleDamageReceived",
    INFANTRY_DAMAGE: "infantryCombatAbility",
    CAVALRY_DAMAGE: "cavalryCombatAbility",
    ARTILLERY_DAMAGE: "artilleryCombatAbility",
    TACTICS: "tactics",
} as const

export type Modifier = typeof Modifiers[keyof typeof Modifiers];
export default Modifiers as Record<keyof typeof Modifiers, Modifier>

export function isModifier(name: string) {
    return Object.values(Modifiers).some(modifier => modifier === name);
}