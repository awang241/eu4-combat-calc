import Regiment from "../../model/Regiment";
import Row from "../../model/Row"
import { DUMMY_INFANTRY } from "../DummyTypes";

jest.mock("../../model/Regiment")
const ROW_WIDTH_NORMAL = 5;

function createMockRegiment(): Regiment {
    return new Regiment(0, DUMMY_INFANTRY);
}

function createRow(length?: number, empty?: boolean): Row {
    const rowWidth = length ?? ROW_WIDTH_NORMAL
    let positions: (Regiment | undefined)[] = Array(rowWidth).fill(undefined)
    if (!(empty ?? false)) {
        positions = positions.map(() => createMockRegiment());
    }
    const row = new Row(rowWidth);
    positions.forEach((val, index) => row.set(index, val));
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

describe.each([
    [15, false],
    [2, false],
    [3, true],
    [3, undefined],
])("regimentsByCentreDistance", (length, reversed) => {
    test(`from Row of length ${length} and is ${reversed ? "": "not "}reversed returns in the correct order`, () => {
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
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("with no broken regiments", () => {
        let row: Row;
        beforeEach(() => row = createRow(ROW_WIDTH_NORMAL))

        test("removes no regiments from the row", () => {
            const expectedRegiments = row.slice();
            row.removeBrokenRegiments();
            expect(row.slice()).toEqual(expectedRegiments);
        })
        test("returns false", () => {
            const returnVal = row.removeBrokenRegiments();
            expect(returnVal).toBe(false);
        })
    });

    describe("with broken regiments at index 1 and 4", () => {
        let row: Row;
        let expectedRowState: (Regiment | undefined)[];
        const brokenRegIndices = [1, 4];
        beforeEach(() => {
            row = createRow(ROW_WIDTH_NORMAL);
            expectedRowState = row.slice();
            brokenRegIndices.forEach(rowIndex => {
                jest.spyOn(row.at(rowIndex) as Regiment, "isBroken").mockReturnValue(true);
                expectedRowState[rowIndex] = undefined;
            });
        });
        
        test("only removes those regiments from the row", () => {
            row.removeBrokenRegiments();
            expect(row.slice()).toEqual(expectedRowState);
        })
        test("returns true", () => {
            const returnVal = row.removeBrokenRegiments();
            expect(returnVal).toBe(true);
        })
    });
})