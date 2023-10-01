import Regiment from "./Regiment";

type Pair = {
    regiment: Regiment | undefined,
    index: number 
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
        return this.order().map(val => val.regiment).values();
    }  
    
    /**
     * Adds regiments from the given array to the row. The function runs until all spaces in the row
     * are filled, the source array is completely copied, or the given limit is reached. Regiments
     * are copied from the start of the source array and are placed from the centre of the row outwards.
     * @param source the array regiments are copied from. 
     * @param max the maximum number of regiments to be added
     * @returns the number of regiments added to the row.
     */
    addRegiments(source: (Regiment)[], max?: number): number {
        const limit: number = Math.min(source.length, max ?? this.row.length);
        let added: number = 0;
        const indexOrder: Iterator<number> = this.order().map(val => val.index).values();
        let index = indexOrder.next();
        while (!index.done && source.length > 0 && added < limit) {
            if (this.row[index.value] === undefined) {
                this.row[index.value] = source[added];
                added++;
            }
            if (added >= source.length || added >= limit) {
                break;
            }
            index = indexOrder.next();
        }
        return added;
    }

    at(index: number): Regiment | undefined {
        return this.row.at(index);
    }

    createSnapshot(): (Regiment | undefined)[] {
        return this.row.map(val => val?.unmodifiableCopy());
    }
    
    /**
     * If there are any gaps in the row (one or more undefineds between two regiments), fills the centremost undefined with 
     * the outermost regiment. 
     * 
     * If two undefineds or regiments are equally far from the centre, the rightmost is considered to be closer.
     * @returns true if a regiment was moved, false otherwise.
     */
    moveFlankRegimentToCentreGap(): boolean {
        const orderedRow: Pair[] = this.order();
        let gapOrder: number = this.row.length;
        const firstGap: Pair | undefined = orderedRow.find((val, index) => {
            if (val.regiment === undefined) {
                gapOrder = index;
                return true;
            }
            return false;
        });
        const last: Regiment | undefined = orderedRow.findLast(
            (pair, index) => pair.regiment !== undefined && pair.regiment.target === undefined && index > gapOrder)?.regiment;
        if (firstGap?.index === undefined || last === undefined) {
            return false;
        } else {
            const lastIndex: number = this.row.indexOf(last);
            this.row[lastIndex] = undefined;
            this.row[firstGap.index] = last;
            return true;
        }
    }

    indexOf(value: Regiment | undefined): number {
        return this.row.indexOf(value);
    }

    set(index: number, regiment: Regiment | undefined): void {
        this.row[index] = regiment
    }

    /**
     * For each gap in the row (one or more undefineds between two regiments),?????
     * @returns true if any regiments have been moved, false otherwise.
     */
    shiftRegiments(): boolean {
        const gaps: [number, number][] = [];
        let gapIndex: number = this.row.lastIndexOf(undefined, this.centreIndex - 1);
        let regimentIndex: number = this.row.findLastIndex((val, index) => val !== undefined && index < gapIndex);
        while (gapIndex !== -1 && regimentIndex !== -1) {
            gaps.push([gapIndex, regimentIndex]);
            gapIndex = this.row.lastIndexOf(undefined, regimentIndex);
            // eslint-disable-next-line no-loop-func
            regimentIndex = this.row.findLastIndex((val, index) => val !== undefined && index < gapIndex);
        }
        gapIndex = this.row.indexOf(undefined, this.centreIndex);
        regimentIndex = this.row.findIndex((val, index) => val !== undefined && index > gapIndex);
        while (gapIndex !== -1 && regimentIndex !== -1) {
            gaps.push([gapIndex, regimentIndex]);
            gapIndex = this.row.indexOf(undefined, regimentIndex);
            // eslint-disable-next-line no-loop-func
            regimentIndex = this.row.findIndex((val, index) => val !== undefined && index > gapIndex);
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

    slice(start?: number, end?: number): (Regiment | undefined)[] {
        return this.row.slice(start, end);

    }

    /**
     * Removes any regiments with 0 morale or strength from the row.
     * @returns true if any regiments were removed, false otherwise.
     */
    removeBrokenRegiments(): boolean {
        let updated = false;
        for (let i = 0; i < this.row.length; i++) {
            const regiment = this.row[i];
            if (regiment !== undefined && (regiment.strength <= 0 || regiment.currentMorale <= 0)) {
                updated = true;
                regiment.setTarget(undefined, undefined);
                this.row[i] = undefined;
            }
        }
        return updated
    }

    order(reversed?: boolean): Pair[] {
        let pairs: Pair[] = this.row.map((val, index) => {return {regiment: val, index: index}});
        pairs.sort((a, b) => {
          const absDiffInCentreDistance = Math.abs(2 * a.index - this.row.length + 1) - Math.abs(2 * b.index - this.row.length + 1);
          return (absDiffInCentreDistance === 0 ? b.index - a.index: absDiffInCentreDistance) * ((reversed ?? false) ? -1: 1);
        });
        return pairs;
    }

    get centreIndex(): number {
        return Math.floor(this.row.length / 2)
    }

    get length(): number {
        return this.row.length;
    }
}