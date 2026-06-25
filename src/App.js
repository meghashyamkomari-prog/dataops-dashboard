import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

const pipelines = [
  { name: 'Financial Data Pipeline', status: 'PASSING', records: '1,255+', sla: '99.9%' },
  { name: 'Healthcare Analytics Pipeline', status: 'PASSING', records: '10,000+', sla: '99.9%' },
  { name: 'LLM Transaction Classifier', status: 'PASSING', records: '5,000+', sla: '99.9%' },
];

const qualityData = [
  { name: 'Nulls', score: 100 },
  { name: 'Duplicates', score: 100 },
  { name: 'Schema', score: 100 },
];

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: '#1e293b', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
      <div style={{ fontSize: '28px', fontWeight: 'bold', color: color }}>{value}</div>
      <div style={{ color: '#64748b', fontSize: '14px', marginTop: '5px' }}>{label}</div>
    </div>
  );
}

function App() {
  const [health, setHealth] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(API_URL + '/datasets/health')
      .then(res => setHealth(res.data))
      .catch(() => setHealth({ status: 'offline' }));
  }, []);

  const runScan = async () => {
    setLoading(true);
    try {
      const res = await axios.post(API_URL + '/datasets/scan', {
        connection_string: "postgresql://postgres:Mad%4012345@localhost:5432/financial_db",
        table_name: "raw_stock_prices",
        checks: ["nulls", "duplicates", "schema_drift"]
      });
      setScanResult(res.data);
    } catch (e) {
      setScanResult({ error: "Scan failed" });
    }
    setLoading(false);
  };

  const apiStatus = health && health.status === 'healthy' ? 'Online' : 'Offline';
  const apiColor = health && health.status === 'healthy' ? '#4ade80' : '#f87171';

  return (
    <div style={{ fontFamily: 'Arial', background: '#0f172a', minHeight: '100vh', color: 'white', padding: '20px' }}>
      <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '20px', marginBottom: '30px' }}>
        <h1 style={{ color: '#38bdf8', margin: 0 }}>DataOps Dashboard</h1>
        <p style={{ color: '#64748b', margin: '5px 0 0' }}>Enterprise Pipeline Monitoring</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '30px' }}>
        <StatCard label="Active Pipelines" value="3" color="#38bdf8" />
        <StatCard label="Records/Day" value="18M+" color="#4ade80" />
        <StatCard label="SLA Compliance" value="99.9%" color="#4ade80" />
        <StatCard label="API Status" value={apiStatus} color={apiColor} />
      </div>

      <div style={{ background: '#1e293b', borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
        <h2 style={{ color: '#38bdf8', marginTop: 0 }}>Pipeline Status</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155' }}>
              <th style={{ textAlign: 'left', padding: '10px', color: '#64748b' }}>Pipeline</th>
              <th style={{ textAlign: 'left', padding: '10px', color: '#64748b' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '10px', color: '#64748b' }}>Records/Day</th>
              <th style={{ textAlign: 'left', padding: '10px', color: '#64748b' }}>SLA</th>
            </tr>
          </thead>
          <tbody>
            {pipelines.map(function(p, i) {
              return (
                <tr key={i} style={{ borderBottom: '1px solid #0f172a' }}>
                  <td style={{ padding: '12px 10px' }}>{p.name}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{ background: '#064e3b', color: '#4ade80', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', color: '#94a3b8' }}>{p.records}</td>
                  <td style={{ padding: '12px 10px', color: '#4ade80' }}>{p.sla}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#1e293b', borderRadius: '12px', padding: '20px' }}>
          <h2 style={{ color: '#38bdf8', marginTop: 0 }}>Data Quality Scores</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={qualityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
              <Bar dataKey="score" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#1e293b', borderRadius: '12px', padding: '20px' }}>
          <h2 style={{ color: '#38bdf8', marginTop: 0 }}>Live Quality Scan</h2>
          <button
            onClick={runScan}
            disabled={loading}
            style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '15px' }}
          >
            {loading ? 'Scanning...' : 'Run Quality Scan'}
          </button>
          {scanResult && (
            <div>
              <div style={{ color: '#4ade80', marginBottom: '10px' }}>
                Score: {scanResult.overall_score ? (scanResult.overall_score * 100).toFixed(1) + '%' : 'Error'}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '14px' }}>{scanResult.ai_summary}</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'center', color: '#334155', fontSize: '12px' }}>
        Built by Meghashyam Komari | Data Engineer
      </div>
    </div>
  );
}

export default App;
