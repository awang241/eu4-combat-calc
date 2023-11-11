import { Enum, EnumValue } from "ts-enums";

export class TechGroup extends EnumValue {
    constructor(name: string, private _startingTech: number = 3) {
        super(name);
    }
    get startingTech(): number {return this._startingTech}
}

class TechGroupEnumType extends Enum<TechGroup> {
    WESTERN: TechGroup = new TechGroup("Western", 3);
    EASTERN: TechGroup = new TechGroup("Eastern", 3);
    ANATOLIAN: TechGroup = new TechGroup("Anatolian", 3);
    MUSLIM: TechGroup = new TechGroup("Muslim", 3);
    NOMADIC: TechGroup = new TechGroup("Nomadic", 3);
    AFRICAN: TechGroup = new TechGroup("East/West/Central African", 2);
    CHINESE: TechGroup = new TechGroup("Chinese", 3);
    INDIAN: TechGroup = new TechGroup("Indian", 3);
    NORTH_AMERICAN: TechGroup = new TechGroup("North American", 1);
    MESOAMERICAN: TechGroup = new TechGroup("Mesoamerican", 1);
    SOUTH_AMERICAN: TechGroup = new TechGroup("Andean/South American", 1);
    ABORIGINAL: TechGroup = new TechGroup("Aboriginal", 1);
    POLYNESIAN: TechGroup = new TechGroup("Polynesian", 2);
    HIGH_AMERICAN: TechGroup = new TechGroup("High American", 3);

    constructor() {
        super();
        this.initEnum('TechGroup')
    }
}

const TechGroups = Object.freeze(new TechGroupEnumType());
export default TechGroups