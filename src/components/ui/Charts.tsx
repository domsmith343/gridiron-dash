import React, { useMemo, useState, useCallback } from 'react';
import { cn } from '../../utils/cn';

// Chart data types
export interface ChartDataPoint {
  x: number | string;
  y: number;
  label?: string;
  color?: string;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color: string;
  type?: 'line' | 'bar' | 'area';
}

// Base chart component
interface BaseChartProps {
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  className?: string;
}

// Line Chart Component
interface LineChartProps extends BaseChartProps {
  data: ChartSeries[];
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  smooth?: boolean;
}

export function LineChart({ 
  data, 
  width = 600, 
  height = 400,
  margin = { top: 20, right: 30, bottom: 40, left: 40 },
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  smooth = false,
  className 
}: LineChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{ series: number; point: number } | null>(null);
  
  const chartDimensions = {
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  const { xScale, yScale, allPoints } = useMemo(() => {
    const allPoints = data.flatMap(series => series.data);
    const xValues = allPoints.map(p => typeof p.x === 'string' ? 0 : p.x);
    const yValues = allPoints.map(p => p.y);
    
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    
    const xScale = (x: number) => ((x - xMin) / (xMax - xMin)) * chartDimensions.width;
    const yScale = (y: number) => chartDimensions.height - ((y - yMin) / (yMax - yMin)) * chartDimensions.height;
    
    return { xScale, yScale, allPoints };
  }, [data, chartDimensions]);

  const createPath = useCallback((series: ChartSeries) => {
    if (series.data.length === 0) return '';
    
    const points = series.data.map(point => ({
      x: xScale(typeof point.x === 'number' ? point.x : 0),
      y: yScale(point.y),
    }));
    
    if (smooth) {
      // Create smooth curve using quadratic Bezier curves
      let path = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const midX = (prev.x + curr.x) / 2;
        path += ` Q ${prev.x} ${prev.y} ${midX} ${(prev.y + curr.y) / 2}`;
        if (i === points.length - 1) {
          path += ` T ${curr.x} ${curr.y}`;
        }
      }
      return path;
    } else {
      return `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;
    }
  }, [xScale, yScale, smooth]);

  return (
    <div className={cn('relative', className)}>
      <svg width={width} height={height} className="overflow-visible">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid lines */}
          {showGrid && (
            <g className="grid" opacity={0.3}>
              {/* Horizontal grid lines */}
              {Array.from({ length: 5 }, (_, i) => (
                <line
                  key={`h-grid-${i}`}
                  x1={0}
                  y1={(chartDimensions.height / 4) * i}
                  x2={chartDimensions.width}
                  y2={(chartDimensions.height / 4) * i}
                  stroke="currentColor"
                  strokeWidth={1}
                />
              ))}
              {/* Vertical grid lines */}
              {Array.from({ length: 5 }, (_, i) => (
                <line
                  key={`v-grid-${i}`}
                  x1={(chartDimensions.width / 4) * i}
                  y1={0}
                  x2={(chartDimensions.width / 4) * i}
                  y2={chartDimensions.height}
                  stroke="currentColor"
                  strokeWidth={1}
                />
              ))}
            </g>
          )}
          
          {/* Data series */}
          {data.map((series, seriesIndex) => (
            <g key={series.name}>
              {/* Line path */}
              <path
                d={createPath(series)}
                fill="none"
                stroke={series.color}
                strokeWidth={2}
                className="transition-all duration-200"
              />
              
              {/* Data points */}
              {series.data.map((point, pointIndex) => {
                const x = xScale(typeof point.x === 'number' ? point.x : 0);
                const y = yScale(point.y);
                const isHovered = hoveredPoint?.series === seriesIndex && hoveredPoint?.point === pointIndex;
                
                return (
                  <circle
                    key={`${seriesIndex}-${pointIndex}`}
                    cx={x}
                    cy={y}
                    r={isHovered ? 6 : 4}
                    fill={series.color}
                    stroke="white"
                    strokeWidth={2}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredPoint({ series: seriesIndex, point: pointIndex })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })}
            </g>
          ))}
        </g>
      </svg>
      
      {/* Tooltip */}
      {showTooltip && hoveredPoint && (
        <div className="absolute bg-gray-900 text-white p-2 rounded shadow-lg pointer-events-none z-10">
          {(() => {
            const series = data[hoveredPoint.series];
            const point = series.data[hoveredPoint.point];
            return (
              <div>
                <div className="font-medium">{series.name}</div>
                <div>Value: {point.y}</div>
                {point.label && <div>Label: {point.label}</div>}
              </div>
            );
          })()}
        </div>
      )}
      
      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap gap-4 mt-4">
          {data.map(series => (
            <div key={series.name} className="flex items-center gap-2">
              <div 
                className="w-4 h-0.5 rounded"
                style={{ backgroundColor: series.color }}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {series.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Bar Chart Component
interface BarChartProps extends BaseChartProps {
  data: ChartDataPoint[];
  orientation?: 'vertical' | 'horizontal';
  showValues?: boolean;
  barColor?: string;
}

export function BarChart({
  data,
  width = 600,
  height = 400,
  margin = { top: 20, right: 30, bottom: 40, left: 40 },
  orientation = 'vertical',
  showValues = false,
  barColor = '#3B82F6',
  className,
}: BarChartProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  
  const chartDimensions = {
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  const { scale, maxValue } = useMemo(() => {
    const values = data.map(d => d.y);
    const maxValue = Math.max(...values);
    
    if (orientation === 'vertical') {
      const scale = (value: number) => (value / maxValue) * chartDimensions.height;
      return { scale, maxValue };
    } else {
      const scale = (value: number) => (value / maxValue) * chartDimensions.width;
      return { scale, maxValue };
    }
  }, [data, chartDimensions, orientation]);

  const barWidth = orientation === 'vertical' 
    ? chartDimensions.width / data.length * 0.8
    : chartDimensions.height / data.length * 0.8;

  return (
    <div className={cn('relative', className)}>
      <svg width={width} height={height}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {data.map((point, index) => {
            const isHovered = hoveredBar === index;
            const barHeight = scale(point.y);
            
            if (orientation === 'vertical') {
              const x = (chartDimensions.width / data.length) * index + (chartDimensions.width / data.length - barWidth) / 2;
              const y = chartDimensions.height - barHeight;
              
              return (
                <g key={index}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={point.color || barColor}
                    opacity={isHovered ? 0.8 : 1}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                  {showValues && (
                    <text
                      x={x + barWidth / 2}
                      y={y - 5}
                      textAnchor="middle"
                      className="text-xs fill-current"
                    >
                      {point.y}
                    </text>
                  )}
                </g>
              );
            } else {
              const x = 0;
              const y = (chartDimensions.height / data.length) * index + (chartDimensions.height / data.length - barWidth) / 2;
              
              return (
                <g key={index}>
                  <rect
                    x={x}
                    y={y}
                    width={barHeight}
                    height={barWidth}
                    fill={point.color || barColor}
                    opacity={isHovered ? 0.8 : 1}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                  {showValues && (
                    <text
                      x={barHeight + 5}
                      y={y + barWidth / 2}
                      textAnchor="start"
                      dominantBaseline="middle"
                      className="text-xs fill-current"
                    >
                      {point.y}
                    </text>
                  )}
                </g>
              );
            }
          })}
        </g>
      </svg>
    </div>
  );
}

// Pie Chart Component
interface PieChartProps extends BaseChartProps {
  data: ChartDataPoint[];
  showLabels?: boolean;
  showPercentages?: boolean;
  innerRadius?: number;
}

export function PieChart({
  data,
  width = 400,
  height = 400,
  showLabels = true,
  showPercentages = true,
  innerRadius = 0,
  className,
}: PieChartProps) {
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  
  const center = { x: width / 2, y: height / 2 };
  const radius = Math.min(width, height) / 2 - 20;
  
  const { slices, total } = useMemo(() => {
    const total = data.reduce((sum, point) => sum + point.y, 0);
    let cumulativeAngle = 0;
    
    const slices = data.map((point, index) => {
      const angle = (point.y / total) * 2 * Math.PI;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      cumulativeAngle += angle;
      
      // Calculate path for arc
      const largeArcFlag = angle > Math.PI ? 1 : 0;
      const x1 = center.x + radius * Math.cos(startAngle);
      const y1 = center.y + radius * Math.sin(startAngle);
      const x2 = center.x + radius * Math.cos(endAngle);
      const y2 = center.y + radius * Math.sin(endAngle);
      
      let path = `M ${center.x} ${center.y}`;
      path += ` L ${x1} ${y1}`;
      path += ` A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
      path += ' Z';
      
      // If there's an inner radius (donut chart)
      if (innerRadius > 0) {
        const innerX1 = center.x + innerRadius * Math.cos(startAngle);
        const innerY1 = center.y + innerRadius * Math.sin(startAngle);
        const innerX2 = center.x + innerRadius * Math.cos(endAngle);
        const innerY2 = center.y + innerRadius * Math.sin(endAngle);
        
        path = `M ${x1} ${y1}`;
        path += ` A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
        path += ` L ${innerX2} ${innerY2}`;
        path += ` A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1}`;
        path += ' Z';
      }
      
      // Label position
      const labelAngle = startAngle + angle / 2;
      const labelRadius = radius + 20;
      const labelX = center.x + labelRadius * Math.cos(labelAngle);
      const labelY = center.y + labelRadius * Math.sin(labelAngle);
      
      return {
        path,
        color: point.color || `hsl(${(index * 360) / data.length}, 70%, 50%)`,
        label: point.label || point.x,
        value: point.y,
        percentage: (point.y / total) * 100,
        labelX,
        labelY,
        angle: labelAngle,
      };
    });
    
    return { slices, total };
  }, [data, center, radius, innerRadius]);

  return (
    <div className={cn('relative', className)}>
      <svg width={width} height={height}>
        {slices.map((slice, index) => {
          const isHovered = hoveredSlice === index;
          
          return (
            <g key={index}>
              <path
                d={slice.path}
                fill={slice.color}
                opacity={isHovered ? 0.8 : 1}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredSlice(index)}
                onMouseLeave={() => setHoveredSlice(null)}
              />
              
              {showLabels && (
                <text
                  x={slice.labelX}
                  y={slice.labelY}
                  textAnchor={slice.angle > Math.PI / 2 && slice.angle < 3 * Math.PI / 2 ? 'end' : 'start'}
                  dominantBaseline="middle"
                  className="text-xs fill-current pointer-events-none"
                >
                  {slice.label}
                  {showPercentages && ` (${slice.percentage.toFixed(1)}%)`}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Progress Chart Component
interface ProgressChartProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showValue?: boolean;
  className?: string;
}

export function ProgressChart({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  color = '#3B82F6',
  backgroundColor = '#E5E7EB',
  showValue = true,
  className,
}: ProgressChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - progress);
  
  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={backgroundColor}
          fill="none"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold">
            {Math.round((progress * 100))}%
          </span>
        </div>
      )}
    </div>
  );
}
