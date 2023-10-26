import Regiment, { RegimentTypes } from "../../model/Regiment";
import Pips, { blankPips } from "../../types/Pips";
import TechGroup from "../../types/TechGroup";
import Unit from "../../types/Unit";

const DUMMY_INFANTRY: Unit = {
    name: "", 
    type: RegimentTypes.INFANTRY,
    techGroup: TechGroup.NONE,
    techLevel: 0,
    pips: blankPips()
} as const;
const MAX_MORALE = 3;

describe("flankingRange", () => {
    describe.each([
        [RegimentTypes.INFANTRY, 1],
        [RegimentTypes.CAVALRY, 2],
        [RegimentTypes.ARTILLERY, 2],
    ])("without any bonus returns base flanking ranges correctly",(type, expected) => {
        const regiment = new Regiment(MAX_MORALE, {...DUMMY_INFANTRY, type: type})
        test(`when regiment type is ${type}, returns ${expected}`, () => {
            expect(regiment.flankingRange()).toBeCloseTo(expected, 8)
        });
    });

    describe.each([
        [-0.1, 1],
        [0, 2],
        [49.9, 2],
        [50, 3],
        [99.9, 3],
        [100, 4],
    ])("bonus is applied correctly", (bonusPercent, expected) => {
        const regiment = new Regiment(MAX_MORALE, {...DUMMY_INFANTRY, type: RegimentTypes.CAVALRY})
        test(`with a cavalry regiment and ${bonusPercent}% bonus range, returns ${expected}`, () => {
            expect(regiment.flankingRange(bonusPercent)).toBeCloseTo(expected, 8)
        });
    });

    describe.each([
        {strength: 750, bonusPercent: 0, expected: 2},
        {strength: 749, bonusPercent: 0, expected: 1},
        {strength: 749, bonusPercent: 24, expected: 1},
        {strength: 749, bonusPercent: 25, expected: 2},
    
        {strength: 500, bonusPercent: 25, expected: 2},
        {strength: 499, bonusPercent: 25, expected: 1},
        {strength: 499, bonusPercent: 49, expected: 1},
        {strength: 499, bonusPercent: 50, expected: 2},
    
        {strength: 250, bonusPercent: 50, expected: 2},
        {strength: 249, bonusPercent: 50, expected: 1},
        {strength: 249, bonusPercent: 74, expected: 1},
        {strength: 249, bonusPercent: 75, expected: 2},
    ])("strength penalties are applied correctly", ({strength, bonusPercent, expected}) => {
        const dummyUnit: Unit = {
            name: "", 
            type: RegimentTypes.CAVALRY,
            techGroup: TechGroup.NONE,
            techLevel: 0,
            pips: blankPips()
        };
        test(`Cavalry with strength of ${strength} and ${bonusPercent}% bonus range returns ${expected}`, () => {
            const cav = new Regiment(0, dummyUnit);
            cav.takeCasualties(Regiment.MAX_STRENGTH - strength)
            expect(cav.flankingRange(bonusPercent)).toBeCloseTo(expected, 10);
        });
    })  
})


describe.each([
    {strength: Regiment.MAX_STRENGTH, morale: MAX_MORALE, expected: false},
    {strength: 1, morale: 0.001, expected: false},
    {strength: 1, morale: 0, expected: true},
    {strength: 0, morale: 0.001, expected: true},
    {strength: 0, morale: 0, expected: true},
])("isBroken", ({strength, morale, expected}) => {
    let regiment: Regiment;
    beforeEach(() => regiment = new Regiment(MAX_MORALE, DUMMY_INFANTRY))
    test(`with ${strength} men and ${morale} morale returns ${expected}`, () => {
        regiment.takeMoraleDamage(MAX_MORALE - morale);
        regiment.takeCasualties(Regiment.MAX_STRENGTH - strength);
        expect(regiment.isBroken()).toBe(expected);
    });
})

describe.each([
    [-1, 0],
    [0, 0],
    [1000, 1000],
    [1001, 1000],
    [500.9123, 500],   
])("Setting strength", (newVal, expected) => {
    let regiment: Regiment;
    beforeEach(() => regiment = new Regiment(MAX_MORALE, DUMMY_INFANTRY))
    test(`with value ${newVal} sets strength to ${expected}`, () => {
        regiment.strength = newVal;
        expect(regiment.strength).toBe(expected);
    });
})

describe.each([
    [-0.001, 0],
    [0, 0],
    [MAX_MORALE, MAX_MORALE],
    [MAX_MORALE + 0.001, MAX_MORALE],
])("Setting currentMorale", (newVal, expected) => {
    let regiment: Regiment;
    beforeEach(() => regiment = new Regiment(MAX_MORALE, DUMMY_INFANTRY))
    test(`with value ${newVal} sets morale to ${expected}`, () => {
        regiment.currentMorale = newVal;
        expect(regiment.currentMorale).toBe(expected);
    });
})

test("Regiment created by unmodifiableCopy throws an error when assigning a property", () => {
    const original = new Regiment(3, DUMMY_INFANTRY);
    const copy = original.unmodifiableCopy();
    const illegalSet = () => copy.currentMorale = 1.5;
    expect(illegalSet).toThrowError();
})

describe("Pips getters with pips with values {1, 2, 4, 8, 16, 32}", () => {
    let regiment: Regiment;
    const pips: Pips = {
        fireOffence: 1,
        fireDefence: 2,
        shockOffence: 4,
        shockDefence: 8,
        moraleOffence: 16,
        moraleDefence: 32,
    }
    beforeEach(() => {
        regiment = new Regiment(MAX_MORALE, {...DUMMY_INFANTRY, pips: pips})
    });
    test(`getStrengthOffencePips when isFire is true returns ${pips.fireOffence}`, () => {
        expect(regiment.getStrengthOffencePips(true)).toBe(pips.fireOffence)
    });
    test(`getStrengthOffencePips when isFire is false returns ${pips.shockOffence}`, () => {
        expect(regiment.getStrengthOffencePips(false)).toBe(pips.shockOffence)
    });
    test(`getStrengthDefencePips when isFire is true returns ${pips.fireDefence}`, () => {
        expect(regiment.getStrengthDefencePips(true)).toBe(pips.fireDefence)
    });
    test(`getStrengthDefencePips when isFire is false returns ${pips.shockDefence}`, () => {
        expect(regiment.getStrengthDefencePips(false)).toBe(pips.shockDefence)
    });
    test(`getMoraleOffencePips when isFire is true returns ${pips.moraleOffence + pips.fireOffence}`, () => {
        expect(regiment.getMoraleOffencePips(true)).toBe(pips.moraleOffence + pips.fireOffence)
    });
    test(`getMoraleOffencePips when isFire is false returns ${pips.moraleOffence + pips.shockOffence}`, () => {
        expect(regiment.getMoraleOffencePips(false)).toBe(pips.moraleOffence + pips.shockOffence)
    });
    test(`getMoraleDefencePips when isFire is true returns ${pips.moraleDefence + pips.fireDefence}`, () => {
        expect(regiment.getMoraleDefencePips(true)).toBe(pips.moraleDefence + pips.fireDefence)
    });
    test(`getMoraleDefencePips when isFire is false returns ${pips.moraleDefence + pips.shockDefence}`, () => {
        expect(regiment.getMoraleDefencePips(false)).toBe(pips.moraleDefence + pips.shockDefence)
    });
})