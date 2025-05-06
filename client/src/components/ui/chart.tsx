import * as React from "react";
import { cn } from "@/lib/utils";

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: {
    name: string;
    value: number;
    color?: string;
    category?: string;
  }[];
  height?: number;
  type?: "bar" | "line";
  showLegend?: boolean;
}

export const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  ({ className, data, height = 200, type = "bar", showLegend = false, ...props }, ref) => {
    // Find the max value for scaling
    const maxValue = Math.max(...data.map((item) => item.value));
    
    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        <div className="chart-container" style={{ height: `${height}px` }}>
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * 100;
            const leftPosition = (index / data.length) * 100;
            const barWidth = 100 / data.length - 2;
            
            return (
              <div
                key={`${item.name}-${index}`}
                className="chart-bar"
                style={{
                  height: `${barHeight}%`,
                  left: `${leftPosition}%`,
                  width: `${barWidth}%`,
                  backgroundColor: item.color || (item.category === "income" ? "#3B82F6" : "#0D9488"),
                }}
                title={`${item.name}: ${item.value}`}
                aria-label={`${item.name}: ${item.value}`}
              />
            );
          })}
        </div>
        
        {showLegend && (
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary-600 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Income</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-secondary-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Spending</span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

Chart.displayName = "Chart";
