import React, { ChangeEventHandler, useReducer } from 'react';
import { useState } from 'react';
import Army from './model/Army';
import BattleGrid from './components/BattleGrid';

import './App.css';

import ArmySnapshot from './types/ArmySnapshot';
import TechGroups from './enum/TechGroups';
import Unit, { blankUnit } from './types/Unit';
import Combat from './model/Combat';
import { createEnumRecord } from './util/StringEnumUtils';
import Modifiers, { Modifier } from './enum/Modifiers';
import UnitTypes, { UnitType } from './enum/UnitTypes';
import ArmySetupPanel from './components/setup/ArmySetup';
import { ArmyState, armyStateReducer } from './state/ArmyState';
import GLOBAL_SETUP_STATE from './state/GlobalSetupState';
import { Leader } from './types/Leader';
import Terrains from './enum/Terrain';

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

const {techs} = GLOBAL_SETUP_STATE;

function defaultArmyState(): ArmyState {
  const units: Record<UnitType, Unit> = {
    infantry: blankUnit("infantry"),
    cavalry: blankUnit("cavalry"),
    artillery: blankUnit("artillery"),
  };
  const regimentCounts = {...createEnumRecord(0, UnitTypes), infantry: 1}
  const defaultTechLevel = 3
  const modifiers = {...createEnumRecord(0, Modifiers), morale: techs[defaultTechLevel].morale};
  const leader: Leader = {fire: 0, shock: 0, maneuver: 0}

  return {
    modifiers,
    units,
    regimentCounts,
    leader,
    tech: {level: defaultTechLevel, group: TechGroups.WESTERN},
  }
}

function createArmyFromState(state: ArmyState) {
    const modifiers: Partial<Record<Modifier, number>> = {};
    const tech = techs[state.tech.level];
    const leader = {...state.leader}
    for (const modifier of Object.values(Modifiers)) {
      modifiers[modifier] = state.modifiers[modifier];
    }
    return new Army(state.units, state.regimentCounts, modifiers, tech, state.tech.group, leader);
}

export default function App() {
  const [results, setResults] = useState<[ArmySnapshot, ArmySnapshot][]>([]);
  const [terrain, setTerrain] = useState(Terrains.GRASSLANDS);
  const [attackerState, attackerDispatch] = useReducer(armyStateReducer, undefined, defaultArmyState);
  const [defenderState, defenderDispatch] = useReducer(armyStateReducer, undefined, defaultArmyState);

  const handleSubmit = (event: React.MouseEvent<HTMLElement>) => {
    const attacker = createArmyFromState(attackerState);
    const defender = createArmyFromState(defenderState);
    const combat = new Combat(attacker, defender, terrain);
    combat.run();
    setResults(combat.dailyResults);
  }
  const handleTerrainSelect: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const selected = Terrains.values.find(terrain => terrain.description === event.target.value); 
    if (selected !== undefined) setTerrain(selected);
  }

  return (
    <div id="columns" className='App'>
      <div className="full-width">
        <BattleGrid results={results} terrain={terrain}/>
        <input type='button' value={"Go!"} onClick={handleSubmit}/>
        <select onChange={handleTerrainSelect} value={terrain.description}>
          {Terrains.values.map(terrain => <option>{terrain.description}</option>)}
        </select>
      </div>
      
      <h2 className="column-heading">Attacker</h2>
      <h2 className="column-heading">Defender</h2>

      <div id="setup">
        <ArmySetupPanel state={attackerState} dispatch={attackerDispatch}/>
        <ArmySetupPanel state={defenderState} dispatch={defenderDispatch}/>
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