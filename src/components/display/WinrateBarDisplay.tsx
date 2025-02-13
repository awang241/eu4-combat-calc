import "./WinrateBarDisplay.css";
type Props = {
    attackerWinChance: number,
    attackerStackwipeChance?: number,
    defenderWinChance: number,
    defenderStackwipeChance?: number,
}

type Section = {
    percentWidth: number,
    backgroundColor: string,
}

export default function WinrateBarDisplay({
    attackerStackwipeChance,
    attackerWinChance,
    defenderStackwipeChance,
    defenderWinChance,
}: Props) {
    let sections: Section[] = [];
    if (attackerWinChance < 0 || defenderWinChance < 0 || attackerWinChance + defenderWinChance > 100) {
        sections = []
    } else {
        const drawChance = 100 - attackerWinChance - defenderWinChance;
        sections = [];
        if (attackerWinChance > 0) {
            let winrateBarWidth = Math.max(1, attackerWinChance);
            if ((attackerStackwipeChance ?? 0) > 0 ) {
                const stackwipeBarWidth = Math.max(1, attackerStackwipeChance ?? 0);
                winrateBarWidth -= stackwipeBarWidth;
                sections.push({percentWidth: stackwipeBarWidth, backgroundColor: "blue"})
                if (winrateBarWidth > 0) {
                    sections.push({percentWidth: winrateBarWidth, backgroundColor: "lightblue"})
                }
            } else {
                sections.push({percentWidth: winrateBarWidth, backgroundColor: "lightblue"})
            }
        }
        if (drawChance > 0) {
            const barWidth = drawChance;
            sections.push({percentWidth: barWidth, backgroundColor: "lightgray"})
        }
        if (defenderWinChance > 0) {
            let winrateBarWidth = Math.max(5, defenderWinChance);
            if ((attackerStackwipeChance ?? 0) > 0 ) {
                const stackwipeBarWidth = Math.max(1, attackerStackwipeChance ?? 0);
                winrateBarWidth -= stackwipeBarWidth;
                sections.push({percentWidth: winrateBarWidth, backgroundColor: "pink"})
                if (winrateBarWidth > 0) {
                    sections.push({percentWidth: stackwipeBarWidth, backgroundColor: "red"})
                } 
            } else {
                sections.push({percentWidth: winrateBarWidth, backgroundColor: "pink"})
            }
        }
    }
    return (
        <div className="winrate-bar-display">
            <div className="bar">
                {sections.map((section, index) => 
                    <div 
                        key={index}
                        className="bar-section" 
                        style={{
                            backgroundColor: section.backgroundColor,
                            width: `${section.percentWidth}%`
                        }}
                    />
                )}
            </div>
        </div>
    )
}