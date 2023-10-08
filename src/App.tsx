import React from 'react';
import { useState } from 'react';
import Army from './model/Army';

import { Modifiers, createDefaultModifiers } from './types/Modifiers';
import { RegimentTypes } from './model/Regiment';
import ArmySnapshot from './types/ArmySnapshot';

import ArmyModifiersPanel from './components/ArmyModifiersPanel';
import RegimentsPanel, { RegimentCounts } from './components/RegimentsPanel';
import BattleGrid from './components/BattleGrid';
import './App.css';

import { parseUnits } from './util/Loader';
import { TechGroup } from './types/TechGroup';
import Unit, { blankUnit } from './types/Unit';

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

function defaultCounts(): RegimentCounts {
  return {
    [RegimentTypes.INFANTRY]: 1,
    [RegimentTypes.CAVALRY]: 0,
    [RegimentTypes.ARTILLERY]: 0
  }
}
/**
 * 
 * @param {Army} attacker 
 * @param {Army} defender 
 */
function combat(attacker: Army, defender: Army): [ArmySnapshot, ArmySnapshot][] {
  let days = 1;

  const loopLimit:number = 100;
  const dayOffset:number = 1;
  const combatPhasePeriod: number = 6;
  const firePhaseCutoff: number = 3;
  const combatWidth: number = 20;
  attacker.deploy(combatWidth, defender.frontlineRegimentCount());
  defender.deploy(combatWidth, attacker.frontlineRegimentCount());
  let isAttackerUpdated = true;
  let isDefenderUpdated = true;
  const dailyStrengths: [ArmySnapshot, ArmySnapshot][] = [];
  dailyStrengths.push([attacker.getSnapshot(), defender.getSnapshot()]);
  while (!attacker.isBroken() && !defender.isBroken() && days < loopLimit) {
    let isFirePhase = (days - dayOffset) % combatPhasePeriod < firePhaseCutoff;
    let roll = 5;
    if (isDefenderUpdated || isAttackerUpdated) {
      attacker.setTargets(defender);
      defender.setTargets(attacker);
    }
    //N.B. Do not collapse - casualties must be calculated for both sides before applying them.
    const defenderCasualties = attacker.calculateCasualties(roll, isFirePhase, days, defender.modifiers);
    const attackerCasualties = defender.calculateCasualties(roll, isFirePhase, days, attacker.modifiers);
    attacker.applyCasualtiesAndMoraleDamage(attackerCasualties, defender.modifiers.morale);
    defender.applyCasualtiesAndMoraleDamage(defenderCasualties, attacker.modifiers.morale);
    dailyStrengths.push([attacker.getSnapshot(), defender.getSnapshot()]);
    isAttackerUpdated = attacker.replaceRegiments();
    isDefenderUpdated = defender.replaceRegiments();

    days++;
  }
  return dailyStrengths;
}

export default function App() {
  const units: Map<TechGroup, Unit[]> = parseUnits();
  const [results, setResults] = useState<[ArmySnapshot, ArmySnapshot][]>([]);
  const [attackerModifiers, setAttackerModifiers] = useState(createDefaultModifiers);
  const [defenderModifiers, setDefenderModifiers] = useState(createDefaultModifiers);
  const [attackerCounts, setAttackerCounts] = useState(defaultCounts);
  const [defenderCounts, setDefenderCounts] = useState(defaultCounts);

  const handleSubmit = (event: React.MouseEvent<HTMLElement>) => {
    const attackerModifier: Modifiers = {...attackerModifiers};
    const defenderModifier: Modifiers = {...defenderModifiers};
    const infUnit: Unit  = units.get(TechGroup.WESTERN)?.find(val => val.type === RegimentTypes.INFANTRY) ?? blankUnit(RegimentTypes.INFANTRY);
    const cavUnit: Unit  = units.get(TechGroup.WESTERN)?.find(val => val.type === RegimentTypes.CAVALRY) ?? blankUnit(RegimentTypes.CAVALRY);
    const army1 = new Army(attackerCounts.infantry, attackerCounts.cavalry, attackerModifier, infUnit, cavUnit);
    const army2 = new Army(defenderCounts.infantry, defenderCounts.cavalry, defenderModifier, infUnit, cavUnit);
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
      <div id="regiment-modifiers" className='collapsing-panel'>
        <h3 className='full-width'>Regiments and Regiment Modifiers</h3>
        <RegimentsPanel
          modifiers={attackerModifiers}
          counts={attackerCounts}
          modifierCb={setAttackerModifiers}
          countCb={setAttackerCounts}
        />
        <RegimentsPanel
          modifiers={defenderModifiers}
          counts={defenderCounts}
          modifierCb={setDefenderModifiers}
          countCb={setDefenderCounts}
        />
      </div>
      <div id="army-modifiers" className='collapsing-panel'>
        <h3 className='full-width'>Army Modifiers</h3>
        <ArmyModifiersPanel modifiers={attackerModifiers} callback={setAttackerModifiers}/>
        <ArmyModifiersPanel modifiers={defenderModifiers} callback={setDefenderModifiers}/>
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