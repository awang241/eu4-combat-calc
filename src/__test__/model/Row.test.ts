import Regiment from "../../model/Regiment";
import Row from "../../model/Row"
import { DUMMY_INFANTRY } from "../DummyTypes";

jest.mock("../../model/Regiment")
const ROW_WIDTH_NORMAL = 5;

function createMockRegiment(): Regiment {
    return new Regiment(0, DUMMY_INFANTRY);
}
function createRow(positions?: boolean[]): Row;
function createRow(length?: number): Row;
function createRow(arg: number | boolean[] | undefined): Row {
    let rowWidth: number;
    let positions: boolean[];
    if (typeof arg === 'number' || arg === undefined) {
        rowWidth = (arg ?? ROW_WIDTH_NORMAL);
        positions = Array(rowWidth).fill(true);
    } else {
        rowWidth = arg.length;
        positions = arg;
    }
    const row = new Row(rowWidth);
    positions.forEach((value, index) => row.set(index, value ? createMockRegiment() : undefined))
    return row;
}
beforeEach(() => {

})

afterEach(() => {
    jest.resetAllMocks();
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

describe("moveInRegiments", () => {
    describe("on an empty row of width 7", () => {
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
        ])("with $sourceLen source regiments and max of $max", ({sourceLen, max, expectedAdded}) => {
            const ROW_WIDTH = 7;
            const INDEX_ORDER = [3, 4, 2, 5, 1, 6, 0];
            const row = new Row(ROW_WIDTH);
            const createdRegiments = Array(sourceLen).fill(undefined).map(createMockRegiment);
            const source = createdRegiments.slice();

            const returnVal = row.addRegiments(source, max);

            expect(returnVal.length).toBe(expectedAdded);
            expect(createdRegiments).toEqual(expect.arrayContaining(returnVal));
            const expectedFilledIndices = INDEX_ORDER.slice(0, expectedAdded);
            const expectedEmptyIndices = INDEX_ORDER.slice(expectedAdded);
            expectedFilledIndices.forEach(index => expect(createdRegiments).toContain(row.at(index)));
            expectedEmptyIndices.forEach(index => expect(row.at(index)).toBe(undefined));
        })
    })
    
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