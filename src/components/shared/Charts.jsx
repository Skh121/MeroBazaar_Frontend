import { useMemo } from "react";

// Simple Bar Chart Component
export const BarChart = ({
  data,
  xKey,
  yKey,
  width = 400,
  height = 250,
  color = "#10b981",
  className = "",
}) => {
  const { bars, maxValue, xLabels } = useMemo(() => {
    if (!data || data.length === 0) return { bars: [], maxValue: 0, xLabels: [] };

    const maxVal = Math.max(...data.map((d) => d[yKey] || 0));
    const barWidth = (width - 60) / data.length - 10;

    const bars = data.map((d, i) => ({
      x: 50 + i * (barWidth + 10),
      height: maxVal > 0 ? ((d[yKey] || 0) / maxVal) * (height - 60) : 0,
      value: d[yKey] || 0,
      label: d[xKey],
    }));

    return { bars, maxValue: maxVal, xLabels: data.map((d) => d[xKey]) };
  }, [data, xKey, yKey, width, height]);

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  const barWidth = (width - 60) / data.length - 10;

  return (
    <svg width={width} height={height} className={className}>
      {/* Y-axis */}
      <line x1="45" y1="10" x2="45" y2={height - 40} stroke="#e5e7eb" strokeWidth="1" />

      {/* X-axis */}
      <line x1="45" y1={height - 40} x2={width - 10} y2={height - 40} stroke="#e5e7eb" strokeWidth="1" />

      {/* Bars */}
      {bars.map((bar, i) => (
        <g key={i}>
          <rect
            x={bar.x}
            y={height - 40 - bar.height}
            width={barWidth}
            height={bar.height}
            fill={color}
            rx="4"
            className="transition-all duration-300 hover:opacity-80"
          />
          {/* Value label */}
          <text
            x={bar.x + barWidth / 2}
            y={height - 45 - bar.height}
            textAnchor="middle"
            fontSize="10"
            fill="#6b7280"
          >
            {bar.value}
          </text>
          {/* X-axis label */}
          <text
            x={bar.x + barWidth / 2}
            y={height - 25}
            textAnchor="middle"
            fontSize="9"
            fill="#9ca3af"
            className="truncate"
          >
            {String(bar.label).slice(0, 8)}
          </text>
        </g>
      ))}

      {/* Y-axis labels */}
      <text x="5" y="15" fontSize="10" fill="#9ca3af">
        {maxValue}
      </text>
      <text x="5" y={height - 40} fontSize="10" fill="#9ca3af">
        0
      </text>
    </svg>
  );
};

// Line Chart Component
export const LineChart = ({
  data,
  xKey,
  yKey,
  width = 400,
  height = 250,
  color = "#10b981",
  className = "",
}) => {
  const { points, path, maxValue } = useMemo(() => {
    if (!data || data.length === 0) return { points: [], path: "", maxValue: 0 };

    const maxVal = Math.max(...data.map((d) => d[yKey] || 0));
    const xStep = (width - 70) / (data.length - 1 || 1);

    const pts = data.map((d, i) => ({
      x: 50 + i * xStep,
      y: maxVal > 0 ? height - 40 - ((d[yKey] || 0) / maxVal) * (height - 60) : height - 40,
      value: d[yKey] || 0,
      label: d[xKey],
    }));

    const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

    return { points: pts, path: pathD, maxValue: maxVal };
  }, [data, xKey, yKey, width, height]);

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <svg width={width} height={height} className={className}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
        <line
          key={i}
          x1="45"
          y1={height - 40 - ratio * (height - 60)}
          x2={width - 10}
          y2={height - 40 - ratio * (height - 60)}
          stroke="#f3f4f6"
          strokeWidth="1"
        />
      ))}

      {/* Y-axis */}
      <line x1="45" y1="10" x2="45" y2={height - 40} stroke="#e5e7eb" strokeWidth="1" />

      {/* X-axis */}
      <line x1="45" y1={height - 40} x2={width - 10} y2={height - 40} stroke="#e5e7eb" strokeWidth="1" />

      {/* Line */}
      <path d={path} fill="none" stroke={color} strokeWidth="2" className="transition-all duration-300" />

      {/* Area fill */}
      <path
        d={`${path} L ${points[points.length - 1]?.x || 0} ${height - 40} L 50 ${height - 40} Z`}
        fill={color}
        fillOpacity="0.1"
      />

      {/* Points */}
      {points.map((point, i) => (
        <g key={i}>
          <circle cx={point.x} cy={point.y} r="4" fill={color} className="transition-all duration-300" />
          {i % Math.ceil(points.length / 6) === 0 && (
            <text x={point.x} y={height - 25} textAnchor="middle" fontSize="9" fill="#9ca3af">
              {String(point.label).slice(5, 10)}
            </text>
          )}
        </g>
      ))}

      {/* Y-axis labels */}
      <text x="5" y="15" fontSize="10" fill="#9ca3af">
        {maxValue}
      </text>
      <text x="5" y={height - 40} fontSize="10" fill="#9ca3af">
        0
      </text>
    </svg>
  );
};

// Pie Chart Component
export const PieChart = ({
  data,
  nameKey,
  valueKey,
  width = 250,
  height = 250,
  colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"],
  className = "",
}) => {
  const { slices, total } = useMemo(() => {
    if (!data || data.length === 0) return { slices: [], total: 0 };

    const totalVal = data.reduce((sum, d) => sum + (d[valueKey] || 0), 0);
    let currentAngle = -90;

    const slices = data.map((d, i) => {
      const value = d[valueKey] || 0;
      const percentage = totalVal > 0 ? (value / totalVal) * 100 : 0;
      const angle = (percentage / 100) * 360;

      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const radius = Math.min(width, height) / 2 - 20;
      const cx = width / 2;
      const cy = height / 2;

      const x1 = cx + radius * Math.cos(startRad);
      const y1 = cy + radius * Math.sin(startRad);
      const x2 = cx + radius * Math.cos(endRad);
      const y2 = cy + radius * Math.sin(endRad);

      const largeArc = angle > 180 ? 1 : 0;

      const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      return {
        path,
        color: colors[i % colors.length],
        name: d[nameKey],
        value,
        percentage: percentage.toFixed(1),
      };
    });

    return { slices, total: totalVal };
  }, [data, nameKey, valueKey, width, height, colors]);

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg width={width} height={height}>
        {slices.map((slice, i) => (
          <path
            key={i}
            d={slice.path}
            fill={slice.color}
            className="transition-all duration-300 hover:opacity-80"
          />
        ))}
      </svg>
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {slices.map((slice, i) => (
          <div key={i} className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: slice.color }} />
            <span className="text-gray-600">
              {slice.name}: {slice.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Donut Chart Component
export const DonutChart = ({
  data,
  nameKey,
  valueKey,
  width = 200,
  height = 200,
  colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"],
  className = "",
}) => {
  const { slices, total } = useMemo(() => {
    if (!data || data.length === 0) return { slices: [], total: 0 };

    const totalVal = data.reduce((sum, d) => sum + (d[valueKey] || 0), 0);
    let currentAngle = -90;

    const outerRadius = Math.min(width, height) / 2 - 10;
    const innerRadius = outerRadius * 0.6;
    const cx = width / 2;
    const cy = height / 2;

    const slices = data.map((d, i) => {
      const value = d[valueKey] || 0;
      const percentage = totalVal > 0 ? (value / totalVal) * 100 : 0;
      const angle = (percentage / 100) * 360;

      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1Outer = cx + outerRadius * Math.cos(startRad);
      const y1Outer = cy + outerRadius * Math.sin(startRad);
      const x2Outer = cx + outerRadius * Math.cos(endRad);
      const y2Outer = cy + outerRadius * Math.sin(endRad);

      const x1Inner = cx + innerRadius * Math.cos(endRad);
      const y1Inner = cy + innerRadius * Math.sin(endRad);
      const x2Inner = cx + innerRadius * Math.cos(startRad);
      const y2Inner = cy + innerRadius * Math.sin(startRad);

      const largeArc = angle > 180 ? 1 : 0;

      const path = `
        M ${x1Outer} ${y1Outer}
        A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2Outer} ${y2Outer}
        L ${x1Inner} ${y1Inner}
        A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x2Inner} ${y2Inner}
        Z
      `;

      return {
        path,
        color: colors[i % colors.length],
        name: d[nameKey],
        value,
        percentage: percentage.toFixed(1),
      };
    });

    return { slices, total: totalVal };
  }, [data, nameKey, valueKey, width, height, colors]);

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <svg width={width} height={height} className={className}>
      {slices.map((slice, i) => (
        <path key={i} d={slice.path} fill={slice.color} className="transition-all duration-300 hover:opacity-80" />
      ))}
      <text x={width / 2} y={height / 2} textAnchor="middle" dy="0.35em" fontSize="16" fontWeight="bold" fill="#374151">
        {total}
      </text>
      <text x={width / 2} y={height / 2 + 18} textAnchor="middle" fontSize="10" fill="#9ca3af">
        Total
      </text>
    </svg>
  );
};

// Funnel Chart Component
export const FunnelChart = ({
  data,
  width = 300,
  height = 200,
  colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"],
  className = "",
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const stepHeight = (height - 20) / data.length;

  return (
    <svg width={width} height={height} className={className}>
      {data.map((item, i) => {
        const widthRatio = maxValue > 0 ? item.value / maxValue : 0;
        const barWidth = (width - 120) * widthRatio;
        const x = (width - 120 - barWidth) / 2 + 60;
        const y = 10 + i * stepHeight;

        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={stepHeight - 5}
              fill={colors[i % colors.length]}
              rx="4"
              className="transition-all duration-300"
            />
            <text x="5" y={y + stepHeight / 2} fontSize="10" fill="#6b7280" dy="0.35em">
              {item.name}
            </text>
            <text x={width - 10} y={y + stepHeight / 2} fontSize="10" fill="#374151" dy="0.35em" textAnchor="end">
              {item.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
