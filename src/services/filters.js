import { executeSelectQuery } from './database';

/**
 * Fetch distinct values for the specified columns from the database.
 * @param {Array<string>} columns - The columns for which to fetch distinct values.
 * @returns {Promise<Object>} - An object where keys are column names and values are arrays of distinct values.
 */
export async function fetchDistinctValues(columns) {
    const distinctValues = {};

    for (const column of columns) {
        const sql = `SELECT DISTINCT ${column} FROM buses`;
        const results = await executeSelectQuery(sql);
        distinctValues[column] = results.map(row => row[column]);
    }

    return distinctValues;
}