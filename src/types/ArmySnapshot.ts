import UnitTypes, { UnitType } from "../enum/UnitTypes";
import Regiment from "../model/Regiment";
import Row from "../model/Row";

const STRENGTHS_TEMPLATE = {
    deployed: 0,
    reserve: 0,
    retreated: 0,
    total: 0,
}
export default class ArmySnapshot{
    front: (Regiment | undefined)[];
    back: (Regiment | undefined)[];
    reserves: Regiment[];
    maxStrength: number = 0;
    currentMorale: number = 0;
    maxMorale: number = 0;
    techLevel: number;
    tactics: number;

    _currentStrengths = {
        [UnitTypes.INFANTRY]: {...STRENGTHS_TEMPLATE},
        [UnitTypes.CAVALRY]: {...STRENGTHS_TEMPLATE},
        [UnitTypes.ARTILLERY]: {...STRENGTHS_TEMPLATE},
    };


    constructor(front: Row, back: Row, reserves: Regiment[], regiments: Regiment[], techLevel: number, tactics: number) {
        this.front = front.createSnapshot();
        this.back = back.createSnapshot();
        this.reserves = reserves.map(val => val.unmodifiableCopy());
        this.techLevel = techLevel;
        this.tactics = tactics;
        regiments.forEach((regiment) => {
            let status: keyof typeof STRENGTHS_TEMPLATE;
            if (this.front.includes(regiment) || this.back.includes(regiment)) {
                status = "deployed";
            } else if (this.reserves.includes(regiment)) {
                status = "reserve";
            } else {
                status = "retreated";
            }
            this._currentStrengths[regiment.type][status] += regiment.strength;
            this.currentMorale += regiment.currentMorale;
            this.maxMorale += regiment.maxMorale;
        }, this);
        this.maxStrength = regiments.length * Regiment.MAX_STRENGTH;
        for (const type in this._currentStrengths) {
            const subtotals = this._currentStrengths[type];
            this._currentStrengths[type].total = subtotals.deployed + subtotals.reserve + subtotals.retreated;
        }
    }

    get currentStrength(): number {
        let total = 0;
        for (const type in this._currentStrengths) {
            total += this._currentStrengths[type].total;
        }
        return total;
    }

    currentStrengthOfType(type: UnitType) {
        return this._currentStrengths[type].total;
    }    
}