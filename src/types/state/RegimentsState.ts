import { RegimentTypes } from "../../model/Regiment";
import Unit from "../Unit";

export type RegimentsState = {
    [type in RegimentTypes]: {
        count: number,
        unit: Unit | undefined
    };
};

export function defaultRegimentsState(): RegimentsState {
    return {
        [RegimentTypes.INFANTRY]: {
            count: 1,
            unit: undefined
        },
        [RegimentTypes.CAVALRY]: {
            count: 0,
            unit: undefined
        },
        [RegimentTypes.ARTILLERY]: {
            count: 0,
            unit: undefined
        },
    }
  }
