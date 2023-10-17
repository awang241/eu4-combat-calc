import React, { useMemo, useReducer } from 'react';
import { useState } from 'react';
import Army from './model/Army';

import ArmyModifiersPanel from './components/ArmyModifiersPanel';
import RegimentsPanel from './components/RegimentsPanel';
import BattleGrid from './components/BattleGrid';

import { parseTechs, parseUnits } from './util/Loader';
import './App.css';

import { Modifiers, createDefaultModifiers } from './types/Modifiers';
import ArmySnapshot from './types/ArmySnapshot';
import TechGroup from './types/TechGroup';
import Unit from './types/Unit';
import { Tech, TechState, defaultTechState } from './types/Tech';
import TechPanel from './components/TechPanel';
import { defaultRegimentsState, regimentsReducer } from "./state/RegimentsState";
import { combat } from './Combat';

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

const units: Map<TechGroup, Unit[]> = parseUnits();
const techs: Tech[] = parseTechs();

function getUnitsAtTech(state: TechState): Unit[] {
  const source: Unit[] = units.get(state.group) ?? [];
  return source.filter(unit => (unit.techLevel <= state.level)).sort((a, b) => b.techLevel - a.techLevel);
}

export default function App() {
  const [results, setResults] = useState<[ArmySnapshot, ArmySnapshot][]>([]);
  const [attackerModifiers, setAttackerModifiers] = useState(createDefaultModifiers);
  const [defenderModifiers, setDefenderModifiers] = useState(createDefaultModifiers);
  const [attackerTech, setAttackerTech] = useState(defaultTechState);
  const [defenderTech, setDefenderTech] = useState(defaultTechState);
  const [attackerRegState, attackerRegsDispatch] = useReducer(regimentsReducer, undefined, defaultRegimentsState)
  const [defenderRegState, defenderRegsDispatch] = useReducer(regimentsReducer, undefined, defaultRegimentsState)

  const attackerUnits = useMemo(() => getUnitsAtTech(attackerTech), [attackerTech]);
  const defenderUnits = useMemo(() => getUnitsAtTech(defenderTech), [defenderTech]);


  const handleSubmit = (event: React.MouseEvent<HTMLElement>) => {
    const attackerModifier: Modifiers = {...attackerModifiers};
    const defenderModifier: Modifiers = {...defenderModifiers};
    const army1 = new Army(attackerRegState, attackerModifier, techs[attackerTech.level]);
    const army2 = new Army(defenderRegState, defenderModifier, techs[defenderTech.level]);
    setResults(combat(army1, army2));
  }

  return (
    <div id="columns" className='App'>
      <div className="full-width">
        <BattleGrid results={results}/>
        <input type='button' value={"Go!"} onClick={handleSubmit}/>
      </div>
      <h2 className="column-heading">Attacker</h2>
      <h2 className="column-heading">Defender</h2>

      <div className='full-width'>
        <TechPanel level={attackerTech.level} group={attackerTech.group} updater={setAttackerTech}/>
        <TechPanel level={defenderTech.level} group={defenderTech.group} updater={setDefenderTech}/>
      </div>
      <div id="regiment-modifiers" className='collapsing-panel'>
        <h3 className='full-width'>Regiments and Regiment Modifiers</h3>
        <RegimentsPanel 
        state={attackerRegState} units={attackerUnits} dispatch={attackerRegsDispatch}/>
        <RegimentsPanel state={defenderRegState} units={defenderUnits} dispatch={defenderRegsDispatch}/>
      </div>
      <div id="army-modifiers" className='collapsing-panel'>
        <h3 className='full-width'>Army Modifiers</h3>
        <ArmyModifiersPanel 
          modifiers={attackerModifiers} 
          callback={setAttackerModifiers} 
          tech={techs[attackerTech.level]}
        />
        <ArmyModifiersPanel 
          modifiers={defenderModifiers} 
          callback={setDefenderModifiers} 
          tech={techs[defenderTech.level]}
        />
      </div>
      <h2>Day-By-Day Casualties</h2>
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