import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render?: (item: T) => React.ReactNode;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function AdminTable<T extends { id: string }>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No records found matching your filters.',
  onRowClick,
}: AdminTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full bg-white">
        <div className="p-12 flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <span className="text-xs text-slate-500 font-mono">LOADING DATA...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-white">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
            {columns.map((col) => (
              <th key={col.key} className={`px-5 py-3.5 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-800">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-10 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={`hover:bg-slate-50/80 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-5 py-3.5 ${col.className || ''}`}>
                    {col.render
                      ? col.render(item)
                      : (item as any)[col.key] !== undefined && (item as any)[col.key] !== null
                      ? String((item as any)[col.key])
                      : '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
