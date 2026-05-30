import { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import api from '../lib/api';

export default function PredictiveTrendChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    api.get('/analytics/predictions')
      .then(res => setData(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        console.warn('[Predictions] Fetch failed:', err);
        setData([]);
      });
  }, []);

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={Array.isArray(data) ? data : []}>
          <defs>
            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="hour" 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}}
            tickFormatter={(val) => `${val}h`}
            interval={3}
          />
          <YAxis hide />
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '10px' }}
            cursor={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '3 3' }}
            formatter={(value) => [Math.round(Number(value)), 'Predicted Vehicles']}
            labelFormatter={(label) => `T+${label} Hours`}
          />
          <Area 
            type="monotone" 
            dataKey="predictedCount" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPredicted)" 
            animationDuration={1500}
            strokeDasharray="5 5"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
