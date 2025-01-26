import { useState, useEffect } from 'react';
import { executeSelectQuery } from './services/database';
import { fetchDistinctValues } from './services/filters';
import Filters from './components/Filters';
import './App.css';

function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [options, setOptions] = useState({});

  // Fetch distinct values for filters on mount
  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const distinctValues = await fetchDistinctValues(['bus_number', 'company']);
        setOptions(distinctValues);
      } catch (err) {
        console.error('Error fetching filter options:', err);
        setError(err.message);
      }
    }

    loadFilterOptions();
  }, []);

  // Fetch data for the table
  useEffect(() => {
    async function fetchData() {
      try {
        // Base query
        let sql = `
        SELECT
          ST_Area(ST_MakeEnvelope(lng_min, lat_min, lng_max, lat_max)) AS area,
          *
        FROM buses
        `;

        // Build query with filters
        const conditions = [];
        for (const [key, value] of Object.entries(filters)) {
          if (value) {
            conditions.push(`${key} = '${value}'`);
          }
        }
        if (conditions.length > 0) {
          sql += ` WHERE ${conditions.join(' AND ')}`;
        }

        const rows = await executeSelectQuery(sql);
        setResults(rows);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchData();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value || null }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container">
      <h1>Bus Data</h1>

      {/* Filters Component */}
      <Filters options={options} filters={filters} onFilterChange={handleFilterChange} />

      {/* Data Table */}
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