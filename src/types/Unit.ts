import { RegimentTypes } from "../model/Regiment"
import Pips from "./Pips"

export type Unit = {
    name: string,
    type: RegimentTypes,
    techGroup: string,
    techLevel: number,
    pips: Pips
}