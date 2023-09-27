import Regiment from "./Regiment";

export default class ArmySnapshot{
    front: (Regiment | undefined)[];
    reserves: Regiment[];
    currentStrength: number = 0;
    maxStrength: number = 0;
    currentMorale: number = 0;
    maxMorale: number = 0;

    constructor(front: (Regiment | undefined)[], reserves: Regiment[], regiments: Regiment[]) {
        this.front = front.map(val => val !== undefined ? val.unmodifiableCopy(): undefined);
        this.reserves = reserves.map(val => val.unmodifiableCopy());
        regiments.forEach((value) => {
            this.currentMorale += value.currentMorale;
            this.maxMorale += value.maxMorale;
            this.currentStrength += value.strength;
        }, this);
        this.maxStrength = regiments.length * Regiment.MAX_STRENGTH;
    }
}