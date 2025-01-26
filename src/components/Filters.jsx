import React from 'react';

function Filters({ options, filters, onFilterChange }) {
    return (
        <div className="filters">
            {Object.entries(options).map(([key, values]) => (
                <label key={key}>
                    {key}:
                    <select
                        value={filters[key] || ''}
                        onChange={e => onFilterChange(key, e.target.value)}
                    >
                        <option value="">All</option>
                        {values.map(value => (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        ))}
                    </select>
                </label>
            ))}
        </div>
    );
}

export default Filters;