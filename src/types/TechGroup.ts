enum TechGroup {
    WESTERN = "western",
    EASTERN = "eastern",
    ANATOLIAN = "anatolian",
    MUSLIM = "muslim",
    NOMADIC = "nomadic",
    AFRICAN = "african",
    CHINESE = "chinese",
    INDIAN = "indian",
    NORTH_AMERICAN = "northAmerican",
    MESOAMERICAN = "mesoamerican",
    SOUTH_AMERICAN = "southAmerican",
    ABORIGINAL = "aboriginal",
    POLYNESIAN = "polynesian",
    HIGH_AMERICAN = "highAmerican",
    NONE = "none"
}
export default TechGroup;

export function isTechGroup(group: string) {
    return Object.values(TechGroup).includes(group as TechGroup);
}

export function startTech(group: TechGroup): number {
    const startTech1 = [
        TechGroup.MESOAMERICAN,
        TechGroup.NORTH_AMERICAN,
        TechGroup.SOUTH_AMERICAN,
        TechGroup.ABORIGINAL
    ];
    if ([TechGroup.AFRICAN, TechGroup.POLYNESIAN].includes(group)) {
        return 2;
    } else if (startTech1.includes(group)){
        return 1;
    } else {
        return 3;
    }
}

export function getTechGroupName(group: TechGroup | string): string{
    const name = group as TechGroup
    if (name === TechGroup.WESTERN) 
        return "Western";
    else if (name === TechGroup.EASTERN) 
        return "Eastern";
    else if (name === TechGroup.ANATOLIAN) 
        return "Anatolian";
    else if (name === TechGroup.MUSLIM) 
        return "Muslim";
    else if (name === TechGroup.NOMADIC) 
        return "Nomadic";
    else if (name === TechGroup.AFRICAN) 
        return "East/West/Central African";
    else if (name === TechGroup.CHINESE) 
        return "Chinese";
    else if (name === TechGroup.INDIAN) 
        return "Indian";
    else if (name === TechGroup.NORTH_AMERICAN) 
        return "North American";
    else if (name === TechGroup.MESOAMERICAN) 
        return "Mesoamerican";
    else if (name === TechGroup.SOUTH_AMERICAN) 
        return "Andean/South American";
    else if (name === TechGroup.ABORIGINAL) 
        return "Aboriginal";
    else if (name === TechGroup.POLYNESIAN) 
        return "Polynesian";
    else if (name === TechGroup.HIGH_AMERICAN) 
        return "High American";
    else return "";
}
