import { Enum, EnumValue } from "ts-enums";

export class Terrain extends EnumValue {
    constructor(name: string, private _attackerPenalty: number, private _isFlat:boolean) {
        super(name);
    }

    get isFlat(): boolean {
        return this._isFlat;
    }

    get attackerPenalty(): number {
        return this._attackerPenalty;
    }
}

export class TerrainEnumType extends Enum<Terrain> {
    GRASSLANDS: Terrain = new Terrain("Grasslands", 0, true);
    FARMLANDS: Terrain = new Terrain("Farmlands", 0, true);
    DRYLANDS: Terrain = new Terrain("Drylands", 0, true);
    DESERT: Terrain = new Terrain("Desert", 0, true);
    COASTAL_DESERT: Terrain = new Terrain("Coastal Desert", 0, true);
    COASTLINE: Terrain = new Terrain("Coastline", 0, false);
    SAVANNAH: Terrain = new Terrain("Savannah", 0, true);
    STEPPES: Terrain = new Terrain("Steppes", 0, true);
    WOODS: Terrain = new Terrain("Woods", -1, false);
    FOREST: Terrain = new Terrain("Forest", -1, false);
    HIGHLANDS: Terrain = new Terrain("Highlands", -1, false);
    HILLS: Terrain = new Terrain("Hills", -1, false);
    JUNGLE: Terrain = new Terrain("Jungle", -1, false);
    MARSH: Terrain = new Terrain("Marsh", -1, false);
    GLACIAL: Terrain = new Terrain("Glacial", -1, false);
    MOUNTAINS: Terrain = new Terrain("Mountains", -2, false);

    constructor() {
        super();
        this.initEnum('Terrain')
    }
}

const Terrains = Object.freeze(new TerrainEnumType());
export default Terrains;