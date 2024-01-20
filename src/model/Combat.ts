import Army from "./Army";
import ArmySnapshot from "../types/ArmySnapshot";
import Regiment from "./Regiment";
import { Leader } from "../types/Leader";
import Terrains, { Terrain } from "../enum/Terrain";
import TechGroups from "../enum/TechGroups";


type Casualties = {strength: number, morale: number};

export default class Combat {
    static readonly LOOP_LIMIT = 100;
    readonly attacker: Army;
    readonly defender: Army;
    readonly terrain: Terrain;
    day: number = 0;
    width: number;
    private _results: [ArmySnapshot, ArmySnapshot][] = [];
    
    constructor(attacker: Army, defender: Army, terrain: Terrain = Terrains.GRASSLANDS) {
        this.attacker = attacker;
        this.defender = defender;
        this.width = Math.max(this.attacker.maxWidth, this.defender.maxWidth);
        this.terrain = terrain;
    }

    private addDailyResult(){
        this._results[this.day] = [this.attacker.getSnapshot(), this.defender.getSnapshot()];
    } 

    private calculateCasualties(regiment: Regiment, regimentInAttackingArmy: boolean): Casualties{
        const [regimentArmy, targetArmy] = regimentInAttackingArmy ? [this.attacker, this.defender] : [this.defender, this.attacker];
        const casualties: Casualties = {strength: 0, morale: 0};
        const armyPips = this.armyPips(regimentInAttackingArmy);
        if (regiment.targetIndex !== undefined) {
            const target = targetArmy.atFront(regiment.targetIndex)
            if (target === undefined) {
                throw Error("Regiment target cannot be set to an empty space.")
            }
            const strengthPips = armyPips + regiment.getStrengthOffencePips(this.isFirePhase) - target.getStrengthDefencePips(this.isFirePhase);
            const moralePips = armyPips + regiment.getMoraleOffencePips(this.isFirePhase) - target.getMoraleDefencePips(this.isFirePhase);
            const commonMults = this.roundMultiplier * (regiment.strength / Regiment.MAX_STRENGTH) / targetArmy.tactics;
            let hordeTerrainMultiplier = regimentArmy.techGroup === TechGroups.NOMADIC ? this.terrain.hordeTerrainModifier : 1;
            const strengthMults = commonMults * regimentArmy.strengthMultipliers(regiment.type, this.isFirePhase) * targetArmy.phaseDefenseMultiplier(this.isFirePhase) * hordeTerrainMultiplier;
            const moraleMults = commonMults * regimentArmy.moraleMultipliers(regiment.type, this.isFirePhase) * targetArmy.moraleDefenseMultiplier();
            
            casualties.strength = Math.floor((15 + 5 * strengthPips) * strengthMults);
            casualties.morale = (15 + 5 * moralePips) * moraleMults;
        }
        return casualties;
    } 
    
    private fightCurrentDay(): void {  
        const emptyCasualties = {strength: 0, morale: 0};
        const attackerCasualties: Casualties[] = Array(this.width).fill(undefined).map(_ => ({...emptyCasualties}));
        const defenderCasualties: Casualties[] = Array(this.width).fill(undefined).map(_ => ({...emptyCasualties}));
        const argCombos = [
            {front: true, isAttacker: true, targetArray: defenderCasualties},
            {front: false, isAttacker: true, targetArray: defenderCasualties},
            {front: true, isAttacker: false, targetArray: attackerCasualties}, 
            {front: false, isAttacker: false, targetArray: attackerCasualties}
        ];
        for (let i = 0; i < this.width; i++) {
            for (const args of argCombos) {
                const army = args.isAttacker ? this.attacker : this.defender;
                const regiment = args.front ? army.atFront(i) : army.atBack(i);
                if (regiment?.targetIndex !== undefined) {
                    const {strength, morale} = this.calculateCasualties(regiment, args.isAttacker);
                    const rowMultiplier = args.front ? 1 : 0.5;

                    args.targetArray[regiment.targetIndex].strength += Math.floor(strength * rowMultiplier);
                    args.targetArray[regiment.targetIndex].morale += morale * rowMultiplier;
                }
            }
        }

        this.attacker.applyCasualtiesAndMoraleDamage(attackerCasualties, 0.01 * this.defender.morale);
        this.defender.applyCasualtiesAndMoraleDamage(defenderCasualties, 0.01 * this.attacker.morale);
    }

    run(): void {
        this.attacker.deploy(this.width, this.defender.numInfantryAndCavalry());
        this.defender.deploy(this.width, this.attacker.numInfantryAndCavalry());
        let setTargets = true;
        this.addDailyResult();
        while (!this.attacker.isBroken() && !this.defender.isBroken() && this.day < Combat.LOOP_LIMIT) {
            setTargets = this.runNextDay(setTargets);
        }
    }

    private runNextDay(setTargets: boolean): boolean {
        this.day++;
        this.attacker.roll = 5;
        this.defender.roll = 5;

        if (setTargets) {
            this.attacker.setTargets(this.defender);
            this.defender.setTargets(this.attacker);
        }
        this.fightCurrentDay();
        this.addDailyResult();
        const isAttackerUpdated = this.attacker.replaceRegiments();
        const isDefenderUpdated = this.defender.replaceRegiments();
        return (isDefenderUpdated || isAttackerUpdated)
    }

    get dailyResults(): [ArmySnapshot, ArmySnapshot][] {
        return this._results.slice();
    }

    private get roundMultiplier(): number {
        return 1 + this.day / 100;
    }

    private get isFirePhase(): boolean {
        return (this.day - 1) % 6 < 3;
    }

    private armyPips(forAttacker: boolean): number {
        const army = forAttacker ? this.attacker : this.defender;
        const key: keyof Leader = this.isFirePhase ? "fire" : "shock";
        const difference = (this.attacker.leader[key] - this.defender.leader[key]) * (forAttacker ? 1 : -1);
        const leaderPips = Math.max(0, difference);
        const useTerrainPenalty = forAttacker && this.attacker.leader.maneuver <= this.defender.leader.maneuver;
        return leaderPips + army.roll + (useTerrainPenalty ? this.terrain.attackerPenalty : 0);
    }
}