import Pips from "./data/Pips";

export enum RegimentTypes {
  INFANTRY, CAVALRY, ARTILLERY,
}

export default class Regiment{
  static id = 0;
  static readonly MAX_STRENGTH = 1000;
  private _maxMorale: number;
  private _currentMorale: number;
  private _strength: number;
  private _targetIndex?: number;
  private _target?: Regiment;
  private _flankingRange: number;
  private _pips: Pips;
  private _type: RegimentTypes;


  constructor(morale: number, type?: RegimentTypes) {
    Regiment.id++;
    this._maxMorale = morale;
    this._currentMorale = morale;
    this._strength = Regiment.MAX_STRENGTH;
    this._targetIndex = undefined;
    this._flankingRange = 1;
    this._type = type ?? RegimentTypes.INFANTRY;
    if (this._type === RegimentTypes.INFANTRY) {
      this._pips = new Pips(0, 0, 0, 0, 1, 1);
    } else {
      this._pips = new Pips(0, 0, 1, 0, 1, 1);
    }
    Object.freeze(this._pips);
  }
  
  /**
   * Subtracts the given number of casualties from this regiment's strength. If the casualties are
   * greater than the regiment's current strength, strength is set to 0 instead.
   * @param casualties The number of casualties to be inflicted on this regiment.
   */
  takeCasualties(casualties: number) {
    this._strength = this._strength > casualties ? this._strength - casualties: 0;
  }

    /**
   * Subtracts the given morale damage from this regiment's morale. If the damage is
   * greater than the regiment's current morale, morale is set to 0 instead.
   * @param damage The amount of morale damage to be inflicted on this regiment.
   */
  takeMoraleDamage(damage: number) {
    this.currentMorale = this.currentMorale > damage ? this.currentMorale - damage: 0;
  }

  /**
   * Creates a unmodifiable copy of this regiment as of 
   * @returns an unmodifiable copy of this 
   */
  public unmodifiableCopy(): Regiment {
    const copy = new Regiment(this.maxMorale);
    Object.assign(copy, this);
    Object.freeze(copy);
    return copy;
  }

  public setTarget(target: Regiment | undefined, index: number | undefined) {
    if ((target === undefined && index !== undefined) || (target !== undefined && index === undefined)) {
      throw new Error("A valid target cannot be set without an index or vice versa.")
    }
    this._target = target;
    this._targetIndex = index;
  }

  public get currentMorale(): number {return this._currentMorale;}
  public set currentMorale(value: number) {this._currentMorale = Math.max(Math.min(this._maxMorale, value), 0)}

  public flankingRange(): number {
    return Regiment.flankingRange(this.type);
  }

  public static flankingRange(type: RegimentTypes) {
    return type === RegimentTypes.INFANTRY ? 1 : 2; 
  }

  public get maxMorale(): number {return this._maxMorale;}

  public get pips(): Pips {return this._pips;}

  public get strength(): number {return this._strength;}
  public set strength(value: number) {this._strength = Math.max(Math.min(this._maxMorale, value), 0)}

  public get target(): Regiment | undefined {return this._target;}
  public get targetIndex(): number | undefined {return this._targetIndex;} 

  public get type(): RegimentTypes {return this._type}
}  