import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i;
    if (page < 4) return i;
    if (page > totalPages - 4) return totalPages - 7 + i;
    return page - 3 + i;
  });

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button onClick={() => onChange(page - 1)} disabled={page === 0}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p) => (
        <button key={p} onClick={() => onChange(p)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
            p === page ? 'bg-green-600 text-white' : 'hover:bg-gray-100 text-gray-700'
          }`}>
          {p + 1}
        </button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages - 1}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
