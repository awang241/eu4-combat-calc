import { toMultiplier } from "./DamageModifiers";
import Pips from "../types/Pips";
import Unit from "../types/Unit";
import UnitTypes, { UnitType } from "../enum/UnitTypes";

export default class Regiment{
  static id = 0;
  static readonly MAX_STRENGTH = 1000;
  private _id: number;
  private _maxMorale: number;
  private _currentMorale: number;
  private _strength: number;
  private _targetIndex?: number;
  private _unit: Unit;

  constructor(morale: number, unit: Unit) {
    Regiment.id++;
    this._id = Regiment.id;
    this._maxMorale = morale;
    this._currentMorale = morale;
    this._strength = Regiment.MAX_STRENGTH;
    this._targetIndex = undefined;
    this._unit = unit;
  }

  public flankingRange(bonusPercent?: number): number {
    const baseRange = this.type === UnitTypes.INFANTRY ? 1 : 2; 
    let strengthPenaltyPercent = 0;
    if (this.strength < 250) {
      strengthPenaltyPercent = -75;
    } else if (this.strength <  500) {
      strengthPenaltyPercent = -50;
    } else if (this.strength <  750){
      strengthPenaltyPercent = -25;
    }
    const range = Math.floor(baseRange * toMultiplier((bonusPercent ?? 0) + strengthPenaltyPercent));
    return Math.max(1, range);
  }

  private getOffencePips(isFire: boolean, isMorale: boolean): number {
    const phasePips = isFire ? this.unit.pips.fireOffence : this.unit.pips.shockOffence;
    return isMorale ? phasePips + this.unit.pips.moraleOffence : phasePips
  }

  private getDefencePips(isFire: boolean, isMorale: boolean): number {
    const phasePips =  isFire ? this.unit.pips.fireDefence : this.unit.pips.shockDefence;
    return isMorale ? phasePips + this.unit.pips.moraleDefence : phasePips
  }

  getStrengthOffencePips(isFire: boolean) {
    return this.getOffencePips(isFire, false);
  }

  getStrengthDefencePips(isFire: boolean) {
    return this.getDefencePips(isFire, false);
  }

  getMoraleOffencePips(isFire: boolean) {
    return this.getOffencePips(isFire, true);
  }

  getMoraleDefencePips(isFire: boolean) {
    return this.getDefencePips(isFire, true);
  }

  /**
     * Returns true if morale or strength are at 0, otherwise returns true.
     * @returns {boolean} true if morale or strength are at 0, otherwise returns true.
     */
  isBroken(): boolean {
    return this.currentMorale <= 0 || this.strength <= 0;
  }

  /**
   * Subtracts the given number of casualties from this regiment's strength. If the casualties are
   * greater than the regiment's current strength, strength is set to 0 instead.
   * @param casualties The number of casualties to be inflicted on this regiment.
   */
  takeCasualties(casualties: number) {
    const totalCasualties = casualties * (this.type === "artillery" ? 2 : 1)
    const rounded = Math.floor(totalCasualties);
    this._strength = this._strength > rounded ? this._strength - rounded: 0;
  }

    /**
   * Subtracts the given morale damage from this regiment's morale. If the damage is
   * greater than the regiment's current morale, morale is set to 0 instead.
   * @param damage The amount of morale damage to be inflicted on this regiment.
   */
  takeMoraleDamage(damage: number) {
    this._currentMorale = this.currentMorale > damage ? this.currentMorale - damage: 0;
  }

  /**
   * Creates a unmodifiable copy of this regiment as of 
   * @returns an unmodifiable copy of this 
   */
  unmodifiableCopy(): Regiment {
    const copy = new Regiment(this.maxMorale, this._unit);
    Object.assign(copy, this);
    Object.freeze(copy);
    return copy;
  }


  public get currentMorale(): number {return this._currentMorale;}

  public get id(): number {return this._id;}

  public get maxMorale(): number {return this._maxMorale;}

  public get pips(): Pips {return this._unit.pips;}

  public get strength(): number {return this._strength;}

  public get targetIndex(): number | undefined {return this._targetIndex;} 
  public set targetIndex(value: number | undefined) {this._targetIndex = value;} 

  public get type(): UnitType {return this._unit.type}
  
  public get unit(): Unit {return this._unit}
}  