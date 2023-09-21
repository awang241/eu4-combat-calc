import Modifiers from "./data/Modifiers";
import Regiment, { RegimentTypes } from "./Regiment";

export default class Army {
    //The base maximum morale for this army.
    private static readonly STRENGTH_CASUALTIES_INDEX: number = 0;
    private static readonly MORALE_DAMAGES_INDEX: number = 1;

    private _modifiers: Modifiers;
    private front: Array<Regiment | undefined>;
    private reserves: Array<Regiment>;
    private regiments: Array<Regiment>;
    private infantry: number;
    private cavalry: number;

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
     * @param {number} infantry The number of infantry regiments.
     * @param cavalry The number of cavalry regiments.
     * @param {number} modifiers The army-level modifiers (morale, discipline, etc...) for this army.
     */
    constructor(infantry: number, cavalry: number, modifiers: Modifiers) {
        
        this.infantry = infantry;
        this.cavalry = cavalry;
        this.front = new Array<Regiment>();
        this.reserves = new Array<Regiment>();
        this.regiments =  new Array<Regiment>();
        for (let i = 0; i < infantry; i++) {
            this.regiments.push(new Regiment(modifiers.morale))
        }
        for (let i = 0; i < cavalry; i++) {
            this.regiments.push(new Regiment(modifiers.morale, RegimentTypes.CAVALRY))
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
            if (this.front[i] !== undefined) {
                let totalMoraleDamage =  casualtiesAndDamages[i][Army.MORALE_DAMAGES_INDEX] + 0.01 * enemyMorale;
                this.front[i]?.takeCasualties(Math.floor(casualtiesAndDamages[i][Army.STRENGTH_CASUALTIES_INDEX]));
                this.front[i]?.takeMoraleDamage(totalMoraleDamage);
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
        const moraleDivisor = 540;
        for (const regiment of this.front) {
            if (regiment !== undefined && regiment.target !== undefined && regiment.targetIndex !== undefined) {
                const strengthPips = battlePips + regiment.pips.offencePips(isFirePhase)- regiment.target.pips.defencePips(isFirePhase);
                const moralePips = strengthPips + regiment.pips.moraleOffence - regiment.target.pips.moraleDefence;

                const phaseDamageBonus = isFirePhase ? this.modifiers.fireDamage(): this.modifiers.shockDamage();
                const enemyPhaseDamageReduction = isFirePhase ? enemyModifiers.fireDamageReceived(): enemyModifiers.shockDamageReceived();
                const strengthMultiplier = regiment.strength / Regiment.MAX_STRENGTH;
                
                const damages = regiment.type === RegimentTypes.INFANTRY ? this.damage.infantry : this.damage.cavalry;
                const damageMultiplier = isFirePhase ? damages.fire: damages.shock;
                const roundMultiplier = 1 + days / 100;
                const disciplineAndTacticsMultiplier = this.modifiers.discipline() / (Army.tactics * enemyModifiers.discipline());
                const phaseBonusesMultiplier = phaseDamageBonus * enemyPhaseDamageReduction;
                const moraleBonusMultiplier = this.modifiers.moraleDamage() / this.modifiers.moraleDamageReceived();
                
                const baseMultipliers = strengthMultiplier * damageMultiplier * roundMultiplier * disciplineAndTacticsMultiplier;
                const moraleMultipliers = baseMultipliers * (this.modifiers.morale / moraleDivisor) * moraleBonusMultiplier;
                const casualtyModifiers = baseMultipliers * phaseBonusesMultiplier;
                const baseCasualties = Math.max(0, 15 + 5 * strengthPips);  
                const baseMoraleDamage = Math.max(0, 15 + 5 * moralePips);

                frontDamages[regiment.targetIndex][Army.MORALE_DAMAGES_INDEX] +=  baseMoraleDamage * moraleMultipliers;
                frontDamages[regiment.targetIndex][Army.STRENGTH_CASUALTIES_INDEX] +=  baseCasualties * casualtyModifiers;
            }
        }
    return frontDamages;
  }

  private getDeployIndexOrder(width: number): IterableIterator<number> {
    let indices = Array.from({length: width}, (val, index) => (2 * index)).reverse();
    indices.sort((a, b) => Math.abs(a - width + 1) - Math.abs(b - width + 1));
    const i = indices.map(val => val / 2);
    return i.values();
  }

  /**
   * Removes regiment-index pairs from the given sources and places the regiment in the front line at 
   * the given index. Each call will place regiments until the given maximum number is reached or 
   * the indexes or regiments has run out.
   * Note that regiments and indices are removed from the sources after the regiment is placed, and that
   * regiments are removed from the end of the array (although order should not matter for regiments) 
   * @param feedArray The source array regiments are being removed from.
   * @param indexOrder An iterator providing the indices the regiments are to be placed at.
   * @param max The maximum number of regiments to be placed. If not provided, defaults to the total number of regiments
   */
  private fillFront(feedArray: Array<Regiment>, indexOrder: IterableIterator<number>, max?: number) {
    const limit = max === undefined || max > this.front.length ? this.front.length: max;
    let loops = 0;
    let nextIndex: IteratorResult<number, number>;
    let indicesFinished: boolean | undefined = false;
    while (!indicesFinished && feedArray.length > 0 && loops < limit) {
        nextIndex = indexOrder.next();
        indicesFinished = nextIndex.done;
        this.front[nextIndex.value] = feedArray.pop();
        loops++;
    }
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
    this.front = new Array<Regiment | undefined>(maxWidth).fill(undefined);
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
    const indexOrder: IterableIterator<number> = this.getDeployIndexOrder(maxWidth);
    this.fillFront(infantry, indexOrder, numCentreInfantry);
    this.fillFront(cavalry, indexOrder, numCavalry);
    this.reserves = cavalry.concat(infantry);
    this.fillFront(this.reserves, indexOrder);
  }

  frontlineRegimentCount(): number {
    return this.regiments.filter((val) => val.type !== RegimentTypes.ARTILLERY).length;
  }

  getRegimentDataAtIndex(index: number): Regiment | undefined {
    return this.front[index] === undefined ? undefined : this.front[index]?.unmodifiableCopy();
  }

  /**
   * Returns true if morale or strength are at 0, otherwise returns true.
   * @returns {boolean} true if morale or strength are at 0, otherwise returns true.
   */
  isBroken(): boolean {
    return this.totalMorale() <= 0 || this.strength() <= 0
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
            let regiment = this.front[i];
            if (regiment !== undefined) {
                if (enemyArmy.front[i] !== undefined) {
                    regiment.setTarget(enemyArmy.front[i], i);
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
     * @returns  true if any regiments were removed/replaced, false otherwise.
     */
    replaceRegiments(): boolean {
        let updated = false;

        for (let i = 0; i < this.front.length; i++) {
            const regiment = this.front[i];
            if (regiment !== undefined && (regiment.strength <= 0 || regiment.currentMorale <= 0)) {
                updated = true;
                regiment.setTarget(undefined, undefined);
                this.front[i] = undefined;
            }
        }

        let rightHalfIndex = Math.ceil(this.front.length / 2);
        let leftHalfIndex = rightHalfIndex - 1;
        let isLeftNext = true;
        while (this.reserves.length > 0 && (leftHalfIndex >= 0 || rightHalfIndex < this.front.length)) {
            const index = isLeftNext ? leftHalfIndex--: rightHalfIndex++;
            if (this.front[index] === undefined) {
                if (this.reserves.pop() !== undefined) {
                    this.front[index] = this.reserves.pop();
                }
                updated = true;
            }
            isLeftNext = !isLeftNext;
        }
        return updated;
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