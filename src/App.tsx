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
import WinrateBarDisplay from './components/display/WinrateBarDisplay';
import { RollModifiers } from './types/RollModifiers';

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
  const [crossing, setCrossing] = useState(0);
  
  const [attackerState, attackerDispatch] = useReducer(armyStateReducer, undefined, defaultArmyState);
  const [defenderState, defenderDispatch] = useReducer(armyStateReducer, undefined, defaultArmyState);
  const [combatResults, setCombatResults] = useState<[ArmySnapshot, ArmySnapshot][]>([]);
  const [attackerRollModifiers, setAttackerRollModifiers] = useState<RollModifiers>({});
  const [defenderRollModifiers, setDefenderRollModifiers] = useState<RollModifiers>({});

  const [attackerWinrate, setAttackerWinrate] = useState(0);
  const [defenderWinrate, setDefenderWinrate] = useState(0);
  const [attackerStackwipeChance, setAttackerStackwipeChance] = useState(0);
  const [defenderStackwipeChance, setDefenderStackwipeChance] = useState(0);
  const combatInstances = 10000; 

  const handleSubmit = (event: React.MouseEvent<HTMLElement>) => {
    const attacker = createArmyFromState(attackerState);
    const defender = createArmyFromState(defenderState);
    const combat = new Combat(attacker, defender, terrain, false);
    combat.run();
    setResults(combat.dailyResults);
    let combats = new Array(combatInstances).fill(undefined).map(() => {
      const attacker = createArmyFromState(attackerState);
      const defender = createArmyFromState(defenderState);
      const combat = new Combat(attacker, defender, terrain, true);
      combat.run();
      return combat;
    })
    const results = combats.map(combat => combat.finalResult);
    setCombatResults(results);
    let attackerWins = 0;
    let defenderWins = 0;
    let attackerStackwipes = 0;
    let defenderStackwipes = 0;
    combats.forEach((combat) => {
      let result = combat.finalResult;
      if (result[0].currentMorale > 0 && result[0].currentStrength > 0) {
        attackerWins++;
        if (combat.length <= 13 && result[0].currentStrength > 2 * result[1].currentStrength) {
          attackerStackwipes++;
        }
      } else if (result[1].currentMorale > 0 && result[1].currentStrength > 0) {
        defenderWins++;
        if (combat.length <= 13 && result[1].currentStrength > 2 * result[0].currentStrength) {
          defenderStackwipes++;
        }
      }
    })
    setAttackerWinrate(Math.round(100 * attackerWins / results.length ));
    setDefenderWinrate(Math.round(100 * defenderWins / results.length ));
    setAttackerStackwipeChance(Math.round(100 * attackerStackwipes / results.length ));
    setDefenderStackwipeChance(Math.round(100 * defenderStackwipes / results.length ));

    setAttackerRollModifiers(combat.attackerRollModifiers);
    setDefenderRollModifiers(combat.defenderRollModifiers);
  }
  const handleTerrainSelect: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const selected = Terrains.values.find(terrain => terrain.description === event.target.value); 
    if (selected !== undefined) setTerrain(selected);
  }

  const handleCrossingSelect: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const selected = parseInt(event.target.value); 
    if (selected !== undefined) setCrossing(selected);
  }

  const renderMultipleCombatResults = () => {
    if (combatResults.length > 0) {
      let sumOfAttackerStrength = 0;
      let sumOfDefenderStrength = 0;
      let attackerWins = 0;
      let defenderWins = 0;
      combatResults.forEach((result) => {
        sumOfAttackerStrength += result[0].currentStrength;
        sumOfDefenderStrength += result[1].currentStrength;
        if (result[0].currentMorale > 0 && result[0].currentStrength > 0) {
          attackerWins++;
        } else if (result[1].currentMorale > 0 && result[1].currentStrength > 0) {
          defenderWins++;
        }
      })
      const averageAttackerStrength = Math.floor(sumOfAttackerStrength / combatResults.length);
      const averageDefenderStrength = Math.floor(sumOfDefenderStrength / combatResults.length);
      const attackerWinrate = Math.round(100 * attackerWins / combatResults.length );
      const defenderWinrate = Math.round(100 * defenderWins / combatResults.length );
      return (
        <table>
          <tr>
            <th>Run Index</th>
            <th>Attacker Strength</th>
            <th>Attacker Wins</th>
            <th>Attacker Winrate</th>

            <th>Defender Strength</th>
            <th>Defender Wins</th>
            <th>Defender Winrate</th>

          </tr>
          <tr>
            <td><strong>Average</strong></td>
            <td><strong>{averageAttackerStrength}</strong></td>
            <td><strong>{attackerWins}</strong></td>

            <td><strong>{attackerWinrate}%</strong></td>
            <td><strong>{averageDefenderStrength}</strong></td>
            <td><strong>{defenderWins}</strong></td>

            <td><strong>{defenderWinrate}%</strong></td>
          </tr>
         
        </table>
      )
    } else {
      return <></>
    }
    
  }

  return (
    <div id="columns" className='App'>
      <div className="full-width">
        <WinrateBarDisplay 
          attackerWinChance={attackerWinrate} 
          attackerStackwipeChance={attackerStackwipeChance}
          defenderWinChance={defenderWinrate}
          defenderStackwipeChance={defenderStackwipeChance}
        />

        <BattleGrid 
          results={results} 
          terrain={terrain} 
          attackerRollModifiers={attackerRollModifiers}
          defenderRollModifiers={defenderRollModifiers}
        />
        <input type='button' value={"Go!"} onClick={handleSubmit}/>
        <select onChange={handleCrossingSelect} value={crossing}>
          <option>0</option>
          <option>1</option>
          <option>2</option>
        </select>
        <select onChange={handleTerrainSelect} value={terrain.description}>
          {Terrains.values.map(terrain => <option>{terrain.description}</option>)}
        </select>
      </div>

      {
        renderMultipleCombatResults()
      }
      
      <h2 className="column-heading">Attacker</h2>
      <h2 className="column-heading">Defender</h2>

      <div id="setup">
        <ArmySetupPanel state={attackerState} dispatch={attackerDispatch}/>
        <ArmySetupPanel state={defenderState} dispatch={defenderDispatch}/>
      </div>
      <h2 className='full-width'>Day-By-Day Casualties</h2>
      {renderMultipleCombatResults()}
      <table id="casualty-table" className='full-width'>
        <thead>
          <tr>
            <th rowSpan={2}>Day</th>
            <th colSpan={5}>Army 1</th>
            <th colSpan={5}>Army 2</th>
          </tr>
          <tr>
            <th>Roll</th>
            <th>Strength</th>
            <th>Casualties</th>
            <th>Total Morale</th>
            <th>Morale Damage</th>
            <th>Roll</th>
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
                  <td>{index === 0 ? "-" : result[0].roll}</td>
                  <td>{result[0].currentStrength}</td>
                  <td>{attackerCasualties}</td>
                  <td>{result[0].currentMorale.toFixed(2)}</td>
                  <td>{attackerMoraleDamage.toFixed(2)}</td>
                  <td>{index === 0 ? "-" : result[1].roll}</td>
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