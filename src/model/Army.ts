import ArmySnapshot from "../types/ArmySnapshot";
import { Modifiers, toMultiplier } from "../types/Modifiers";
import { Tech } from "../types/Tech";
import Regiment from "./Regiment";
import { RegimentTypes } from "../enum/RegimentTypes";
import Row from "./Row";
import Unit, { blankUnit } from "../types/Unit";


const BACK_ROW_MORALE_DAMAGE_FACTOR = 0.4;
const BASE_BACKROW_REINFORCE_LIMIT = 2;
const BASE_RESERVES_MORALE_DAMAGE_FACTOR = 2;
const MORALE_DIVISOR = 540;

type StrengthAndMoraleVals = {morale: number, strength: number};   

export default class Army {
    //The base maximum morale for this army.
    private static readonly STRENGTH_CASUALTIES_INDEX: number = 0;
    private static readonly MORALE_DAMAGES_INDEX: number = 1;

    private _modifiers: Modifiers;
    private tech: Tech;
    private front: Row = new Row(0);
    private back: Row = new Row(0);
    private reserves: {[type in RegimentTypes]: Regiment[]} = {
        [RegimentTypes.INFANTRY]: [],
        [RegimentTypes.CAVALRY]: [],
        [RegimentTypes.ARTILLERY]: [],
    };
    private regiments: {[type in RegimentTypes]: Regiment[]} = {
        [RegimentTypes.INFANTRY]: [],
        [RegimentTypes.CAVALRY]: [],
        [RegimentTypes.ARTILLERY]: [],
    };

    /**
     * Create a new Army object with the given number of infantry regiments.
     * @param regsState The count and unit template for each regiment type.
     * @param modifiers The army-level modifiers (morale, discipline, etc...) for this army.
     */
    constructor(units: {[type in RegimentTypes]: Unit}, counts: {[type in RegimentTypes]: number}, modifiers: Modifiers, tech: Tech) {
        for (const type of [RegimentTypes.INFANTRY, RegimentTypes.CAVALRY, RegimentTypes.ARTILLERY]) {
            const regType: RegimentTypes = type as RegimentTypes;
            if (units[regType] !== blankUnit(regType)) {
                for (let i = 0; i < counts[regType]; i++) {
                    this.regiments[regType].push(new Regiment(modifiers.morale, units[regType]))
                }
            }
        }
        
        this._modifiers = {...modifiers} as const;
        this.tech = {...tech} as const;
    }

    /**
     * Applies the casualties and morale damage in the given array to the corresponding frontline regiment (e.g. 
     * the regiment at index 4 in the frontline will take the casualties and morale damage at index 4 in those arrays)
     * The casualties and morale damage arrays must have the same length as the front line or an error will be thrown.
     * @param casualtiesList The number of casualties to be applied to each front line regiment.
     * @param moraleDamages The amount of morale damage to be applied to each front line regiment.
     */
    applyCasualtiesAndMoraleDamage(casualtiesList: StrengthAndMoraleVals[], enemyMorale: number){
        if (casualtiesList.length !== this.front.length) {
            throw new Error("The frontline and casualty arrays have mismatched lengths.");
        }
        const passiveMoraleDamage = 0.01 * enemyMorale;
        for (let i = 0; i < casualtiesList.length; i++) {
            if (this.front.at(i) !== undefined) {
                this.front.at(i)?.takeCasualties(Math.floor(casualtiesList[i].strength));
                this.front.at(i)?.takeMoraleDamage(casualtiesList[i].morale + passiveMoraleDamage);
                this.back.at(i)?.takeMoraleDamage(BACK_ROW_MORALE_DAMAGE_FACTOR * casualtiesList[i].morale + passiveMoraleDamage)
            }
        }
        const reservePassiveMoraleDamage = BASE_RESERVES_MORALE_DAMAGE_FACTOR * passiveMoraleDamage
        this.allReserves.forEach(regiment => regiment.takeMoraleDamage(reservePassiveMoraleDamage));
    }

    atBack(index: number): Regiment | undefined {
        return this.back.at(index);
    }

    atFront(index: number): Regiment | undefined {
        return this.front.at(index);
    }

    private calculateCasualties(
            attacker: Regiment,
            isFirePhase: boolean, 
            battlePips: number,
            roundMultiplier: number, 
            enemyArmy: Army
    ): StrengthAndMoraleVals {
        const targetPips = (attacker.targetIndex !== undefined) ? enemyArmy.pipsAt(attacker.targetIndex, isFirePhase): undefined;
        if (targetPips === undefined) {
            return {strength: 0, morale: 0};
        }
        const strengthPips = battlePips + attacker.getStrengthOffencePips(isFirePhase) - targetPips.strength;
        const moralePips = battlePips + attacker.getMoraleOffencePips(isFirePhase) - targetPips.morale;
        
        const damageMultiplier = isFirePhase ? this.tech.damages[attacker.type].fire: this.tech.damages[attacker.type].shock;
        const strengthMultiplier = attacker.strength / Regiment.MAX_STRENGTH;
        const combatAbilityMultiplier = toMultiplier(this.combatAbility(attacker.type));
        const totalMultipliers = strengthMultiplier * damageMultiplier * combatAbilityMultiplier * roundMultiplier / enemyArmy.modifiers.tactics;

        const baseMoraleMultiplier = this.modifiers.morale / MORALE_DIVISOR;
        const moraleDamageBonus = toMultiplier(this.modifiers.moraleDamage);
        const moraleDamageReduction = toMultiplier(enemyArmy.modifiers.moraleDamageReceived);
        const casualtyBonus = toMultiplier(isFirePhase ? this.modifiers.fireDamage: this.modifiers.shockDamage);
        const casualtyReduction = toMultiplier(isFirePhase ? enemyArmy.modifiers.fireDamageReceived : enemyArmy.modifiers.shockDamageReceived);

        return {
            strength: (15 + 5 * strengthPips) * totalMultipliers * casualtyBonus * casualtyReduction,
            morale: (15 + 5 * moralePips) * totalMultipliers * baseMoraleMultiplier * moraleDamageBonus * moraleDamageReduction,
        };
    }


    /**
     * Calculates the morale and strength casualties inflicted by this army for the given day of combat, then returns these values in an array.
     * @param battlePips the total number of pips from factors not from armies/units (e.g. dice roll, terrain)
     * @param days the current day of the battle.
     * @param enemyModifiers the average maximum morale of the enemy army.
     * @returns an array of the morale and strength casualties inflicted by this army.
     *  Each index corresponds to a regiment in the enemy frontline, starting with index 0 for the
     *  leftmost enemy regiment.
     */
    calculateCasualtiesArray(battlePips: number, days: number, enemyArmy: Army): StrengthAndMoraleVals[] {
        const casualtyArray: StrengthAndMoraleVals[] = Array(this.front.length).fill(undefined).map(() => ({strength: 0, morale: 0}));
        const isFirePhase = (days - 1) % 6 < 3;
        const roundMultiplier = 1 + (days / 100);
        for (let i = 0; i < this.front.length; i++) {
            let attacker = this.front.at(i);
            if (attacker?.targetIndex !== undefined) {
                const casualties = this.calculateCasualties(attacker, isFirePhase, battlePips, roundMultiplier, enemyArmy)
                casualtyArray[attacker.targetIndex].strength += casualties.strength;
                casualtyArray[attacker.targetIndex].morale += casualties.morale;
            }
            attacker = this.back.at(i);
            if (attacker?.targetIndex !== undefined) {
                const casualties = this.calculateCasualties(attacker, isFirePhase, battlePips, roundMultiplier, enemyArmy)
                casualtyArray[attacker.targetIndex].strength += casualties.strength * 0.5;
                casualtyArray[attacker.targetIndex].morale += casualties.morale * 0.5;
            }
        }
        return casualtyArray;
    }

    combatAbility(type: RegimentTypes) {
        if (type === RegimentTypes.INFANTRY) {
            return this.modifiers.infantryCombatAbility;
        } else if (type === RegimentTypes.CAVALRY) {
            return this.modifiers.cavalryCombatAbility;
        } else {
            return this.modifiers.artilleryCombatAbility;
        }
    }

    /**
     * Sets the army's front row to the given combat width and deploys this army's regiments to it. Any excess regiments are 
     * placed in the army's reserves.
     * 
     * If there are not enough regiments to fill the given width, all regiments are deployed from the centre outwards. If the 
     * number of regiments does not split evenly (even number of regiments with odd width or vice versa), the extra regiment is
     * placed on the right. 
     * @param {number} enemyMaxWidth combat width.
     * @param {number} numEnemyInfAndCav the total number of cavalry and infantry regiments of the enemy army.
     */
    deploy(enemyMaxWidth: number, numEnemyInfAndCav: number) {
        if (this.front.length > 0 ||  this.back.length > 0) {
            throw new Error("Cannot deploy an army that has already been deployed.")
        }
        this.front = new Row(enemyMaxWidth);
        this.back = new Row(enemyMaxWidth);
        let numCentreInfantry: number;
        let numCavalry: number;

        const infantry = this.regiments[RegimentTypes.INFANTRY].slice();
        const cavalry = this.regiments[RegimentTypes.CAVALRY].slice();
        const artillery = this.regiments[RegimentTypes.ARTILLERY].slice();
        this.reserves = {
            [RegimentTypes.INFANTRY]: infantry,
            [RegimentTypes.CAVALRY]: cavalry,
            [RegimentTypes.ARTILLERY]: artillery,
        };
        const combatWidth = Math.max(enemyMaxWidth, this.tech.width);
        const targetWidth = Math.min(combatWidth, numEnemyInfAndCav);

        if (this.numInfantryAndCavalry() <= targetWidth) {
            numCentreInfantry = infantry.length;
            numCavalry = cavalry.length;
        } else if (numEnemyInfAndCav < enemyMaxWidth / 2 || infantry.length < enemyMaxWidth / 2) {
            numCentreInfantry = Math.min(infantry.length, numEnemyInfAndCav);
            numCavalry = Math.min(cavalry.length, enemyMaxWidth - numCentreInfantry);
        } else {
            numCavalry = Math.min(cavalry.length, Math.floor(enemyMaxWidth / 2));
            numCentreInfantry = Math.min(infantry.length, numEnemyInfAndCav, enemyMaxWidth - numCavalry)
        }
        this.reinforceFront(RegimentTypes.INFANTRY, numCentreInfantry);
        this.reinforceFront(RegimentTypes.CAVALRY, numCavalry);
        this.reinforceFront();
        this.reinforceBack(true);
        this.moveArtilleryToFront();
    }  

    /**
     * Returns the total number of infantry and cavalry regiments in this army.
     */
    numInfantryAndCavalry(): number {
        return this.regiments[RegimentTypes.INFANTRY].length + this.regiments[RegimentTypes.CAVALRY].length;
    }

    numRegiments(type?: RegimentTypes): number {
        if (type !== undefined) {
            return this.regiments[type].length;
        } else {
            return this.numRegiments(RegimentTypes.INFANTRY) + this.numRegiments(RegimentTypes.CAVALRY) + this.numRegiments(RegimentTypes.ARTILLERY);
        }
    }

    getRegimentDataAtIndex(index: number): Regiment | undefined {
        return this.front.at(index)?.unmodifiableCopy();
    }

    getSnapshot(): ArmySnapshot {
        return new ArmySnapshot(this.front, this.back, this.allReserves, this.allRegiments);
    }

    /**
     * Returns true if morale or strength are at 0, otherwise returns true.
     * @returns {boolean} true if morale or strength are at 0, otherwise returns true.
     */
    isBroken(): boolean {
        return this.totalMorale() <= 0 || this.strength() <= 0;
    }

    /**
     * Moves artillery deployed in the back row to the front if there is no regiment in front of them.
     */
    moveArtilleryToFront(): boolean {
        let changed = false;
        for (let i = 0; i < this.back.length; i++) {
            if (this.back.at(i) !== undefined && this.front.at(i) === undefined) {
                this.front.set(i, this.back.at(i));
                this.back.set(i, undefined);
                changed = true;
            }
        }
        return changed
    }


    /**
     * Returns the effective defense pips for the front row regiment at the given index.
     * Effective defence pips are equal to the defence pips of the front row regiment, plus
     * half of the defence pips of any artillery regiment behind it (i.e. at the same index in the back row),
     * rounded down. 
     * @param index the position in the front row to return pips for.
     * @param useFire true if using fire pips, false if using shock pips.
     * @throws an Error if the index is invalid (out of range or NaN)
     * @returns the effective defence pips at the given index, or undefined if there is no regiment at that index. .
     */
    pipsAt(index: number, useFire: boolean): StrengthAndMoraleVals | undefined {
        if (index < 0 || index >= this.front.length || isNaN(index)) {
            const msg = isNaN(index) ? "Index cannot be NaN": `Index  value of ${index} is out of range`;
            throw new Error(msg)
        }
        const target = this.front.at(index);
        if (target === undefined) {
            return undefined
        } else {
            const backReg = this.back.at(index);
            const backStrengthPips = backReg?.getStrengthDefencePips(useFire) ?? 0;
            const backMoralePips = backReg?.getMoraleDefencePips(useFire) ?? 0;
            return {
                strength: target.getStrengthDefencePips(useFire) + Math.floor(backStrengthPips / 2),
                morale: target.getMoraleDefencePips(useFire) + Math.floor(backMoralePips / 2),
            }
        }
    }
        
    /**
     * Returns the total number of soldiers in the army.
     * @returns {number} the total strength of all regiments in this army.
     */
    strength(): number {
        return this.allRegiments.reduce((prev, curr) => prev + curr.strength, 0);
    }

    /**
     * Sets targets for all regiments in front and back rows. See Row for more detail.
     * @param enemyArmy The enemy army.
     */
    setTargets(enemyArmy: Army) {
        this.front.setTargets(enemyArmy.front);
        this.back.setTargets(enemyArmy.front);
    } 

    private moveReservesToRow(useFront: boolean, type: RegimentTypes, limit?: number): Regiment[] {
        const row = useFront ? this.front : this.back;
        const added = row.addRegiments(this.reserves[type], limit);
        this.reserves[type] = this.reserves[type].filter(reg => !added.includes(reg));
        return added;
    }

    private reinforceFront(type?: RegimentTypes, limit?: number): Regiment[] {
        const addedRegs: Regiment[] = []
        if (type === undefined) {
            addedRegs.concat(this.moveReservesToRow(true, RegimentTypes.INFANTRY));
            if (addedRegs.length !== 0) {
                addedRegs.concat(this.moveReservesToRow(true, RegimentTypes.CAVALRY));
            }
        } else if (type === RegimentTypes.ARTILLERY) {
            throw Error("not yet implemented");
        } else {
            addedRegs.concat(this.moveReservesToRow(true, type, limit));
        }
        return addedRegs;
    }

    private reinforceBack(isDeploying: boolean = false): Regiment[] {
        const limit = isDeploying ? BASE_BACKROW_REINFORCE_LIMIT: undefined
        return this.moveReservesToRow(false, RegimentTypes.ARTILLERY, limit)
    }

    /**
     * Moves destroyed/routed regiments out of combat, and replaces them with reserves if any are available.
     * @returns true if the front was changed, false otherwise.
     */
    replaceRegiments(): boolean {
        let changed = false;
        changed = this.front.removeBrokenRegiments() || changed; 
        changed = this.back.removeBrokenRegiments() || changed;
        changed = this.reinforceFront().length > 0 || changed;
        changed = this.front.moveOutmostRegimentToInmostGap() || changed;
        changed = this.moveArtilleryToFront() || changed;    
        changed = this.reinforceBack().length > 0 || changed;
        changed = this.front.shiftRegiments() || changed;
        return changed;
    }


    /**
     * Returns the average morale of all regiments in this army.
     * @returns the average morale of all regiments. If there are no regiments, returns 0.
     */
    totalMorale() {
        return this.allRegiments.reduce((prev, curr) => prev + curr.currentMorale, 0);
    }


    get modifiers(): Modifiers {return this._modifiers;}
    get maxWidth(): number {return this.tech.width};

    get allRegiments(): Regiment[] {
        return ([] as Regiment[]).concat(...Object.values(this.regiments))
    };

    get deployedRegiments(): Regiment[] {
        return this.back.slice().concat(this.front.slice()).filter(reg => reg !== undefined) as Regiment[];
    }

    get allReserves(): Regiment[] {
        return ([] as Regiment[]).concat(...Object.values(this.reserves))
    }

}