import { RegimentTypes } from "../../enum/RegimentTypes";
import Regiment from "../../model/Regiment";
import Row from "../../model/Row"
import { DUMMY_INFANTRY } from "../DummyTypes";

jest.mock("../../model/Regiment")
const ROW_WIDTH_NORMAL = 5;
let mockTargetIndexSetter: jest.Mock;

function createMockRegiment(): Regiment {
    return new Regiment(0, DUMMY_INFANTRY);
}

function createRow(positions?: [number, number[]]): Row;
function createRow(positions?: boolean[]): Row;
function createRow(length?: number): Row;
function createRow(arg: number | boolean[] | [number, number[]] = ROW_WIDTH_NORMAL): Row {
    let rowWidth: number;
    let positions: number[] = [];
    if (typeof arg === 'number') {
        rowWidth = (arg);
        positions = [...Array(rowWidth).keys()];
    } else if (arg.length === 0 || typeof arg[0] === 'boolean'){
        rowWidth = arg.length;
        (arg as boolean[]).forEach((val, index) => val ? positions.push(index): undefined);
    } else {
        rowWidth = arg[0] as number;
        positions = arg[1] as number[];
    }
    const row = new Row(rowWidth);
    positions.forEach(value => row.set(value, createMockRegiment()));
    return row;
}

function expectMethodDoesNothingAndReturnsEmpty(row: Row, method: () => boolean): void
function expectMethodDoesNothingAndReturnsEmpty(row: Row, method: () => unknown[]): void
function expectMethodDoesNothingAndReturnsEmpty(row: Row, method: () => boolean | unknown[]): void {
    const expectedState = row.slice();
    const boundMethod = method.bind(row);

    const returnVal = boundMethod();

    const expectedReturn = typeof returnVal === "boolean" ? false: [] as unknown[];
    expect(returnVal).toBe(expectedReturn);
    expect(row.slice()).toEqual(expectedState);
}

beforeAll(() => {
    mockTargetIndexSetter = jest.fn((value: number | undefined) => {})
    Object.defineProperty(Regiment.prototype, "targetIndex", {
        get: () => undefined,
        set: mockTargetIndexSetter,
        configurable: true,
    })
})

afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
})  

describe("addRegiments", () => {
    describe("on an empty row of width 7 adds regiments correctly and returns them", () => {
        const ROW_WIDTH = 7;
        const INDEX_ORDER = [3, 4, 2, 5, 1, 6, 0];
        test.each([
            {sourceLen: 0, max: undefined, expectedAdded: 0},
            {sourceLen: 6, max: undefined, expectedAdded: 6},
            {sourceLen: 7, max: undefined, expectedAdded: 7},
            {sourceLen: 8, max: undefined, expectedAdded: 7},

            {sourceLen: 10, max: 0, expectedAdded: 0},
            {sourceLen: 10, max: 6, expectedAdded: 6},
            {sourceLen: 10, max: 7, expectedAdded: 7},
            {sourceLen: 10, max: 8, expectedAdded: 7},

            {sourceLen: 4, max: 7, expectedAdded: 4},
        ])("when source has $sourceLen regiments and max is $max", ({sourceLen, max, expectedAdded}) => {
            const row = new Row(ROW_WIDTH);
            const source = Array(sourceLen).fill(undefined).map(createMockRegiment);
            const expectedFilledIndices = INDEX_ORDER.slice(0, expectedAdded);
            const expectedEmptyIndices = INDEX_ORDER.slice(expectedAdded);

            const returnVal = row.addRegiments(source, max);

            expect(returnVal.length).toBe(expectedAdded);
            expect(source).toEqual(expect.arrayContaining(returnVal));
            expectedFilledIndices.forEach(index => expect(source).toContain(row.at(index)));
            expectedEmptyIndices.forEach(index => expect(row.at(index)).toBe(undefined));
        })
    })

    describe("on an partially filled row adds regiments correctly and returns them", () => {
        const INDEX_ORDER = [3, 4, 2, 5, 1, 6, 0];
        test.each([
            {startFilled: [2, 4], sourceLen: 3},
            {startFilled: [2, 3], sourceLen: 10},
            {startFilled: [0, 1, 2], sourceLen: 3},
        ])("when there are regiments at indices $startFilled and $sourceLen regiments in source", ({startFilled, sourceLen}) => {
            const row = createRow([INDEX_ORDER.length, startFilled]);
            const source = Array(sourceLen).fill(undefined).map(createMockRegiment);

            const startRowState = row.slice();
            const startEmpty = INDEX_ORDER.filter(index => !startFilled.includes(index));
            const expectedReturnLength = sourceLen > startEmpty.length ? startEmpty.length: sourceLen;
            const expectedFilledIndices = startEmpty.slice(0, expectedReturnLength)
            const expectedUnchanged = startEmpty.slice(expectedReturnLength).concat(startFilled);
            
            const returnVal = row.addRegiments(source);

            expect(returnVal.length).toBe(expectedReturnLength);
            expect(source).toEqual(expect.arrayContaining(returnVal));
            expectedFilledIndices.forEach(index => expect(source).toContain(row.at(index)));
            expectedUnchanged.forEach(index => expect(row.at(index)).toBe(startRowState.at(index)));
        })
    })

    test("on a full row does not change the row and returns an empty array", () => {
        const row = createRow();
        const expectedRowState = row.slice()
        const source = Array(ROW_WIDTH_NORMAL).fill(undefined).map(createMockRegiment);

        const returnVal = row.addRegiments(source);

        expect(returnVal.length).toBe(0);
        expect(row.slice()).toEqual(expectedRowState);
    })
})

describe.each([
    [1, 0],
    [2, 1],
    [3, 1],
    [4, 2]
])("centreIndex", (length, expected) => {
    test(`row of length ${length} has centreIndex of ${expected}`, () => {
        const row = new Row(length);
        expect(row.centreIndex).toBe(expected)
    });
})

test("createSnapshot", () => {
    const row = createRow(ROW_WIDTH_NORMAL);
    const expectedSnapshot = new Array(ROW_WIDTH_NORMAL).fill(undefined).map(createMockRegiment);
    row.slice().forEach((val, index) => jest.spyOn(val as Regiment, "unmodifiableCopy").mockReturnValueOnce(expectedSnapshot[index]));

    const actualSnapshot = row.createSnapshot();
    expect(actualSnapshot).toEqual(expectedSnapshot);
});

describe("moveOutmostRegimentToInmostGap", () => {
    describe("moves the correct regiment to the inmost gap with no other changes and returns true", () => {
        const getExpectedState = (row: Row, gapIndex: number, movedIndex: number): (Regiment | undefined)[] => {
            const expectedRowState = row.slice();
            expectedRowState[gapIndex] = expectedRowState[movedIndex];
            expectedRowState[movedIndex] = undefined;
            return expectedRowState;
        }
        test("for row with gaps at [2, 3] and no targets set", () => {
            const row = createRow([7, [0, 1, 4, 5, 6]]);
            const expectedRowState = getExpectedState(row, 3, 0);
            
            const returnVal = row.moveOutmostRegimentToInmostGap();
            expect(returnVal).toBe(true);
            expect(row.slice()).toEqual(expectedRowState);
        });

        test("for row of width 7 with one regiment at [4] and no targets set", () => {
            const row = createRow([7, [4]]);
            const expectedRowState = getExpectedState(row, 3, 4);
            
            const returnVal = row.moveOutmostRegimentToInmostGap();
            expect(returnVal).toBe(true);
            expect(row.slice()).toEqual(expectedRowState);
        });

        test("for row with gaps at [2, 3] and targets set for regiments at [0, 6]", () => {
            const row = createRow([7, [0, 1, 4, 5, 6]]);
            [0, 6].forEach(val => Object.defineProperty(row.at(val) as Regiment, "targetIndex", {get: () => val}));
            const expectedRowState = getExpectedState(row, 3, 1);
            
            const returnVal = row.moveOutmostRegimentToInmostGap();
            expect(returnVal).toBe(true);
            expect(row.slice()).toEqual(expectedRowState);        
        });
    })

    describe("does not change the row and returns false", () => {
        test("for an empty row", () => {
            const row = new Row(ROW_WIDTH_NORMAL);
            expectMethodDoesNothingAndReturnsEmpty(row, row.moveOutmostRegimentToInmostGap);
        });

        test("for row with no gaps", () => {
            const row = createRow();
            expectMethodDoesNothingAndReturnsEmpty(row, row.moveOutmostRegimentToInmostGap);        
        });

        test("for row with all regiments in centre block and gaps on outside", () => {
            const row = createRow([7, [2, 3, 4]]);
            expectMethodDoesNothingAndReturnsEmpty(row, row.moveOutmostRegimentToInmostGap);        
        });

        test("for row with gap and targets set for all regiments further out than gaps", () => {
            const INDEX_ORDER = [3, 4, 2, 5, 1, 6, 0];
            const gapIndex = 2
            
            const row = createRow(7);
            row.set(gapIndex, undefined);
            const outerIndices = INDEX_ORDER.slice(INDEX_ORDER.indexOf(gapIndex) + 1)
            outerIndices.forEach(val => Object.defineProperty(row.at(val) as Regiment, "targetIndex", {get: () => val}));

            expectMethodDoesNothingAndReturnsEmpty(row, row.moveOutmostRegimentToInmostGap);        
        });
    })
});

describe("setTargets method", () => {
    const width = 5;
    const expectRegimentTargetWasSet = (reg: Regiment | undefined, value: number | undefined) => {
        const mock = mockTargetIndexSetter.mock;
        const callIndex = mock.instances.indexOf(reg); 
        expect(callIndex).not.toBe(-1);
        expect(mock.calls[callIndex]).toEqual([value]);
    }
    describe("for a full row of width 5 and no flanking bonuses", () => {
        test("with an empty enemy front sets each regiment's target to its index", () => {
            const enemyRow = createRow(width);
            const row = createRow(width);
    
            row.setTargets(enemyRow);
    
            row.slice().forEach((reg, index) => expectRegimentTargetWasSet(reg, index));
        });
    
        test("with an empty enemy front sets each regiment's target to undefined", () => {
            const enemyRow = new Row(width);
            const row = createRow(width);
    
            row.setTargets(enemyRow);
    
            row.slice().forEach(reg => expectRegimentTargetWasSet(reg, undefined));
        });

        test("with one enemy regiment in the centre only sets that as target for regiments in range", () => {
            const enemyIndex = 2;
            const flankingRange = 1;
            jest.spyOn(Regiment.prototype, "flankingRange").mockReturnValue(flankingRange);

            const enemyRow = createRow([width, [enemyIndex]]);
            const row = createRow(width);
    
            row.setTargets(enemyRow);
    
            row.slice().forEach((reg, index) => {
                const value = (index <= enemyIndex + flankingRange && index >= enemyIndex - flankingRange) ? enemyIndex : undefined 
                expectRegimentTargetWasSet(reg, value);
            });
        });
    });

    test("given a row of some width and an enemy front of a different width, setTargets throws an error", () => {
        const row = createRow(12);
        const enemyRow = createRow(10);
        
        expect(() => row.setTargets(enemyRow)).toThrow();
    })

    //flanking range parameter logic tests
    describe("given a row with one regiment of each type and an empty enemy row", () => {
        describe.each([
            ["no range arguments", undefined, undefined, "passes 0 as argument to each regiment"],
            ["tech flanking range only", 50, undefined, "passes tech range to each regiment"],
            ["tech and cavalry flanking ranges", 50, 25, "passes total of both ranges to cavalry only, and tech range to other regiments"],
        ])("and %s", (name, techRangeArg, cavRangeArg, testName) => {
            test(`${testName}`, () => {
                const types: RegimentTypes[] = Object.values(RegimentTypes);
                const row = createRow(types.length);
                const techRange = techRangeArg ?? 0;
                const cavRange = cavRangeArg ?? 0;
                row.slice().forEach((reg, index) => Object.defineProperty(reg, "type", {value: types[index]}));
                
                row.setTargets(new Row(types.length), techRange, cavRange);

                const expectedRanges = {
                    [RegimentTypes.INFANTRY]: techRange,
                    [RegimentTypes.CAVALRY]: techRange + cavRange,
                    [RegimentTypes.ARTILLERY]: techRange,
                };
                row.slice().forEach(reg => expect(reg?.flankingRange).toHaveBeenCalledWith(expectedRanges[(reg as Regiment).type]))
            })
        });
    });
    describe("given a row of width 9, one regiment with a flanking range of 2 at index 6", () => {
        let row: Row;
        let regiment: Regiment;
        const regimentIndex = 6
        const width = 9;
        beforeEach(() => {
            row = createRow([width, [regimentIndex]]);
            regiment = row.at(regimentIndex) as Regiment;
            jest.spyOn(regiment, "flankingRange").mockReturnValue(2);
        })
        
        test.each([
            ["two enemies in range", "the closest enemy", regimentIndex - 1, [regimentIndex + 2]],
            ["two equally close enemies in range", "the furthest out enemy", regimentIndex + 2, [regimentIndex - 2], ],
        ])("with %s, setTargets sets %s as the target", (s1, s2, expectedTargetIndex, otherEnemies) => {
            const enemyFront = createRow([width, [expectedTargetIndex, ...otherEnemies]]);

            row.setTargets(enemyFront);

            expectRegimentTargetWasSet(regiment, expectedTargetIndex)
        })
    })
    
    
});


describe("shiftRegiments", () => {
    describe("moves regiments correctly and returns true", () => {
        const ROW_WIDTH = 8
        test.each([
            {filled: [0, 1, 6, 7], expectedMoveIndices: [[1, 3], [6, 4]]},
            {filled: [0, 2, 5, 7], expectedMoveIndices: [[0, 1], [2, 3], [5, 4], [7, 6]]},
            {filled: [0, 1, 2, 3, 7], expectedMoveIndices: [[7, 4]]},
        ])(`for a row of width ${ROW_WIDTH} and regiments at $filled`, ({filled, expectedMoveIndices}) => {
            const row = createRow([ROW_WIDTH, filled]);
            const startState = row.slice();

            const returnVal = row.shiftRegiments();
    
            const [REGIMENT, GAP] = [0, 1];
            expect(returnVal).toBe(true);
            expectedMoveIndices.forEach(indices => {
                expect(row.at(indices[REGIMENT])).toBe(undefined);
                expect(row.at(indices[GAP])).toBe(startState[indices[REGIMENT]]);
            });
        });
    });
    

    describe("does not change the row state and returns false", () => {
        test("for an empty row", () => {
            const row = new Row(ROW_WIDTH_NORMAL);
            expectMethodDoesNothingAndReturnsEmpty(row, row.shiftRegiments);
        })
        
        test("for a full row", () => {
            const row = createRow(ROW_WIDTH_NORMAL);
            expectMethodDoesNothingAndReturnsEmpty(row, row.shiftRegiments);
        })

        test("for a row with all regiments in centre block and gaps on sides", () => {
            const row = createRow([10, [3, 4, 5, 6]]);
            expectMethodDoesNothingAndReturnsEmpty(row, row.shiftRegiments);
        })

        test("for a row with left half full and right half empty", () => {
            const row = createRow([10, [0, 1, 2, 3, 4]]);
            expectMethodDoesNothingAndReturnsEmpty(row, row.shiftRegiments);
        })
    });
})


describe("regimentsByCentreDistance", () => {
    test.each([
        [15, false],
        [2, false],
        [3, true],
        [3, undefined],
    ])(`from Row of length %d and reversed is %s returns in the correct order`, (length, reversed) => {
        const row = new Row(length);
        const adjustedCentre = row.length - 1;
        const byCentreDistance = row.regimentsByCentreDistance(reversed);
        byCentreDistance.slice(0, -1).forEach((value, index) => {
            const nextRowIndex = byCentreDistance[index + 1].rowIndex;
            const currDistance = Math.abs(adjustedCentre - 2 * value.rowIndex);
            const nextDistance = Math.abs(adjustedCentre - 2 * nextRowIndex);
            const difference = currDistance - nextDistance;
            const currMoreOutwardThanNext = difference !== 0 ? currDistance > nextDistance : value.rowIndex < nextRowIndex;
            expect(currMoreOutwardThanNext).toBe((reversed ?? false));
        });
    });
})

describe("removeBrokenRegiments", () => {  
    beforeEach(() => {
        jest.spyOn(Regiment.prototype, "isBroken").mockReturnValue(false);
    });

    test("with no broken regiments removes nothing and returns false", () => {
        const row = createRow(ROW_WIDTH_NORMAL);
        const expectedRegiments = row.slice();

        const returnVal = row.removeBrokenRegiments();

        expect(row.slice()).toEqual(expectedRegiments);
        expect(returnVal).toBe(false);

    });

    test("with broken regiments at index 1 and 4 removes those and returns true", () => {
        const  row: Row = createRow(ROW_WIDTH_NORMAL);
        const expectedRowState = row.slice();
        [1, 4].forEach(rowIndex => {
            jest.spyOn(row.at(rowIndex) as Regiment, "isBroken").mockReturnValue(true);
            expectedRowState[rowIndex] = undefined;
        });

        const returnVal = row.removeBrokenRegiments();

        expect(row.slice()).toEqual(expectedRowState);
        expect(returnVal).toBe(true);
    });
})