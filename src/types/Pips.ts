const BLANK_PIPS: Pips = {
    fireOffence: 0,
    fireDefence: 0,
    shockOffence: 0,
    shockDefence: 0,
    moraleOffence: 0,
    moraleDefence: 0
} as const

export type Pips = {
    fireOffence: number,
    fireDefence: number,
    shockOffence: number,
    shockDefence: number,
    moraleDefence: number,
    moraleOffence: number,
}

export function blankPips(): Pips {return BLANK_PIPS};
export default Pips