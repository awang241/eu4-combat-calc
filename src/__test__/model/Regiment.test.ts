import Regiment from "../../model/Regiment";
import { RegimentTypes } from "../../enum/RegimentTypes";
import Pips from "../../types/Pips";
import Unit from "../../types/Unit";
import { blankUnit } from "../../types/Unit";

const MAX_MORALE = 3;

describe("flankingRange", () => {
    describe.each([
        [RegimentTypes.INFANTRY, 1],
        [RegimentTypes.CAVALRY, 2],
        [RegimentTypes.ARTILLERY, 2],
    ])("without any bonus returns base flanking ranges correctly",(type, expected) => {
        const regiment = new Regiment(MAX_MORALE, blankUnit(type));
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
        const regiment = new Regiment(MAX_MORALE, blankUnit(RegimentTypes.CAVALRY));
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
        const dummyUnit: Unit = blankUnit(RegimentTypes.CAVALRY);
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
    beforeEach(() => regiment = new Regiment(MAX_MORALE, blankUnit()))
    test(`with ${strength} men and ${morale} morale returns ${expected}`, () => {
        regiment.takeMoraleDamage(MAX_MORALE - morale);
        regiment.takeCasualties(Regiment.MAX_STRENGTH - strength);
        expect(regiment.isBroken()).toBe(expected);
    });
})

test("unmodifiableCopy return value throws an error when assigning a property", () => {
    const original = new Regiment(3, blankUnit());
    const copy = original.unmodifiableCopy();
    const illegalSet = () => copy.takeCasualties(123);
    expect(illegalSet).toThrowError();
})

//Pips getters
describe("Given pips with values {1, 2, 4, 8, 16, 32}", () => {
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
        regiment = new Regiment(MAX_MORALE, {...blankUnit(), pips: pips})
    });
    describe("when isFire is true", () => {
        const isFire = true;
        test(`getStrengthOffencePips returns fire offence pips`, () => {
            expect(regiment.getStrengthOffencePips(isFire)).toBe(pips.fireOffence)
        });
        test(`getStrengthDefencePips returns fire defence pips`, () => {
            expect(regiment.getStrengthDefencePips(true)).toBe(pips.fireDefence)
        });
        test(`getMoraleOffencePips returns fire offence plus morale offence`, () => {
            expect(regiment.getMoraleOffencePips(true)).toBe(pips.moraleOffence + pips.fireOffence)
        });
        test(`getMoraleDefencePips returns fire defence plus morale defence`, () => {
            expect(regiment.getMoraleDefencePips(true)).toBe(pips.moraleDefence + pips.fireDefence)
        });
    });
    describe("when isFire is false", () => {
        const isFire = false;
        test(`getStrengthOffencePips returns shock offence pips`, () => {
            expect(regiment.getStrengthOffencePips(isFire)).toBe(pips.shockOffence)
        });
        test(`getStrengthDefencePips returns shock defence pips`, () => {
            expect(regiment.getStrengthDefencePips(isFire)).toBe(pips.shockDefence)
        });
        test(`getMoraleOffencePips returns shock offence plus morale offence`, () => {
            expect(regiment.getMoraleOffencePips(isFire)).toBe(pips.moraleOffence + pips.shockOffence)
        });
        test(`getMoraleDefencePips returns shock defence plus morale defence`, () => {
            expect(regiment.getMoraleDefencePips(isFire)).toBe(pips.moraleDefence + pips.shockDefence)
        });
    })
})