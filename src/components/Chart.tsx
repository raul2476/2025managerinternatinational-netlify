import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ChartProps {
  type: 'bar' | 'line' | 'pie';
  data: any[];
  dataKey: string;
  nameKey: string;
  height?: number;
  valuePrefix?: string;
  colors?: string[];
}

const Chart: React.FC<ChartProps> = ({
  type,
  data,
  dataKey,
  nameKey,
  height = 300,
  valuePrefix = '',
  colors = ['#1E3A8A', '#0D9488', '#F59E0B', '#059669']
}) => {
  const formatValue = (value: number) => {
    return `${valuePrefix}${value.toLocaleString()}`;
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={nameKey} />
            <YAxis />
            <Tooltip formatter={(value) => [formatValue(value as number), '']} />
            <Legend />
            <Bar dataKey={dataKey} fill={colors[0]} />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={nameKey} />
            <YAxis />
            <Tooltip formatter={(value) => [formatValue(value as number), '']} />
            <Legend />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={colors[0]}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey={dataKey}
              nameKey={nameKey}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [formatValue(value as number), '']} />
          </PieChart>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;