import { Modifier } from "../enum/Modifiers";
import UnitTypes, { UnitType } from "../enum/UnitTypes";
import { DamageTable } from "../types/DamageTable";
import { Phase } from "../types/Phase";
import { Tech } from "../types/Tech";

type DamageTypes = Phase | "morale";

const MORALE_DIVISOR = 540
class ArmyModifiers {
    private _morale: number = 2.5;
    private _discipline: number = 1;
    private _tactics: number = 0.5;
    private strengthMultipliers: DamageTable;
    

    constructor(tech: Tech, percentModifiers: Partial<Record<Modifier, number>>) {
        const moraleMultiplier = this.morale / MORALE_DIVISOR;
    }

    get discipline(): number {return this._discipline};
    get morale(): number {return this._morale};
    get tactics(): number {return this._tactics};

}

