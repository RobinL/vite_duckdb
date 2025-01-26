// src/App.jsx
import { useState, useEffect } from 'react';
import { executeSelectQuery } from './services/database';
import './App.css';

function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const sql = `
        SELECT
          ST_Area(ST_MakeEnvelope(lng_min, lat_min, lng_max, lat_max)) AS area,
          *
        FROM buses
        `;
        const rows = await executeSelectQuery(sql);
        setResults(rows);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container">
      <h1>Bus Data</h1>
      {results.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              {Object.keys(results[0]).map(header => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value, i) => (
                  <td key={i}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data found</p>
      )}
    </div>
  );
}

export default App;