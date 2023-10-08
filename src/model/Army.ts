import ArmySnapshot from "../types/ArmySnapshot";
import { Modifiers, toMultiplier } from "../types/Modifiers";
import { getDefencePips, getOffencePips } from "../types/Pips";
import Unit from "../types/Unit";
import Regiment, { RegimentTypes } from "./Regiment";
import Row from "./Row";

export default class Army {
    //The base maximum morale for this army.
    private static readonly STRENGTH_CASUALTIES_INDEX: number = 0;
    private static readonly MORALE_DAMAGES_INDEX: number = 1;

    private _modifiers: Modifiers;
    private front: Row;
    private reserves: Array<Regiment>;
    private regiments: Array<Regiment>;

    //The damage multipliers for each unit fot the fire/shock combat phases.
    readonly damage = {
        infantry: {
            fire: 0.35,
            shock: 0.5
        },
        cavalry: {
            fire: 0,
            shock: 1
        }
    };
    static readonly tactics = 0.5


    /**
     * Create a new Army object with the given number of infantry regiments.
     * @param infantry The number of infantry regiments.
     * @param cavalry The number of cavalry regiments.
     * @param modifiers The army-level modifiers (morale, discipline, etc...) for this army.
     */
    constructor(
            infantry: number,
            cavalry: number,
            modifiers: Modifiers,
            infantryUnit: Unit,
            cavalryUnit: Unit
    ) {
        this.front = new Row(0)
        this.reserves = new Array<Regiment>();
        this.regiments =  new Array<Regiment>();
        for (let i = 0; i < infantry; i++) {
            this.regiments.push(new Regiment(modifiers.morale, infantryUnit))
        }
        for (let i = 0; i < cavalry; i++) {
            this.regiments.push(new Regiment(modifiers.morale, cavalryUnit))
        }
        this._modifiers = modifiers;
        Object.freeze(modifiers);
    }

    /**
     * Applies the casualties and morale damage in the given array to the corresponding frontline regiment (e.g. 
     * the regiment at index 4 in the frontline will take the casualties and morale damage at index 4 in those arrays)
     * The casualties and morale damage arrays must have the same length as the front line or an error will be thrown.
     * @param casualties The number of casualties to be applied to each front line regiment.
     * @param moraleDamages The amount of morale damage to be applied to each front line regiment.
     */
    applyCasualtiesAndMoraleDamage(casualtiesAndDamages: Array<[number, number]>, enemyMorale: number){
        if (casualtiesAndDamages.length !== this.front.length) {
            throw new Error("The frontline and casualty arrays have mismatched lengths.");
        }
        for (let i = 0; i < casualtiesAndDamages.length; i++) {
            if (this.front.at(i) !== undefined) {
                let totalMoraleDamage =  casualtiesAndDamages[i][Army.MORALE_DAMAGES_INDEX] + 0.01 * enemyMorale;
                this.front.at(i)?.takeCasualties(Math.floor(casualtiesAndDamages[i][Army.STRENGTH_CASUALTIES_INDEX]));
                this.front.at(i)?.takeMoraleDamage(totalMoraleDamage);
            }
        }
        for (const regiment of this.reserves) {
            regiment.takeMoraleDamage(0.02 * enemyMorale);
        }
    }
  
    /**
     * Calculates the morale and strength casualties inflicted by this army for the given day of combat, then returns these values in an array.
     * @param battlePips the total number of pips from factors not from armies/units (e.g. dice roll, terrain)
     * @param isFirePhase true if the battle is currently in the fire phase, false if it is in the shock phase.
     * @param days the current day of the battle.
     * @param enemyModifiers the average maximum morale of the enemy army.
     * @returns an array of the morale and strength casualties inflicted by this army.
     *  Each index corresponds to a regiment in the enemy frontline, starting with index 0 for the
     *  leftmost enemy regiment.
     */
    calculateCasualties(battlePips: number, isFirePhase: boolean, days: number, enemyModifiers: Modifiers): Array<[number, number]> {
        const frontDamages = Array(this.front.length).fill(undefined).map(() => {
            const blankTuple: [number, number] = [0, 0];
            return blankTuple;
        });
        const MORALE_DIVISOR = 540;
        for (const regiment of this.front) {
            if (regiment !== undefined && regiment.target !== undefined && regiment.targetIndex !== undefined) {
                const strengthPips = battlePips + getOffencePips(regiment.pips, isFirePhase) - getDefencePips(regiment.target.pips, isFirePhase);
                const moralePips = strengthPips + regiment.pips.moraleOffence - regiment.target.pips.moraleDefence;

                const phaseDamageBonus = toMultiplier(isFirePhase ? this.modifiers.fireDamage: this.modifiers.shockDamage);
                const phaseDamageReduction = toMultiplier(isFirePhase ? enemyModifiers.fireDamageReceived : enemyModifiers.shockDamageReceived);
                const strengthMultiplier = regiment.strength / Regiment.MAX_STRENGTH;
                let typeMultiplier;
                let damages;

                if (regiment.type === RegimentTypes.INFANTRY) {
                    damages = this.damage.infantry;
                    typeMultiplier = toMultiplier(this.modifiers.infantryCombatAbility);
                } else {
                    damages = this.damage.cavalry;
                    typeMultiplier = toMultiplier(this.modifiers.cavalryCombatAbility);
                }
                
                const damageMultiplier = isFirePhase ? damages.fire: damages.shock;
                const roundMultiplier = 1 + days / 100;
                const discipline = toMultiplier(this.modifiers.discipline) 
                const tactics = Army.tactics * toMultiplier(enemyModifiers.discipline);
                const phaseBonusesMultiplier = phaseDamageBonus * phaseDamageReduction;
                const moraleBonusMultiplier = toMultiplier(this.modifiers.moraleDamage) * toMultiplier(this.modifiers.moraleDamageReceived);
                
                const baseMultipliers = strengthMultiplier * damageMultiplier * roundMultiplier * discipline * typeMultiplier / tactics;
                const moraleMultipliers = baseMultipliers * (this.modifiers.morale / MORALE_DIVISOR) * moraleBonusMultiplier;
                const casualtyModifiers = baseMultipliers * phaseBonusesMultiplier;
                const baseCasualties = Math.max(0, 15 + 5 * strengthPips);  
                const baseMoraleDamage = Math.max(0, 15 + 5 * moralePips);

                frontDamages[regiment.targetIndex][Army.MORALE_DAMAGES_INDEX] +=  baseMoraleDamage * moraleMultipliers;
                frontDamages[regiment.targetIndex][Army.STRENGTH_CASUALTIES_INDEX] +=  baseCasualties * casualtyModifiers;
            }
        }
        return frontDamages;
    }

    /**
     * Sets the army's front row to the given combat width and deploys this army's regiments to it. Any excess regiments are 
     * placed in the army's reserves.
     * 
     * If there are not enough regiments to fill the given width, all regiments are deployed from the centre outwards. If the 
     * number of regiments does not split evenly (even number of regiments with odd width or vice versa), the extra regiment is
     * placed on the right. 
     * @param {number} maxWidth combat width.
     * @param {number} enemyMaxWidth the total number of cavalry and infantry regiments of the enemy army.
     */
    deploy(maxWidth: number, enemyMaxWidth: number) {
        this.front = new Row(maxWidth);
        const infantry: Array<Regiment> = this.regiments.filter((val) => val.type === RegimentTypes.INFANTRY);
        const cavalry: Array<Regiment> = this.regiments.filter((val) => val.type === RegimentTypes.CAVALRY);
        let numCentreInfantry: number;
        let numCavalry: number;

        const targetWidth: number = Math.min(maxWidth, enemyMaxWidth); 

        if (infantry.length + cavalry.length <= targetWidth) {
            numCentreInfantry = infantry.length;
            numCavalry = cavalry.length;
        } else if (enemyMaxWidth < maxWidth / 2 || infantry.length < maxWidth / 2) {
            numCentreInfantry = Math.min(infantry.length, enemyMaxWidth);
            numCavalry = Math.min(cavalry.length, maxWidth - numCentreInfantry);
        } else {
            numCavalry = Math.min(cavalry.length, Math.floor(maxWidth / 2));
            numCentreInfantry = Math.min(infantry.length, enemyMaxWidth, maxWidth - numCavalry)
        }
        this.moveRegimentsToRow(infantry, numCentreInfantry);
        this.moveRegimentsToRow(cavalry, numCavalry);
        this.reserves = infantry.concat(cavalry);
        this.moveRegimentsToRow(this.reserves);
    }

    frontlineRegimentCount(): number {
        return this.regiments.filter((val) => val.type !== RegimentTypes.ARTILLERY).length;
    }

    getRegimentDataAtIndex(index: number): Regiment | undefined {
        return this.front.at(index)?.unmodifiableCopy();
    }

    getSnapshot(): ArmySnapshot {
        return new ArmySnapshot(this.front, this.reserves, this.regiments);
    }

    /**
     * Returns true if morale or strength are at 0, otherwise returns true.
     * @returns {boolean} true if morale or strength are at 0, otherwise returns true.
     */
    isBroken(): boolean {
        return this.totalMorale() <= 0 || this.strength() <= 0;
    }

    /**
     * Moves regiments from the given source array to the specified row. Regiments are
     * moved until the source is empty, the row is 
     * @param source 
     * @param max The maximum number of regiments to be moved. If not provided, regiments 
     *    are moved until the source is empty or the row is full.
     * @param front If true or not provided, the front row is used; otherwise not supported yet.
     * @returns The number of regiments moved to the row.
     */
    moveRegimentsToRow(source: Regiment[], max?: number, front?: boolean): number {
        let moved: number;
        moved = (front ?? true) ? this.front.addRegiments(source, max) : 0
        source.splice(0, moved);
        return moved;
    }
        
    /**
     * Returns the total number of soldiers in the army.
     * @returns {number} the total strength of all regiments in this army.
     */
    strength(): number {
        return this.regiments.reduce((prev, curr) => prev + curr.strength, 0);
    }

    /**
     * Given the front line of an enemy army as an array of regiments, sets the target for each regiment in this army.
     * Regiments will prioritize enemy regiments opposite them; if there isn't one there, they will pick an enemy regiment within their flanking range
     * (e.g a regiment at index 7 and flanking range 2 can hit enemy regiments from index 5 to 9.).
     * If there are no available targets, the regiment's target will be set to undefined.
     * @param enemyFront The enemy army's front line as an array on regiments. This must be the same length as this army's front line.
     * @throws Will throw an error if the enemy front and this army's front are different lengths.
     */
    setTargets(enemyArmy:Army) {
        if (enemyArmy.front.length !== this.front.length) {
            throw Error("Mismatched front lengths.")
        }

        for (let i = 0; i < this.front.length; i++) {
            let regiment = this.front.at(i);
            if (regiment !== undefined) {
                if (enemyArmy.front.at(i) !== undefined) {
                    regiment.setTarget(enemyArmy.front.at(i), i);
                } else {
                    const minIndex = Math.max(0, i - regiment.flankingRange());
                    const maxIndex = Math.min(enemyArmy.front.length - 1, i + regiment.flankingRange());
                    let potentialTargets:Array<Regiment>;
                    potentialTargets = enemyArmy.front.slice(minIndex, maxIndex + 1).filter((val:Regiment | undefined) => val !== undefined) as Array<Regiment>;

                    const target = potentialTargets.length === 0 ? undefined: potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
                    const targetIndex = potentialTargets.length === 0 ? undefined: enemyArmy.front.indexOf(target)
                    regiment.setTarget(target, targetIndex); 
                }
            }
        }
    } 

    /**
     * Moves destroyed/routed regiments out of combat, and replaces them with reserves if any are available.
     * @returns  true if the front was changed, false otherwise.
     */
    replaceRegiments(): boolean {
        const removed: boolean = this.front.removeBrokenRegiments();
        const reinforced = (this.moveRegimentsToRow(this.reserves) > 0);
        const moved = this.front.moveFlankRegimentToCentreGap();
        const shifted = this.front.shiftRegiments();
        return removed || moved || shifted || reinforced;
    }

    /**
     * Returns the average morale of all regiments in this army.
     * @returns the average morale of all regiments. If there are no regiments, returns 0.
     */
    totalMorale() {
        return this.regiments.reduce((prev, curr) => prev + curr.currentMorale, 0);
    }

    public get modifiers(): Modifiers {return this._modifiers;}
}