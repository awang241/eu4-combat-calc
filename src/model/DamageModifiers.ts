import Modifiers, { Modifier } from "../enum/Modifiers";
import { UnitType } from "../enum/UnitTypes";
import { createEnumRecord } from "../util/StringEnumUtils";
import { DamageTable } from "../types/DamageTable";
import { Tech } from "../types/Tech";

export class DamageModifiers {
    private static readonly MORALE_DIVISOR = 540;
    private static readonly PERCENT_MODIFIERS = [
        Modifiers.DISCIPLINE,
        Modifiers.INFANTRY_COMBAT_ABILITY,
        Modifiers.CAVALRY_COMBAT_ABILITY,
        Modifiers.ARTILLERY_COMBAT_ABILITY,
        Modifiers.FIRE_DAMAGE,
        Modifiers.FIRE_DAMAGE_RECEIVED,
        Modifiers.SHOCK_DAMAGE,
        Modifiers.SHOCK_DAMAGE_RECEIVED,
        Modifiers.MORALE_DAMAGE,
        Modifiers.MORALE_DAMAGE_RECEIVED,
    ] as const;

    private modifiers: Record<Modifier, number>
    private techDamages: DamageTable;
    private combatAbilities: Record<UnitType, number>

    constructor(tech: Tech, modifiers: Partial<Record<Modifier, number>> = {}) {
        this.modifiers = createEnumRecord(0, Modifiers);
        this.techDamages = tech.damages;
        for (const modifier in modifiers) {
            const key = modifier as Modifier
            const value = modifiers[key] ?? 0;
            this.modifiers[key] = DamageModifiers.PERCENT_MODIFIERS.includes(key) ? toMultiplier(value): value;
        }
        this.combatAbilities = {
            infantry: this.modifiers.infantryCombatAbility,
            cavalry: this.modifiers.cavalryCombatAbility,
            artillery: this.modifiers.artilleryCombatAbility,

        }
    }

    private commonMultipliers(type: UnitType, isFire: boolean) {
        return this.modifiers.discipline * this.combatAbilities[type] * this.techDamages[type][isFire ? "fire": "shock"];
    }

    moraleMultipliers(type: UnitType, isFire: boolean) {
        return this.commonMultipliers(type, isFire) * this.modifiers.moraleDamage * this.morale / DamageModifiers.MORALE_DIVISOR;
    }

    strengthMultipliers(type: UnitType, isFire: boolean) {
        return this.commonMultipliers(type, isFire) * (isFire ? this.modifiers.fireDamage: this.modifiers.shockDamage);
    }

    phaseDefenseMultiplier(isFire: boolean): number {
        return (isFire ? this.modifiers.fireDamageReceived: this.modifiers.shockDamageReceived);
    }

    get morale() {
        return this.modifiers.morale
    };
    get moraleDefenseMultiplier() {
        return this.modifiers.moraleDamageReceived
    }
    get tactics() {
        return this.modifiers.tactics
    };
}

export function toMultiplier(percentValue: number): number {
    return 1 + (percentValue / 100);
}