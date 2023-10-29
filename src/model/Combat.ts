import Army from "./Army";
import ArmySnapshot from "../types/ArmySnapshot";

/**
 * Runs combat between the attacker and defeneder until one side is broken or destroyed,
 * then returns snapshots of both armies for each day of combat.
 * @param {Army} attacker
 * @param {Army} defender 
 * @returns An array of snapshots of both armies at the end of each day of combat. The index
 * corresponds to the day, and day 0 is the initial state of both armies.
 */
export function combat(attacker: Army, defender: Army): [ArmySnapshot, ArmySnapshot][] {
    let days = 1;

    const loopLimit: number = 100;
    const combatWidth: number = Math.max(attacker.maxWidth, defender.maxWidth);
    attacker.deploy(combatWidth, defender.numInfantryAndCavalry());
    defender.deploy(combatWidth, attacker.numInfantryAndCavalry());
    let isAttackerUpdated = true;
    let isDefenderUpdated = true;
    const dailyStrengths: [ArmySnapshot, ArmySnapshot][] = [];
    dailyStrengths.push([attacker.getSnapshot(), defender.getSnapshot()]);
    while (!attacker.isBroken() && !defender.isBroken() && days < loopLimit) {
        let roll = 5;
        if (isDefenderUpdated || isAttackerUpdated) {
            attacker.setTargets(defender);
            defender.setTargets(attacker);
        }
        //N.B. Do not collapse - casualties must be calculated for both sides before applying them.
        const defenderCasualties = attacker.calculateCasualtiesArray(roll, days, defender);
        const attackerCasualties = defender.calculateCasualtiesArray(roll, days, attacker);
        attacker.applyCasualtiesAndMoraleDamage(attackerCasualties, defender.modifiers.morale);
        defender.applyCasualtiesAndMoraleDamage(defenderCasualties, attacker.modifiers.morale);
        dailyStrengths.push([attacker.getSnapshot(), defender.getSnapshot()]);
        isAttackerUpdated = attacker.replaceRegiments();
        isDefenderUpdated = defender.replaceRegiments();

        days++;
    }
    return dailyStrengths;
}