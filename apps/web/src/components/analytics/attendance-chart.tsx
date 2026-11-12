'use client';

import React, { useState } from 'react';
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
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, LineChart as LineChartIcon } from 'lucide-react';

export interface ChartDataPoint {
  date: string;
  name?: string;
  present: number;
  late: number;
  absent: number;
  excused: number;
  rate?: number;
}

interface AttendanceChartProps {
  data?: ChartDataPoint[];
  title?: string;
  description?: string;
  defaultChartType?: 'bar' | 'line';
}

const DEFAULT_DATA: ChartDataPoint[] = [
  { date: 'Mon, Oct 2', name: 'Week 1', present: 38, late: 4, absent: 3, excused: 0, rate: 84 },
  { date: 'Wed, Oct 4', name: 'Week 2', present: 41, late: 2, absent: 2, excused: 0, rate: 91 },
  { date: 'Mon, Oct 9', name: 'Week 3', present: 36, late: 6, absent: 3, excused: 0, rate: 80 },
  { date: 'Wed, Oct 11', name: 'Week 4', present: 39, late: 3, absent: 2, excused: 1, rate: 87 },
  { date: 'Mon, Oct 16', name: 'Week 5', present: 42, late: 1, absent: 1, excused: 1, rate: 93 },
  { date: 'Wed, Oct 18', name: 'Week 6', present: 37, late: 4, absent: 4, excused: 0, rate: 82 },
  { date: 'Mon, Oct 23', name: 'Week 7', present: 40, late: 3, absent: 2, excused: 0, rate: 89 },
];

export function AttendanceChart({
  data = DEFAULT_DATA,
  title = 'Attendance Trend & Breakdown',
  description = 'Weekly lecture turnout across courses',
  defaultChartType = 'bar',
}: AttendanceChartProps) {
  const [chartType, setChartType] = useState<'bar' | 'line'>(defaultChartType);

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-2">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <CardDescription className="text-xs">{description}</CardDescription>
        </div>
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
          <Button
            variant={chartType === 'bar' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setChartType('bar')}
            className="h-7 px-2.5 text-xs gap-1.5"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Bar
          </Button>
          <Button
            variant={chartType === 'line' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setChartType('line')}
            className="h-7 px-2.5 text-xs gap-1.5"
          >
            <LineChartIcon className="h-3.5 w-3.5" />
            Trend
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tickMargin={8}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="present" name="Present" fill="#10B981" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="late" name="Late" fill="#F59E0B" radius={[0, 0, 0, 0]} stackId="a" />
                <Bar dataKey="excused" name="Excused" fill="#64748B" radius={[0, 0, 0, 0]} stackId="a" />
                <Bar dataKey="absent" name="Absent" fill="#F43F5E" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            ) : (
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  domain={[0, 100]}
                  unit="%"
                  tickMargin={8}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${value}%`, 'Attendance Rate']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="rate"
                  name="Attendance %"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

