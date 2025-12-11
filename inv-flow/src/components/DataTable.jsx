import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

/**
 * Standardized data table component for consistent table layouts
 * @param {Array} columns - Column definitions
 * @param {Array} data - Table data
 * @param {Object} options - Table options
 */
const DataTable = ({
    columns = [],
    data = [],
    loading = false,
    emptyMessage = 'No data available',
    sortable = false,
    onSort,
    sortColumn,
    sortDirection,
    striped = true,
    hover = true,
    responsive = true,
    className = ''
}) => {
    const handleSort = (column) => {
        if (!sortable || !onSort) return;

        const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
        onSort(column, direction);
    };

    const tableClasses = [
        'table',
        striped && 'table-striped',
        hover && 'table-hover',
        className
    ].filter(Boolean).join(' ');

    const tableContent = (
        <table className={tableClasses}>
            <thead className="table-light">
                <tr>
                    {columns.map((column, index) => (
                        <th
                            key={column.key || index}
                            className={`${column.className || ''} ${column.sortable ? 'cursor-pointer' : ''}`.trim()}
                            style={column.width ? { width: column.width } : undefined}
                            onClick={() => column.sortable && handleSort(column.key)}
                        >
                            <div className="d-flex align-items-center gap-2">
                                {column.header}
                                {sortable && column.sortable && (
                                    <div className="d-flex flex-column">
                                        <ChevronUp
                                            size={12}
                                            className={sortColumn === column.key && sortDirection === 'asc' ? 'text-primary' : 'text-muted'}
                                        />
                                        <ChevronDown
                                            size={12}
                                            className={sortColumn === column.key && sortDirection === 'desc' ? 'text-primary' : 'text-muted'}
                                            style={{ marginTop: '-4px' }}
                                        />
                                    </div>
                                )}
                            </div>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    <tr>
                        <td colSpan={columns.length} className="text-center py-4">
                            <div className="d-flex justify-content-center align-items-center">
                                <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                Loading data...
                            </div>
                        </td>
                    </tr>
                ) : data.length === 0 ? (
                    <tr>
                        <td colSpan={columns.length} className="text-center py-4 text-muted">
                            {emptyMessage}
                        </td>
                    </tr>
                ) : (
                    data.map((row, rowIndex) => (
                        <tr key={row.id || rowIndex}>
                            {columns.map((column, colIndex) => (
                                <td
                                    key={column.key || colIndex}
                                    className={column.className || ''}
                                >
                                    {column.render
                                        ? column.render(row[column.key], row, rowIndex)
                                        : row[column.key]
                                    }
                                </td>
                            ))}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );

    if (responsive) {
        return (
            <div className="table-responsive">
                {tableContent}
            </div>
        );
    }

    return tableContent;
};

export default DataTable;
