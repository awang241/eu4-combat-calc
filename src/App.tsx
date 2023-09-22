import React, { ChangeEventHandler, MouseEventHandler } from 'react';
import { useState } from 'react';
import Army from './model/Army';
import './App.css';
import ArmyModifiersPanel from './components/ArmyModifiersPanel';
import Modifiers from './model/data/Modifiers';
import { ModifierNames } from './model/data/Modifiers';
import RegimentsPanel from './components/RegimentsPanel';
 
/**
 * 
 * @param {Army} attacker 
 * @param {Army} defender 
 */
function combat(attacker: Army, defender: Army): Array<[number, number, number, number]> {
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
  const dailyStrengths: Array<[number, number, number, number]> = [];
  dailyStrengths.push([attacker.strength(), attacker.totalMorale(), defender.strength(), defender.totalMorale()]);
  while (!attacker.isBroken() && !defender.isBroken() && days < loopLimit) {
    let isFirePhase = (days - dayOffset) % combatPhasePeriod < firePhaseCutoff;
    let roll = 5;
    if (isDefenderUpdated) {
      attacker.setTargets(defender);
    }
    if (isAttackerUpdated) {
      defender.setTargets(attacker);
    }
    //N.B. Do not collapse - casualties must be calculated for both sides before applying them.
    const defenderCasualties = attacker.calculateCasualties(roll, isFirePhase, days, defender.modifiers);
    const attackerCasualties = defender.calculateCasualties(roll, isFirePhase, days, attacker.modifiers);
    attacker.applyCasualtiesAndMoraleDamage(attackerCasualties, defender.modifiers.morale);
    defender.applyCasualtiesAndMoraleDamage(defenderCasualties, attacker.modifiers.morale);
    dailyStrengths.push([attacker.strength(), attacker.totalMorale(), defender.strength(), defender.totalMorale()]);
    isAttackerUpdated = attacker.replaceRegiments();
    isDefenderUpdated = defender.replaceRegiments();
    days++;
  }
  return dailyStrengths;
}

function App() {
  const [infantryCount, setInfantryCount] = useState({attacker: 1, defender: 1});
  const [dailyStrengths, setDailyStrengths] = useState<[number, number, number, number][]>([]);
  let attackerArmyModifierMap: Map<ModifierNames, number> = new Map();
  let defenderArmyModifierMap: Map<ModifierNames, number> = new Map();
  let attackerRegiments: Map<String, number> = new Map();
  let defenderRegiments: Map<String, number> = new Map();

  const handleSubmit: MouseEventHandler = () => {
    const attackerModifiers: Modifiers = Modifiers.createModifiersFromMap(attackerArmyModifierMap);
    const defenderModifiers: Modifiers = Modifiers.createModifiersFromMap(defenderArmyModifierMap);
    const army1 = new Army(attackerRegiments.get("infantry") as number, attackerRegiments.get("cavalry") as number, attackerModifiers);
    const army2 = new Army(defenderRegiments.get("infantry") as number, defenderRegiments.get("cavalry") as number, defenderModifiers);
    setDailyStrengths(combat(army1, army2));
  }

  // const handleInput: ChangeEventHandler<HTMLInputElement> = (event) => {    
  //   const name = event.currentTarget.name;
  //   const value = parseInt(event.currentTarget.value);
  //   setInfantryCount(values => ({...values, [name]:value}))
  // }

  const updateArmyModifiers = (val: Map<ModifierNames, number>, isAttacker: boolean) => {
    if (isAttacker) {
      attackerArmyModifierMap = new Map(val.entries());
    } else {
      defenderArmyModifierMap = new Map(val.entries());
    }
  }

  const updateRegiments = (val: Map<String, number>, isAttacker: boolean) => {
    if (isAttacker) {
      attackerRegiments = new Map(val.entries());
    } else {
      defenderRegiments = new Map(val.entries());
    }
  }

  return (
    <div id="columns" className='App'>
      <div className="full-width">
        <input type='button' value={"Go!"} onClick={handleSubmit}/>
      </div>
      <h2 className="column-heading">Attacker</h2>
      <h2 className="column-heading">Defender</h2>
      <div id="regiment-modifiers" className='collapsing-panel'>
        <h3 className='full-width'>Regiments and Regiment Modifiers</h3>
        {/* <div>
          <label>Infantry:</label>
          <input type="number" name="attacker"
              value= {infantryCount.attacker}
              onChange={handleInput}/>
        </div>
        <div>
          <label>Infantry:</label>
          <input type="number" name="defender"
              value= {infantryCount.defender}
              onChange={handleInput}/>
        </div> */}
        <RegimentsPanel update={updateRegiments} isAttacker={true}/>
        <RegimentsPanel update={updateRegiments} isAttacker={false}/>
      </div>
      <div id="army-modifiers" className='collapsing-panel'>
        <h3 className='full-width'>Army Modifiers</h3>
        <ArmyModifiersPanel update={updateArmyModifiers} isAttacker={true}/>
        <ArmyModifiersPanel update={updateArmyModifiers} isAttacker={false}/>
      </div>
      <table id="casualty-table" className='full-width'>
        <thead>
          <tr>
            <th rowSpan={2}>Day</th>
            <th colSpan={2}>Army 1</th>
            <th colSpan={2}>Army 2</th>
          </tr>
          <tr>
            <th>Strength</th>
            <th>Total Morale</th>
            <th>Strength</th>
            <th>Total Morale</th>
          </tr>
        </thead>
        <tbody>
          {dailyStrengths.map((dailyResults: [number, number, number, number], index: number) => (
            <tr key={index}>
              <td>{index}</td>
              <td>{dailyResults[0]}</td>
              <td>{dailyResults[1].toFixed(2)}</td>
              <td>{dailyResults[2]}</td>
              <td>{dailyResults[3].toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        
      </table>
    </div>

  );
}

export default App;