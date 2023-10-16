const BLANK_PIPS: Pips = Object.freeze({
    fireOffence: 0,
    fireDefence: 0,
    shockOffence: 0,
    shockDefence: 0,
    moraleOffence: 0,
    moraleDefence: 0
})

export type Pips = {
    fireOffence: number,
    fireDefence: number,
    shockOffence: number,
    shockDefence: number,
    moraleDefence: number,
    moraleOffence: number,
}

export function getDefencePips(pips: Pips, isFirePhase: boolean): number {
    return isFirePhase ? pips.fireDefence: pips.shockDefence;
}

export function getOffencePips(pips: Pips, isFirePhase: boolean): number {
    return isFirePhase ? pips.fireOffence: pips.shockOffence;
}

export function blankPips(): Pips {
    return BLANK_PIPS;
}

export default Pips