import React, { useState, useEffect } from 'react';

export default function App() {
  const [selectedUser, setSelectedUser] = useState('user_01');
  const [synastryData, setSynastryData] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCosmicData = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const [synastryRes, patternsRes] = await Promise.all([
        fetch(`http://localhost:5001/api/synastry/${userId}`),
        fetch(`http://localhost:5001/api/patterns/${userId}`)
      ]);

      if (!synastryRes.ok || !patternsRes.ok) {
        const errPayload = !synastryRes.ok ? await synastryRes.json() : await patternsRes.json();
        throw new Error(errPayload.message || "Failed to fetch network placements.");
      }

      const synastryJson = await synastryRes.json();
      const patternsJson = await patternsRes.json();

      setSynastryData(synastryJson.data || []);
      setPatterns(patternsJson.patterns || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCosmicData(selectedUser);
  }, [selectedUser]);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ borderBottom: '1px solid #334155', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <h1 style={{ color: '#c084fc', fontSize: '2.25rem', margin: '0 0 0.5rem 0' }}>✨ AstroNet Engine</h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>Advanced Synastry & Geometric Astral Network Compatibility Analyzer (CognoDB Free-Tier Optimization)</p>
      </header>

      {error && (
        <div style={{ backgroundColor: '#7f1d1d', border: '1px solid #f87171', color: '#fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <strong>⚠️ Active Operational Alert:</strong> {error}
        </div>
      )}

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <label htmlFor="userSelect" style={{ fontWeight: '600' }}>Active Subject Profile:</label>
        <select 
          id="userSelect"
          value={selectedUser} 
          onChange={(e) => setSelectedUser(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#1e293b', color: '#fff', fontSize: '1rem' }}
        >
          <option value="user_01">Aria Vance (Sun Scorpio)</option>
          <option value="user_02">Leo Sterling (Sun Leo)</option>
          <option value="user_03">Nova Rayne (Sun Gemini)</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <section style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#e2e8f0', marginTop: 0, borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>🔷 Chart Formations</h2>
          {loading ? (
            <div style={{ padding: '1rem 0', color: '#94a3b8', fontStyle: 'italic' }}>Calculating configurations...</div>
          ) : patterns.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No high-order closed loop trines detected in seed state.</p>
          ) : (
            patterns.map((pattern, idx) => (
              <div key={idx} style={{ backgroundColor: '#312e81', border: '1px solid #4338ca', padding: '0.75rem', borderRadius: '6px', margin: '0.5rem 0', color: '#e0e7ff', fontSize: '0.9rem' }}>
                🔺 {pattern}
              </div>
            ))
          )}
        </section>

        <section style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#e2e8f0', marginTop: 0, borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>🔗 Multi-Hop Compatibility Paths</h2>
          {loading ? (
            <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>Traversing graph network paths...</div>
          ) : synastryData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
              <div style={{ fontSize: '2rem' }}>🌌</div>
              <p>Populate your database using seed.js to reveal live relationship paths.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {synastryData.map((item, idx) => (
                <div key={idx} style={{ padding: '1rem', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #475569' }}>
                  <span style={{ color: '#a855f7', fontWeight: 'bold' }}>{item.matchName}</span>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    My <strong>{item.myPlanet}</strong> links with their stellar cluster via a <strong>{item.aspect}</strong> in {item.sign}.
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
