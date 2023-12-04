import React, { useReducer } from 'react';
import { useState } from 'react';
import Army from './model/Army';
import BattleGrid from './components/BattleGrid';

import { parseTechs, parseUnits } from './util/Loader';
import './App.css';

import ArmySnapshot from './types/ArmySnapshot';
import TechGroups from './enum/TechGroups';
import Unit, { blankUnit } from './types/Unit';
import { Tech, TechState, defaultTechState } from './types/Tech';
import { defaultRegimentsState, regimentsReducer } from "./state/RegimentsState";
import Combat from './model/Combat';
import { createEnumRecord } from './util/StringEnumUtils';
import Modifiers, { Modifier } from './enum/Modifiers';
import { UnitType } from './enum/UnitTypes';
import ArmySetupPanel from './components/setup/ArmySetup';
import { ArmyState, armyStateReducer } from './state/ArmyState';

declare global {
  interface Array<T> {
    findLastIndex(
      predicate: (value: T, index: number, obj: T[]) => unknown,
      thisArg?: any
    ): number
    findLast(
      predicate: (value: T, index: number, obj: T[]) => unknown,
      thisArg?: any
    ): T
  }
}

const [units, artilleryUnits] = parseUnits();
const techs: Tech[] = parseTechs();

function getUnitsAtTech(state: TechState): Unit[] {
  const source: Unit[] = units.get(state.group) ?? [];
  source.push(...artilleryUnits);
  return source.filter(unit => (unit.techLevel <= state.level)).sort((a, b) => b.techLevel - a.techLevel);
}

function defaultArmyState(): ArmyState {
  const unitData: Record<UnitType, [Unit, number]> = {
    infantry: [blankUnit("infantry"), 1],
    cavalry: [blankUnit("cavalry"), 0],
    artillery: [blankUnit("artillery"), 0]
  };
  const defaultTechLevel = 3
  return {
    ...createEnumRecord(0, Modifiers),
    ...unitData,
    techLevel: defaultTechLevel,
    techGroup: TechGroups.WESTERN,
    morale: techs[defaultTechLevel].morale
  }
}

function createArmyFromState(state: ArmyState) {
    const units: Record<UnitType, [Unit, number]> = {infantry: state.infantry, cavalry: state.cavalry, artillery: state.artillery};
    const modifiers: Partial<Record<Modifier, number>> = {};
    const tech = techs[state.techLevel];
    for (const modifier of Object.values(Modifiers)) {
      modifiers[modifier] = state[modifier];
    }
    return new Army(units, modifiers, tech);
}

export default function App() {
  const [results, setResults] = useState<[ArmySnapshot, ArmySnapshot][]>([]);
  const [attackerState, attackerDispatch] = useReducer(armyStateReducer, undefined, defaultArmyState);
  const [defenderState, defenderDispatch] = useReducer(armyStateReducer, undefined, defaultArmyState)




  const handleSubmit = (event: React.MouseEvent<HTMLElement>) => {
    const attacker = createArmyFromState(attackerState);
    const defender = createArmyFromState(defenderState);
    const combat = new Combat(attacker, defender);
    combat.run();
    setResults(combat.dailyResults);
  }

  return (
    <div id="columns" className='App'>
      <div className="full-width">
        <BattleGrid results={results}/>
        <input type='button' value={"Go!"} onClick={handleSubmit}/>
      </div>
      <h2 className="column-heading">Attacker</h2>
      <h2 className="column-heading">Defender</h2>

      <div id="setup">
        <ArmySetupPanel techs={techs} units={units} state={attackerState} dispatch={attackerDispatch}/>
        <ArmySetupPanel techs={techs} units={units} state={defenderState} dispatch={defenderDispatch}/>
      </div>
      <h2 className='full-width'>Day-By-Day Casualties</h2>
      <table id="casualty-table" className='full-width'>
        <thead>
          <tr>
            <th rowSpan={2}>Day</th>
            <th colSpan={4}>Army 1</th>
            <th colSpan={4}>Army 2</th>
          </tr>
          <tr>
            <th>Strength</th>
            <th>Casualties</th>
            <th>Total Morale</th>
            <th>Morale Damage</th>
            <th>Strength</th>
            <th>Casualties</th>
            <th>Total Morale</th>
            <th>Morale Damage</th>
          </tr>
        </thead>
        <tbody>
          {
            results.map((result, index) => {
              let attackerCasualties: number = 0;
              let attackerMoraleDamage: number = 0;
              let defenderCasualties: number = 0;
              let defenderMoraleDamage: number = 0;
              if (index > 0) {
                attackerCasualties = (results[index - 1][0].currentStrength - result[0].currentStrength);
                attackerMoraleDamage = (results[index - 1][0].currentMorale - result[0].currentMorale);
                defenderCasualties = (results[index - 1][1].currentStrength - result[1].currentStrength);
                defenderMoraleDamage = (results[index - 1][1].currentMorale - result[1].currentMorale);
              }
              return (
                <tr key={index}>
                  <td>{index === 0 ? "-" : index}</td>
                  <td>{result[0].currentStrength}</td>
                  <td>{attackerCasualties}</td>
                  <td>{result[0].currentMorale.toFixed(2)}</td>
                  <td>{attackerMoraleDamage.toFixed(2)}</td>
                  <td>{result[1].currentStrength}</td>
                  <td>{defenderCasualties}</td>
                  <td>{result[1].currentMorale.toFixed(2)}</td>
                  <td>{defenderMoraleDamage.toFixed(2)}</td>
                </tr>
              )
            })
          }
        </tbody>
        
      </table>
    </div>

  );
}