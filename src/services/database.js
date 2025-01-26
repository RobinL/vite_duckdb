// src/services/database.js
import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import duckdb_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';

let dbInstance = null;
let connection = null;
let initializationPromise = null; // A promise to handle concurrent initialization

export async function initializeDatabase() {
    if (initializationPromise) {
        // If initialization is already in progress, wait for it
        return initializationPromise;
    }

    initializationPromise = (async () => {
        if (dbInstance && connection) {
            return { db: dbInstance, conn: connection };
        }

        const DUCKDB_BUNDLES = {
            eh: {
                mainModule: duckdb_wasm,
                mainWorker: duckdb_worker,
            },
        };

        const bundle = await duckdb.selectBundle(DUCKDB_BUNDLES);
        const worker = new Worker(bundle.mainWorker);
        const logger = new duckdb.ConsoleLogger();
        dbInstance = new duckdb.AsyncDuckDB(logger, worker);

        await dbInstance.instantiate(bundle.mainModule, { query: { castBigIntToDouble: true } });

        // Load the database file
        const response = await fetch('/db.duckdb');
        const arrayBuffer = await response.arrayBuffer();
        await dbInstance.registerFileBuffer('db.duckdb', new Uint8Array(arrayBuffer));

        connection = await dbInstance.connect();

        // Attach the database
        await connection.query("ATTACH DATABASE 'db.duckdb' AS attached_db");
        await connection.query("USE attached_db");
        await connection.query("LOAD spatial;");

        return { db: dbInstance, conn: connection };
    })();

    return initializationPromise;
}

/**
 * Executes a SELECT query and returns the result as an array of dictionaries.
 * @param {string} sql - The SELECT query to execute.
 * @returns {Promise<Array<Object>>} - The result set as an array of dictionaries.
 */
export async function executeSelectQuery(sql) {
    try {
        const { conn } = await initializeDatabase();
        const result = await conn.query(sql);
        return result.toArray().map(row => row.toJSON());
    } catch (error) {
        console.error('Error executing SELECT query:', error);
        throw error;
    }
}