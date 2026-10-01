import React from 'react';
import { MentorServiceDTO } from '@backend/types/mentorship';
import { Clock, Tag, Edit3, Power, Trash2 } from 'lucide-react';

interface ServiceCardProps {
  service: MentorServiceDTO;
  onEdit: (service: MentorServiceDTO) => void;
  onToggleActive: (service: MentorServiceDTO) => void;
  onDelete: (service: MentorServiceDTO) => void;
}

export function ServiceCard({ service, onEdit, onToggleActive, onDelete }: ServiceCardProps) {
  const categoryLabel = service.category.replace(/_/g, ' ');

  return (
    <div
      className={`bg-white rounded-2xl border p-5 transition flex flex-col justify-between ${
        service.active
          ? 'border-slate-200/80 shadow-sm hover:border-slate-300'
          : 'border-slate-200/50 bg-slate-50/50 opacity-75'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 capitalize border border-blue-100">
            <Tag className="w-3 h-3" />
            {categoryLabel.toLowerCase()}
          </span>

          <span
            className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full border ${
              service.active
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            {service.active ? 'Active' : 'Inactive'}
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-1.5 line-clamp-1">
          {service.title}
        </h3>

        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
          {service.description}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between py-3 border-t border-slate-100 mb-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{service.duration} mins</span>
          </div>

          <div className="text-right">
            <span className="text-lg font-bold text-slate-900 font-display">
              {service.price === 0 ? 'Free' : `₹${service.price.toLocaleString()}`}
            </span>
            <span className="text-[10px] text-slate-400 ml-1 font-medium">{service.currency}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(service)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>

          <button
            onClick={() => onToggleActive(service)}
            className={`p-2 rounded-xl border text-xs font-medium transition ${
              service.active
                ? 'text-slate-600 hover:text-amber-600 hover:bg-amber-50 border-slate-200'
                : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
            }`}
            title={service.active ? 'Deactivate service' : 'Activate service'}
          >
            <Power className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(service)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition"
            title="Remove service"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
