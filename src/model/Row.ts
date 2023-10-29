import Regiment from "./Regiment";
import { RegimentTypes } from "../enum/RegimentTypes";

type RegimentRowIndexPair = {
    regiment: Regiment | undefined,
    rowIndex: number 
}

/**
 * Represents the a row of an army during battle. 
 */
export default class Row implements Iterable<Regiment | undefined> {
    private row: (Regiment | undefined)[];

    constructor(width: number) {
        this.row = new Array(width).fill(undefined);
    }

    [Symbol.iterator](): Iterator<Regiment | undefined> {
        return this.regimentsByCentreDistance().map(val => val.regiment).values();
    }  

    at(index: number): Regiment | undefined {
        return this.row.at(index);
    }

    createSnapshot(): (Regiment | undefined)[] {
        return this.row.map(val => val?.unmodifiableCopy());
    }

    /**
     * Comparator function that compares the distance from the centre of this row to each of the given indices. Ties are broken
     * by index size - if two indices are the same distance from the centre, the larger index (i.e. the one right of the centre
     * index) is considered to be closer.
     * @param indexA First index to be compared.
     * @param indexB Second index to be compared.
     * @returns 0 if the indices are equal, a negative value if index A is closer to the centre, and a positive value if B is closer 
     */
    centreDistanceComparator(indexA: number, indexB: number): number {
        const centreDistanceDifference = Math.abs(2 * indexA - this.row.length + 1) - Math.abs(2 * indexB - this.row.length + 1);
        return (centreDistanceDifference === 0 ? indexB - indexA: centreDistanceDifference);
    }

    /**
     * Returns the index of the first unbroken regiment and the index after the last 
     * unbroken regiment. 
     */
    getStartEndIndices(): [number, number] {
        const predicate = (slot: Regiment | undefined) => slot !== undefined && !slot.isBroken();
        const startIndex = this.row.findIndex(predicate);
        const endIndex = this.row.findLastIndex(predicate) + 1;
        return [startIndex, endIndex];
    }

    isAFurtherFromCentreThanB(indexA: number, indexB: number): boolean {
        return this.centreDistanceComparator(indexA, indexB) > 0;
    }

    /**
     * Moves regiments from the given source array to the specified row. The number of regiments is
     * controlled by the optional arguments; by default, regiments are moved until the source is 
     * empty or the row is full.
     * @param source The source array of regiments. Regiments are removed from the start of the array
     *      to this row.
     * @param max The maximum number of regiments to be moved.
     * @param indices The start and end indices. If provided, the row will only fill slots between these
     *      indices.
     * @returns The number of regiments moved into the row.
     */
    moveInRegiments(source: Regiment[], max?: number, indices?: [number, number]): number {
        const [startIndex, endIndex] = indices ?? [0, this.row.length]
        const limit: number = Math.min(source.length, max ?? this.row.length);
        let added: number = 0;
        let indexNum: number = 0;
        const indexOrder: number[] = this.regimentsByCentreDistance()
                                        .map(val => val.rowIndex)
                                        .filter(index => index >= startIndex && index < endIndex);
        while (added < limit && indexNum < indexOrder.length) {
            const index = indexOrder[indexNum++];
            if (this.row[index] === undefined) {
                this.row[index] = source[added++];
            }
        }
        source.splice(0, added);
        return added;
    }
    
    /**
     * If there are any gaps in the row (one or more undefineds between two regiments), fills the centremost undefined with 
     * the outermost eligible regiment. To be eligible, the regiment must not have a target and be further from the centre 
     * than the gap is. If there are no eligible regiments, no changes happen.
     * 
     * If two undefineds or regiments are equally far from the centre, the rightmost is considered to be closer.
     * @returns true if a regiment was moved, false otherwise.
     */
    moveOutmostRegimentToInmostGap(): boolean {
        const regimentsByDistanceToCentre: RegimentRowIndexPair[] = this.regimentsByCentreDistance();
        const inmostGapCentreIndex: number = regimentsByDistanceToCentre.findIndex((val) => val.regiment === undefined);
        if (inmostGapCentreIndex === -1) {
            return false;
        }
        const inmostGapRowIndex = regimentsByDistanceToCentre[inmostGapCentreIndex].rowIndex;
        const outmostRegiment: RegimentRowIndexPair | undefined = regimentsByDistanceToCentre.findLast(
            (pair, index) => pair.regiment !== undefined && pair.regiment.targetIndex !== -1 && index > inmostGapCentreIndex);
        if (outmostRegiment === undefined) {
            return false;
        } else {
            this.row[outmostRegiment.rowIndex] = undefined;
            this.row[inmostGapRowIndex] = outmostRegiment.regiment;
            return true;
        }
    }

    indexOf(value: Regiment | undefined): number {
        return this.row.indexOf(value);
    }

    set(index: number, regiment: Regiment | undefined): void {
        const currentRegiment = this.row[index];
        if (currentRegiment !== undefined) {
            currentRegiment.targetIndex = undefined;
        }
        this.row[index] = regiment;
    }

    /**
     * Given the front line of an enemy army as an array of regiments, sets the target for each regiment in this army.
     * Regiments will prioritize enemy regiments opposite them; if there isn't one there, they will pick the closest an enemy regiment within their flanking range
     * (e.g a regiment at index 7 and flanking range 2 can hit enemy regiments from index 5 to 9.).
     * If there are no available targets, the regiment's target will be set to undefined.
     * @param enemyFront The enemy army's front line as an array on regiments. This must be the same length as this army's front line.
     * @throws Will throw an error if the enemy front and this army's front are different lengths.
     */
    setTargets(enemyFront: Row, techFlankingBonus?: number, cavFlankingBonus?: number) {
        if (enemyFront.length !== this.length) {
            throw Error("Mismatched front lengths.")
        }

        for (let i = 0; i < this.length; i++) {
            let regiment = this.at(i);
            if (regiment !== undefined) {
                if (enemyFront.at(i) !== undefined) {
                    regiment.targetIndex = i;
                } else {
                    const cavBonus = (regiment.type === RegimentTypes.CAVALRY) ? (cavFlankingBonus ?? 0) : 0
                    const flankingRange = regiment.flankingRange((techFlankingBonus ?? 0) + cavBonus);
                    const startIndex = Math.max(0, i - flankingRange);
                    const endIndex = Math.min(enemyFront.length, i + flankingRange + 1);
                    let potentialTargets: RegimentRowIndexPair[];
                    potentialTargets = enemyFront.slice(startIndex, endIndex)
                        .map((val, index) => ({regiment: val, rowIndex: index + startIndex} as RegimentRowIndexPair))
                        .filter((val) => val.regiment !== undefined);
                    let targetIndex: number | undefined;
                    if (potentialTargets.length === 0) {
                        targetIndex = undefined
                    } else {
                        const outmost = potentialTargets.reduce((prev, curr) => {
                            const prevDistance = Math.abs(prev.rowIndex - i);
                            const currDistance = Math.abs(curr.rowIndex - i);
                            if (prevDistance === currDistance) {
                                return this.isAFurtherFromCentreThanB(prev.rowIndex, curr.rowIndex) ? prev: curr;
                            } else {
                                return prevDistance < currDistance ? prev : curr;
                            }
                        });
                        targetIndex = outmost.rowIndex;
                    }                   
                    regiment.targetIndex = targetIndex; 
                }
            }
        }
    } 

    /**
     * For each gap in the row (one or more undefineds between two regiments), move the next regiment out to the innermost undefined 
     * in the gap.
     * @returns true if any regiments have been moved, false otherwise.
     */
    shiftRegiments(): boolean {
        const gaps: [number, number][] = [];
        let nextGapIndex: number = this.row.lastIndexOf(undefined, this.centreIndex - 1);
        let nextRegimentIndex: number = this.row.findLastIndex((val, index) => val !== undefined && index < nextGapIndex);
        let predicate: (val: Regiment | undefined, index: number) => boolean = (val, index) => {
            return val !== undefined && index < nextGapIndex;
        };
        while (nextGapIndex !== -1 && nextRegimentIndex !== -1) {
            gaps.push([nextGapIndex, nextRegimentIndex]);
            nextGapIndex = this.row.lastIndexOf(undefined, nextRegimentIndex);
            nextRegimentIndex = this.row.findLastIndex(predicate);
        }

        nextGapIndex = this.row.indexOf(undefined, this.centreIndex);
        nextRegimentIndex = this.row.findIndex((val, index) => val !== undefined && index > nextGapIndex);
        predicate = (val, index) => val !== undefined && index > nextGapIndex;
        while (nextGapIndex !== -1 && nextRegimentIndex !== -1) {
            gaps.push([nextGapIndex, nextRegimentIndex]);
            nextGapIndex = this.row.indexOf(undefined, nextRegimentIndex);
            nextRegimentIndex = this.row.findIndex(predicate);
        }

        if (gaps.length === 0) {
            return false;
        } else {
            for (const [gapIndex, regimentIndex] of gaps) {
                const regiment: Regiment| undefined = this.row[regimentIndex];
                this.row[gapIndex] = regiment;
                this.row[regimentIndex] = undefined;
            }
            return true;
        }
    }

    /**
     * Wrapper around the Array slice funtion for the row. Returns the regiments between the start (inclusive)
     * and end (exclusive) indices.
     * @param start Start index, 0 if not provided.
     * @param end End index, end of the array if not provided.
     * @returns A new array containing the values between the given indices.
     */
    slice(start?: number, end?: number): (Regiment | undefined)[] {
        return this.row.slice(start, end);

    }

    /**
     * Removes any regiments with 0 morale or strength from the row.
     * @returns true if any regiments were removed, false otherwise.
     */
    removeBrokenRegiments(): boolean {
        let updated = false;
        this.row.forEach((regiment, index) => {
            if (regiment !== undefined && regiment.isBroken()) {
                updated = true;
                this.set(index, undefined);
            }
        });
        return updated;
    }

    /**
     * Returns the regiments/empty slots and their indices in the row, sorted by their distance to the centre. In case of two
     * positions equidistant from the centre, the rightmost (i.e. one with the larger row index) is closer.
     * @param reversed If false or not provided, returns the regiments in ascending order (from centre out);
     * otherwise returns them in descending order.
     * @returns The regiments/empty slots and their indices in the row, sorted by their distance to the centre.
     */
    regimentsByCentreDistance(reversed?: boolean): RegimentRowIndexPair[] {
        let pairs: RegimentRowIndexPair[] = this.row.map((val, index) => {return {regiment: val, rowIndex: index}});
        const multiplier = (reversed ?? false) ? -1 : 1;
        return pairs.sort((a, b) => multiplier * this.centreDistanceComparator(a.rowIndex, b.rowIndex));
    }

    get centreIndex(): number {
        return Math.floor(this.row.length / 2)
    }

    get length(): number {
        return this.row.length;
    }
}