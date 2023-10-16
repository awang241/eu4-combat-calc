import Army from "./model/Army";
import ArmySnapshot from "./types/ArmySnapshot";

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
  
    const loopLimit:number = 100;
    const dayOffset:number = 1;
    const combatPhasePeriod: number = 6;
    const firePhaseCutoff: number = 3;
    const combatWidth: number = 20;
    attacker.deploy(combatWidth, defender.frontlineRegimentCount());
    defender.deploy(combatWidth, attacker.frontlineRegimentCount());
    let isAttackerUpdated = true;
    let isDefenderUpdated = true;
    const dailyStrengths: [ArmySnapshot, ArmySnapshot][] = [];
    dailyStrengths.push([attacker.getSnapshot(), defender.getSnapshot()]);
    while (!attacker.isBroken() && !defender.isBroken() && days < loopLimit) {
      let isFirePhase = (days - dayOffset) % combatPhasePeriod < firePhaseCutoff;
      let roll = 5;
      if (isDefenderUpdated || isAttackerUpdated) {
        attacker.setTargets(defender);
        defender.setTargets(attacker);
      }
      //N.B. Do not collapse - casualties must be calculated for both sides before applying them.
      const defenderCasualties = attacker.calculateCasualties(roll, isFirePhase, days, defender.modifiers);
      const attackerCasualties = defender.calculateCasualties(roll, isFirePhase, days, attacker.modifiers);
      attacker.applyCasualtiesAndMoraleDamage(attackerCasualties, defender.modifiers.morale);
      defender.applyCasualtiesAndMoraleDamage(defenderCasualties, attacker.modifiers.morale);
      dailyStrengths.push([attacker.getSnapshot(), defender.getSnapshot()]);
      isAttackerUpdated = attacker.replaceRegiments();
      isDefenderUpdated = defender.replaceRegiments();
  
      days++;
    }
    return dailyStrengths;
  }