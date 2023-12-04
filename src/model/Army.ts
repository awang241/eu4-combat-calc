import ArmySnapshot from "../types/ArmySnapshot";
import { DamageModifiers } from "./DamageModifiers";
import { Tech } from "../types/Tech";
import Regiment from "./Regiment";
import UnitTypes, { UnitType } from "../enum/UnitTypes";
import Row from "./Row";
import Unit, { blankUnit } from "../types/Unit";
import { Modifier } from "../enum/Modifiers";

const BACK_ROW_MORALE_DAMAGE_FACTOR = 0.4;
const BASE_BACKROW_REINFORCE_LIMIT = 2;
const BASE_RESERVES_MORALE_DAMAGE_FACTOR = 2;

type StrengthAndMoraleVals = {morale: number, strength: number};   

export default class Army {
    //The base maximum morale for this army.
    private static readonly STRENGTH_CASUALTIES_INDEX: number = 0;
    private static readonly MORALE_DAMAGES_INDEX: number = 1;

    roll = 5;
    private modifiers: DamageModifiers;
    private tech: Tech;
    private front: Row = new Row(0);
    private back: Row = new Row(0);
    private reserves: Record<UnitType, Regiment[]> = {
        infantry: [],
        cavalry: [],
        artillery: [],
    };
    private regiments: Record<UnitType, Regiment[]> = {
        infantry: [],
        cavalry: [],
        artillery: [],
    };

    /**
     * Create a new Army object with the given number of infantry regiments.
     * @param regsState The count and unit template for each regiment type.
     * @param modifiers The army-level modifiers (morale, discipline, etc...) for this army.
     */
    constructor(units: Record<UnitType, [Unit, number]>, modifiers: Partial<Record<Modifier, number>>, tech: Tech) {
        const morale = modifiers.morale ?? tech.morale
        for (const type of Object.values(UnitTypes)) {
            const [unit, count] = units[type];
            if (unit.name !== blankUnit(type).name) {
                this.regiments[type] = new Array(count).fill(undefined).map(_ => new Regiment(morale, unit));
            }
        }
        this.modifiers = new DamageModifiers(tech, modifiers);
        this.tech = {...tech};
    }

    /**
     * Applies the casualties and morale damage in the given array to the corresponding frontline regiment (e.g. 
     * the regiment at index 4 in the frontline will take the casualties and morale damage at index 4 in those arrays)
     * The casualties and morale damage arrays must have the same length as the front line or an error will be thrown.
     * @param casualtiesList The number of casualties to be applied to each front line regiment.
     * @param moraleDamages The amount of morale damage to be applied to each front line regiment.
     */
    applyCasualtiesAndMoraleDamage(casualtiesList: StrengthAndMoraleVals[], passiveMoraleDamage: number){
        if (casualtiesList.length !== this.front.length) {
            throw new Error("The frontline and casualty arrays have mismatched lengths.");
        }
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

    /**
     * Sets the army's front row to the given combat width and deploys this army's regiments to it. Any excess regiments are 
     * placed in the army's reserves.
     * 
     * If there are not enough regiments to fill the given width, all regiments are deployed from the centre outwards. If the 
     * number of regiments does not split evenly (even number of regiments with odd width or vice versa), the extra regiment is
     * placed on the right. 
     * @param {number} combatWidth combat width.
     * @param {number} enemyFrontage the total number of cavalry and infantry regiments of the enemy army.
     */
    deploy(combatWidth: number, enemyFrontage: number) {
        if (this.front.length > 0 ||  this.back.length > 0) {
            throw new Error("Cannot deploy an army that has already been deployed.")
        }
        this.front = new Row(combatWidth);
        this.back = new Row(combatWidth);
        let numCentreInfantry: number;
        let numCavalry: number;

        const infantry = this.regiments[UnitTypes.INFANTRY].slice();
        const cavalry = this.regiments[UnitTypes.CAVALRY].slice();
        const artillery = this.regiments[UnitTypes.ARTILLERY].slice();
        this.reserves = { infantry, cavalry, artillery };
        const targetWidth = Math.min(combatWidth, enemyFrontage);

        if (this.numInfantryAndCavalry() <= targetWidth) {
            numCentreInfantry = infantry.length;
            numCavalry = cavalry.length;
        } else if (enemyFrontage < combatWidth / 2 || infantry.length < combatWidth / 2) {
            numCentreInfantry = Math.min(infantry.length, enemyFrontage);
            numCavalry = Math.min(cavalry.length, combatWidth - numCentreInfantry);
        } else {
            numCavalry = Math.min(cavalry.length, Math.floor(combatWidth / 2));
            numCentreInfantry = Math.min(infantry.length, enemyFrontage, combatWidth - numCavalry)
        }
        this.reinforceFront(UnitTypes.INFANTRY, numCentreInfantry);
        this.reinforceFront(UnitTypes.CAVALRY, numCavalry);
        this.reinforceFront();
        this.reinforceBack(true);
        this.moveArtilleryToFront();
    }  

    /**
     * Returns the total number of infantry and cavalry regiments in this army.
     */
    numInfantryAndCavalry(): number {
        return this.regiments[UnitTypes.INFANTRY].length + this.regiments[UnitTypes.CAVALRY].length;
    }

    numRegiments(type?: UnitType): number {
        if (type !== undefined) {
            return this.regiments[type].length;
        } else {
            return this.numRegiments(UnitTypes.INFANTRY) + this.numRegiments(UnitTypes.CAVALRY) + this.numRegiments(UnitTypes.ARTILLERY);
        }
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

    moraleDefenseMultiplier(): number {
        return this.modifiers.moraleDefenseMultiplier;
    }

    moraleMultipliers(type: UnitType, isFire: boolean): number {
        return this.modifiers.moraleMultipliers(type, isFire);
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

    strengthMultipliers(type: UnitType, isFire: boolean): number {
        return this.modifiers.strengthMultipliers(type, isFire);
    }

    phaseDefenseMultiplier(isFire: boolean): number {
        return this.modifiers.phaseDefenseMultiplier(isFire);
    }

    /**
     * Sets targets for all regiments in front and back rows. See Row for more detail.
     * @param enemyArmy The enemy army.
     */
    setTargets(enemyArmy: Army) {
        this.front.setTargets(enemyArmy.front);
        this.back.setTargets(enemyArmy.front);
    } 

    private moveReservesToRow(toFront: boolean, type: UnitType, limit?: number): Regiment[] {
        const row = toFront ? this.front : this.back;
        const added = row.addRegiments(this.reserves[type], limit);
        this.reserves[type] = this.reserves[type].filter(reg => !added.includes(reg));
        return added;
    }

    private reinforceFront(type?: UnitType, limit?: number): Regiment[] {
        const addedRegs: Regiment[] = []
        if (type === undefined) {
            addedRegs.push(...this.moveReservesToRow(true, UnitTypes.INFANTRY));
            addedRegs.push(...this.moveReservesToRow(true, UnitTypes.CAVALRY));
        } else if (type === UnitTypes.ARTILLERY) {
            throw Error("not yet implemented");
        } else {
            addedRegs.push(...this.moveReservesToRow(true, type, limit));
        }
        return addedRegs;
    }

    private reinforceBack(isDeploying: boolean = false): Regiment[] {
        const limit = isDeploying ? undefined: BASE_BACKROW_REINFORCE_LIMIT
        return this.moveReservesToRow(false, UnitTypes.ARTILLERY, limit)
    }

    /**
     * Moves destroyed/routed regiments out of combat, and replaces them with reserves if any are available.
     * @returns true if the front was changed, false otherwise.
     */
    replaceRegiments(): boolean {
        let changed = false;
        changed = this.front.removeBrokenRegiments() ? true : changed; 
        changed = this.back.removeBrokenRegiments() ? true : changed; 
        changed = this.reinforceFront().length > 0 ? true : changed; 
        changed = this.front.moveOutmostRegimentToInmostGap() ? true : changed; 
        changed = this.moveArtilleryToFront() ? true : changed;     
        changed = this.reinforceBack().length > 0 ? true : changed; 
        changed = this.front.shiftRegiments() ? true : changed; 
        return changed;
    }


    /**
     * Returns the average morale of all regiments in this army.
     * @returns the average morale of all regiments. If there are no regiments, returns 0.
     */
    totalMorale() {
        return this.allRegiments.reduce((prev, curr) => prev + curr.currentMorale, 0);
    }


    get maxWidth(): number {return this.tech.width};
    get morale(): number {return this.modifiers.morale};
    get tactics(): number {
        return (this.tech.tactics + this.modifiers.bonusTactics) * this.modifiers.discipline;
    };

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