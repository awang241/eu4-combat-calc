import React, { useMemo, useReducer } from 'react';
import { useState } from 'react';
import Army from './model/Army';

import ArmyModifiersPanel from './components/setup/ArmyModifiersPanel';
import RegimentsPanel from './components/setup/RegimentsPanel';
import BattleGrid from './components/BattleGrid';

import { parseTechs, parseUnits } from './util/Loader';
import './App.css';

import ArmySnapshot from './types/ArmySnapshot';
import { TechGroup } from './enum/TechGroups';
import Unit from './types/Unit';
import { Tech, TechState, defaultTechState } from './types/Tech';
import TechPanel from './components/setup/TechPanel';
import { defaultRegimentsState, regimentsReducer } from "./state/RegimentsState";
import Combat from './model/Combat';
import { createEnumRecord } from './util/StringEnumUtils';
import Modifiers, { Modifier } from './enum/Modifiers';
import { UnitType } from './enum/UnitTypes';
import ArmySetupPanel from './components/setup/ArmySetup';

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

export default function App() {
  const [results, setResults] = useState<[ArmySnapshot, ArmySnapshot][]>([]);
  const [attackerModifiers, setAttackerModifiers] = useState(createEnumRecord(0, Modifiers));
  const [defenderModifiers, setDefenderModifiers] = useState(createEnumRecord(0, Modifiers));
  const [attackerTech, setAttackerTech] = useState(defaultTechState);
  const [defenderTech, setDefenderTech] = useState(defaultTechState);
  const [attackerRegState, attackerRegsDispatch] = useReducer(regimentsReducer, undefined, defaultRegimentsState)
  const [defenderRegState, defenderRegsDispatch] = useReducer(regimentsReducer, undefined, defaultRegimentsState)

  const attackerUnits = useMemo(() => getUnitsAtTech(attackerTech), [attackerTech]);
  const defenderUnits = useMemo(() => getUnitsAtTech(defenderTech), [defenderTech]);

  const mapToModifiers = (abilitiesByType: Record<UnitType, number>) => {
    return {
      [Modifiers.INFANTRY_COMBAT_ABILITY]: abilitiesByType.infantry,
      [Modifiers.CAVALRY_COMBAT_ABILITY]: abilitiesByType.cavalry,
      [Modifiers.ARTILLERY_COMBAT_ABILITY]: abilitiesByType.artillery
    }
  }

  const handleSubmit = (event: React.MouseEvent<HTMLElement>) => {
    const attackerModifier: Record<Modifier, number> = {...attackerModifiers, ...mapToModifiers(attackerRegState.abilities)};
    const defenderModifier: Record<Modifier, number> = {...defenderModifiers, ...mapToModifiers(defenderRegState.abilities)};
    const army1 = new Army(attackerRegState.units, attackerRegState.counts, attackerModifier, techs[attackerTech.level]);
    const army2 = new Army(defenderRegState.units, defenderRegState.counts, defenderModifier, techs[defenderTech.level]);
    const combat = new Combat(army1, army2);
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
        <ArmySetupPanel techs={techs} units={units}/>
        <ArmySetupPanel techs={techs} units={units}/>        
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