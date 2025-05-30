import React, { useEffect, useRef } from 'react';

interface PlayerStatsRadarChartProps {
  playerName: string;
  stats: {
    category: string;
    value: number;
    maxValue: number;
  }[];
  color: string;
  className?: string;
}

const PlayerStatsRadarChart: React.FC<PlayerStatsRadarChartProps> = ({ 
  playerName, 
  stats, 
  color,
  className = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const size = Math.min(canvas.width, canvas.height);
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4; // Leave some margin
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background grid
    drawGrid(ctx, centerX, centerY, radius, stats.length);
    
    // Draw data
    drawData(ctx, centerX, centerY, radius, stats, color);
    
    // Draw labels
    drawLabels(ctx, centerX, centerY, radius, stats);
    
    // Draw player name in the center
    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(playerName, centerX, centerY);
    
  }, [playerName, stats, color]);
  
  // Draw the background grid
  const drawGrid = (
    ctx: CanvasRenderingContext2D, 
    centerX: number, 
    centerY: number, 
    radius: number, 
    sides: number
  ) => {
    // Draw concentric circles
    const levels = 4; // Number of grid levels
    
    for (let i = 1; i <= levels; i++) {
      const levelRadius = (radius * i) / levels;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, levelRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // Draw radial lines
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides - Math.PI / 2; // Start from top
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + radius * Math.cos(angle),
        centerY + radius * Math.sin(angle)
      );
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };
  
  // Draw the data polygon
  const drawData = (
    ctx: CanvasRenderingContext2D, 
    centerX: number, 
    centerY: number, 
    radius: number, 
    stats: PlayerStatsRadarChartProps['stats'],
    color: string
  ) => {
    ctx.beginPath();
    
    stats.forEach((stat, i) => {
      const angle = (Math.PI * 2 * i) / stats.length - Math.PI / 2; // Start from top
      const value = stat.value / stat.maxValue; // Normalize to 0-1
      const x = centerX + radius * value * Math.cos(angle);
      const y = centerY + radius * value * Math.sin(angle);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.closePath();
    ctx.fillStyle = `${color}33`; // Add transparency
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw data points
    stats.forEach((stat, i) => {
      const angle = (Math.PI * 2 * i) / stats.length - Math.PI / 2;
      const value = stat.value / stat.maxValue;
      const x = centerX + radius * value * Math.cos(angle);
      const y = centerY + radius * value * Math.sin(angle);
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });
  };
  
  // Draw category labels
  const drawLabels = (
    ctx: CanvasRenderingContext2D, 
    centerX: number, 
    centerY: number, 
    radius: number, 
    stats: PlayerStatsRadarChartProps['stats']
  ) => {
    ctx.fillStyle = '#555';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    
    stats.forEach((stat, i) => {
      const angle = (Math.PI * 2 * i) / stats.length - Math.PI / 2;
      const x = centerX + (radius + 15) * Math.cos(angle);
      const y = centerY + (radius + 15) * Math.sin(angle);
      
      // Adjust text alignment based on position
      if (Math.abs(angle) < Math.PI / 4 || Math.abs(angle) > Math.PI * 3 / 4) {
        ctx.textAlign = 'center';
      } else if (angle < 0) {
        ctx.textAlign = 'right';
      } else {
        ctx.textAlign = 'left';
      }
      
      ctx.fillText(stat.category, x, y);
      ctx.textAlign = 'center';
      ctx.fillText(stat.value.toString(), x, y + 12);
    });
  };
  
  return (
    <div className={`player-stats-radar ${className}`}>
      <canvas 
        ref={canvasRef} 
        width="300" 
        height="300" 
        className="w-full h-auto"
      ></canvas>
    </div>
  );
};

export default PlayerStatsRadarChart;
