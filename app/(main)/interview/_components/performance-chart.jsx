"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { format } from "date-fns";


const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 text-sm bg-[#0a0a0a] border border-gray-700 rounded-lg shadow-lg">
        <p className="label font-semibold">{`${format(new Date(label), "MMM dd, yyyy")}`}</p>
        <p className="intro text-white">{`Score : ${payload[0].value.toFixed(1)}%`}</p>
      </div>
    );
  }
  return null;
};


export default function PerformanceChart({ assessments }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (assessments && assessments.length > 0) {
      const formatted = assessments
        .filter((a) => a.quizScore !== undefined && a.quizScore !== null)
        .map((a) => ({
          time: new Date(a.createdAt).getTime(),
          score: Number(a.quizScore),
        }));
      setChartData(formatted);
    }
  }, [assessments]);

  // A message to show when there is no data yet
  if (!chartData || chartData.length === 0) {
    return (
      <Card className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl shadow-md shadow-black/20">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl">Performance Trend</CardTitle>
          <CardDescription>Your quiz scores over time</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No quiz data yet — complete an assessment to see your progress.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl shadow-md shadow-black/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-[26px] md:text-[30px] font-semibold text-white tracking-tight">
          Performance Trend
        </CardTitle>
        <CardDescription className="text-gray-400 text-[14px]">
          Your quiz scores over time
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-[320px] md:h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            >
              {/* This defines the gradient fill for the Area component */}
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
              </defs>

              {/* A subtle grid in the background */}
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />

              <XAxis
                dataKey="time"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(time) => format(new Date(time), "MMM dd")}
                stroke="rgba(255,255,255,0.5)"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                domain={[0, 100]}
                stroke="rgba(255,255,255,0.5)"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />

              {/* Use the custom styled tooltip */}
              <Tooltip content={<CustomTooltip />} />
              
              {/* The gradient area under the line */}
              <Area
                type="monotone"
                dataKey="score"
                stroke="none"
                fill="url(#chartGradient)"
              />

              {/* The main white line with styled dots */}
              <Line
                type="monotone"
                dataKey="score"
                stroke="#ffffff"
                strokeWidth={2}
                dot={{ r: 4, fill: "#ffffff" }}
                activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}