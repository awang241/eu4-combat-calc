import Regiment from "../../model/Regiment";
import Row from "../../model/Row"
import { DUMMY_INFANTRY } from "../DummyTypes";

jest.mock("../../model/Regiment");
const mockRegiment = jest.mocked(Regiment);

function rowStateCopy(row: Row): (Regiment | undefined)[] {
    return Array(row.length).fill(undefined).map((_, index) => row.at(index));
}

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

describe.each([
    [15, false],
    [2, false],
    [3, true],
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
    const ROW_WIDTH = 5;
    const prepare = (length: number, empty?: boolean) => {
        let positions: (Regiment | undefined)[] = Array(length).fill(undefined)
        if (!(empty ?? false)) {
            positions = positions.map(() => new Regiment(1, DUMMY_INFANTRY));
            positions.forEach(val => {
                if (val !== undefined) {
                    jest.spyOn(val, "isBroken").mockReturnValue(false);
                }
            });
        }
        const row = new Row(length);
        positions.forEach((val, index) => row.set(index, val));
        return [row, positions] as const;
    }
    
    beforeEach(() => {
        jest.resetAllMocks();
    })  

    describe("with no broken regiments", () => {
        const [row, regiments] = prepare(ROW_WIDTH);

        const returnVal = row.removeBrokenRegiments();

        test("removes no regiments from the row", () => {
            const actualRegiments = Array(ROW_WIDTH).fill(undefined).map((val, index) => row.at(index));
            expect(actualRegiments).toEqual(regiments);
        })
        test("returns false", () => {
            expect(returnVal).toBe(false);
        })
    });

    describe("with broken regiments at index 1 and 4", () => {
        const [row, expectedRowState] = prepare(ROW_WIDTH);
        const brokenRegIndices = [1, 4];
        brokenRegIndices.forEach(rowIndex => {
            jest.spyOn(row.at(rowIndex) as Regiment, "isBroken").mockReturnValue(true);
            expectedRowState[rowIndex] = undefined;
        });

        const returnVal = row.removeBrokenRegiments();

        test("only removes those regiments from the row", () => {
            const actualRegiments = Array(ROW_WIDTH).fill(undefined).map((val, index) => row.at(index));
            expect(actualRegiments).toEqual(expectedRowState);
        })
        test("returns true", () => {
            expect(returnVal).toBe(true);
        })
    });
})