import React from 'react';

interface TeamComparisonChartProps {
  team1Name: string;
  team2Name: string;
  team1Color: string;
  team2Color: string;
  data: {
    category: string;
    team1Value: number;
    team2Value: number;
    higherIsBetter?: boolean;
  }[];
}

const TeamComparisonChart: React.FC<TeamComparisonChartProps> = ({
  team1Name,
  team2Name,
  team1Color,
  team2Color,
  data
}) => {
  // Find the maximum value for scaling
  const maxValue = Math.max(
    ...data.map(item => Math.max(item.team1Value, item.team2Value))
  );
  
  // Calculate bar widths as percentages of the maximum value
  const getBarWidth = (value: number) => {
    return `${(value / maxValue) * 100}%`;
  };
  
  // Determine which team has the better value for a specific category
  const getBetterTeam = (item: TeamComparisonChartProps['data'][0]) => {
    const { team1Value, team2Value, higherIsBetter = true } = item;
    if (team1Value === team2Value) return null;
    
    return higherIsBetter 
      ? (team1Value > team2Value ? 1 : 2)
      : (team1Value < team2Value ? 1 : 2);
  };

  return (
    <div className="team-comparison-chart">
      <div className="flex justify-between mb-4">
        <div className="flex items-center">
          <div 
             className="w-4 h-4 rounded-full mr-2 team1-color-indicator"
             style={{
               // @ts-ignore
               '--team-color': team1Color
             } as React.CSSProperties}
             aria-hidden="true"
           ></div>
          <span className="text-sm font-medium">{team1Name}</span>
        </div>
        <div className="flex items-center">
          <div 
             className="w-4 h-4 rounded-full mr-2 team2-color-indicator"
             style={{
               // @ts-ignore
               '--team-color': team2Color
             } as React.CSSProperties}
             aria-hidden="true"
           ></div>
          <span className="text-sm font-medium">{team2Name}</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {data.map((item, index) => {
          const betterTeam = getBetterTeam(item);
          
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>{item.team1Value}</span>
                <span className="font-medium">{item.category}</span>
                <span>{item.team2Value}</span>
              </div>
              
              <div className="flex h-6 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                {/* Team 1 Bar */}
                <div 
                   className={`h-full flex justify-end items-center transition-all duration-500 team1-bar ${
                     betterTeam === 1 ? 'bg-green-500 dark:bg-green-600' : 'bg-blue-500 dark:bg-blue-600'
                   }`}
                   style={{
                     // @ts-ignore
                     '--bar-width': getBarWidth(item.team1Value),
                     '--bar-color': team1Color
                   } as React.CSSProperties}
                 >
                  {item.team1Value > (maxValue * 0.15) && (
                    <span className="px-2 text-xs text-white font-bold">{item.team1Value}</span>
                  )}
                </div>
                
                {/* Divider */}
                <div className="w-1 h-full bg-gray-100 dark:bg-gray-800 z-10"></div>
                
                {/* Team 2 Bar */}
                <div 
                   className={`h-full flex justify-start items-center transition-all duration-500 team2-bar ${
                     betterTeam === 2 ? 'bg-green-500 dark:bg-green-600' : 'bg-blue-500 dark:bg-blue-600'
                   }`}
                   style={{
                     // @ts-ignore
                     '--bar-width': getBarWidth(item.team2Value),
                     '--bar-color': team2Color
                   } as React.CSSProperties}
                 >
                  {item.team2Value > (maxValue * 0.15) && (
                    <span className="px-2 text-xs text-white font-bold">{item.team2Value}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamComparisonChart;
