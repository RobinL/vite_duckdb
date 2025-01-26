import { useState, useEffect } from 'react'
import * as duckdb from '@duckdb/duckdb-wasm'
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url'
import duckdb_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url'
import './App.css'

function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function initDuckDB() {
      try {
        // Initialize DuckDB with eh bundle
        const DUCKDB_BUNDLES = {
          eh: {
            mainModule: duckdb_wasm,
            mainWorker: duckdb_worker,
          },
        };

        // Select the bundle
        const bundle = await duckdb.selectBundle(DUCKDB_BUNDLES);
        const worker = new Worker(bundle.mainWorker);
        const logger = new duckdb.ConsoleLogger();
        const db = new duckdb.AsyncDuckDB(logger, worker);
        await db.instantiate(bundle.mainModule, { query: { castBigIntToDouble: true } });

        // Load the database file
        const response = await fetch('/db.duckdb');
        const arrayBuffer = await response.arrayBuffer();
        await db.registerFileBuffer('db.duckdb', new Uint8Array(arrayBuffer));

        // Create a connection and run query
        const conn = await db.connect();
        await conn.query("ATTACH DATABASE 'db.duckdb' AS attached_db");
        await conn.query("USE attached_db");
        await conn.query("LOAD spatial;");

        const sql = `
        select
         ST_Area(ST_MakeEnvelope(lng_min, lat_min, lng_max, lat_max)) AS area,
         *
        from buses
        `
        const result = await conn.query(sql);

        const rows = result.toArray().map(row => {
          return row.toJSON();
        });

        setResults(rows);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    initDuckDB();
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

export default App
