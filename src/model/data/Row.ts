import Regiment from "../Regiment";

/**
 * Represents the a row of an army during battle. 
 */
export default class Row implements Iterable<Regiment | undefined> {
    private regiments: (Regiment | undefined)[];

    constructor(width: number) {
        this.regiments = new Array(width);
    }

    [Symbol.iterator](): Iterator<Regiment | undefined> {
        return this.regimentOrder();
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
        const limit = Math.min(source.length, max ?? this.regiments.length);
        let added = 0;
        const indexOrder = this.indexOrder();
        let index = indexOrder.next();
        while (!index.done && source.length > 0 && added < limit) {
            if (this.regiments[index.value] === undefined) {
                this.regiments[index.value] = source[added];
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
        return this.regiments.at(index);
    }

    centreIndex(): number {
        return Math.floor(this.regiments.length / 2)
    }
    
    /**
     * If there are any gaps in the row (one or more undefineds between two regiments), fills the centremost undefined with 
     * the outermost regiment. 
     * 
     * If two undefineds or regiments are equally far from the centre, the rightmost is considered to be closer.
     * @returns true if a regiment was moved, false otherwise.
     */
    fillCentreGap(): boolean {
        const orderedRow = new Array(...this);
        const gapIndex: number | undefined = orderedRow.indexOf(undefined);       
        const last: Regiment | undefined = orderedRow.findLast((val, index) => val !== undefined && index > (gapIndex ?? 0));
        if (gapIndex === undefined || last === undefined) {
            return false;
        } else {
            const lastIndex: number = this.regiments.indexOf(last);
            this.regiments[lastIndex] = undefined;
            this.regiments[gapIndex] = last;
            return true;
        }
    }

    /**
     * For each gap in the row (one or more undefineds between two regiments),?????
     * @returns true if any regiments have been moved, false otherwise.
     */
    shiftRegiments(): boolean {
        const gaps: [number, number][] = [];
        let gapIndex: number = this.regiments.lastIndexOf(undefined, this.centreIndex());
        let regimentIndex: number = this.regiments.findLastIndex((val, index) => val !== undefined && index < gapIndex);
        while (gapIndex !== -1 && regimentIndex !== -1) {
            gaps.push([gapIndex, regimentIndex]);
            gapIndex = this.regiments.lastIndexOf(undefined, regimentIndex);
            // eslint-disable-next-line no-loop-func
            regimentIndex = this.regiments.findLastIndex((val, index) => val !== undefined && index < gapIndex);
        }
        gapIndex = this.regiments.indexOf(undefined, this.centreIndex());
        regimentIndex = this.regiments.findIndex((val, index) => val !== undefined && index > gapIndex);
        while (gapIndex !== -1 && regimentIndex !== -1) {
            gaps.push([gapIndex, regimentIndex]);
            gapIndex = this.regiments.indexOf(undefined, regimentIndex);
            // eslint-disable-next-line no-loop-func
            regimentIndex = this.regiments.findIndex((val, index) => val !== undefined && index > gapIndex);
        }
        if (gaps.length === 0) {
            return false;
        } else {
            for (const [gapIndex, regimentIndex] of gaps) {
                const regiment: Regiment| undefined = this.regiments[regimentIndex];
                this.regiments[gapIndex] = regiment;
                this.regiments[regimentIndex] = undefined;
            }
            return true;
        }
    }

    /**
     * Removes any regiments with 0 morale or strength from the row.
     * @returns true if any regiments were removed, false otherwise.
     */
    removeBrokenRegiments(): boolean {
        let updated = false;
        for (let i = 0; i < this.regiments.length; i++) {
            const regiment = this.regiments[i];
            if (regiment !== undefined && (regiment.strength <= 0 || regiment.currentMorale <= 0)) {
                updated = true;
                regiment.setTarget(undefined, undefined);
                this.regiments[i] = undefined;
            }
        }
        return updated
    }


    order(reversed?: boolean): [Regiment | undefined, number][] {
        let pairs: [Regiment | undefined, number][] = this.regiments.map((val, index) => [val, index * 2]);
        pairs.sort((a, b) => {
          const absDiffInCentreDistance = Math.abs(a[1] - this.regiments.length + 1) - Math.abs(b[1] - this.regiments.length + 1)
          return (absDiffInCentreDistance === 0 ? b[1] - a[1]: absDiffInCentreDistance) * (reversed ? -1: 1);
        });
        return pairs
    }


    indexOrder(): Iterator<number> {
        return this.order().map(val => val[1]).values();
    }


    regimentOrder(reverse?: boolean): Iterator<Regiment | undefined> {
        return this.order().map(val => val[0]).values();
    }


    /**
     * addAll
     * at
     * 
     */
}