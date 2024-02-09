import { Enum, EnumValue } from "ts-enums";
import coastalDesertImage from "../assets/terrain/coastal_desert.png";
import coastlineImage from "../assets/terrain/coastline.png";
import desertImage from "../assets/terrain/desert.png";
import drylandsImage from "../assets/terrain/drylands.png";
import farmlandsImage from "../assets/terrain/farmlands.png";
import forestImage from "../assets/terrain/forest.png";
import glacialImage from "../assets/terrain/glacial.png";
import grasslandsImage from "../assets/terrain/grasslands.png";
import highlandsImage from "../assets/terrain/highlands.png";
import hillsImage from "../assets/terrain/hills.png";
import jungleImage from "../assets/terrain/jungle.png";
import marshImage from "../assets/terrain/marsh.png";
import mountainsImage from "../assets/terrain/mountains.png";
import savannahImage from "../assets/terrain/savannah.png";
import steppeImage from "../assets/terrain/steppe.png";
import woodsImage from "../assets/terrain/woods.png";




export class Terrain extends EnumValue {
    constructor(name: string, private _attackerPenalty: number, private _isFlat:boolean, private _imageString: string) {
        super(name);
    }

    get hordeTerrainModifier() {
        return this._isFlat ? 1.25 : 0.75;
    }

    get attackerPenalty(): number {
        return this._attackerPenalty;
    }

    get imageString(): string {
        return this._imageString;
    }
}

export class TerrainEnumType extends Enum<Terrain> {
    GRASSLANDS: Terrain = new Terrain("Grasslands", 0, true, grasslandsImage);
    FARMLANDS: Terrain = new Terrain("Farmlands", 0, true, farmlandsImage);
    DRYLANDS: Terrain = new Terrain("Drylands", 0, true, drylandsImage);
    DESERT: Terrain = new Terrain("Desert", 0, true, desertImage);
    COASTAL_DESERT: Terrain = new Terrain("Coastal Desert", 0, true, coastalDesertImage);
    COASTLINE: Terrain = new Terrain("Coastline", 0, false, coastlineImage);
    SAVANNAH: Terrain = new Terrain("Savannah", 0, true, savannahImage);
    STEPPES: Terrain = new Terrain("Steppes", 0, true, steppeImage);
    WOODS: Terrain = new Terrain("Woods", -1, false, woodsImage);
    FOREST: Terrain = new Terrain("Forest", -1, false, forestImage);
    HIGHLANDS: Terrain = new Terrain("Highlands", -1, false, highlandsImage);
    HILLS: Terrain = new Terrain("Hills", -1, false, hillsImage);
    JUNGLE: Terrain = new Terrain("Jungle", -1, false, jungleImage);
    MARSH: Terrain = new Terrain("Marsh", -1, false, marshImage);
    GLACIAL: Terrain = new Terrain("Glacial", -1, false, glacialImage);
    MOUNTAINS: Terrain = new Terrain("Mountains", -2, false, mountainsImage);

    constructor() {
        super();
        this.initEnum('Terrain')
    }
}

const Terrains = Object.freeze(new TerrainEnumType());
export default Terrains;