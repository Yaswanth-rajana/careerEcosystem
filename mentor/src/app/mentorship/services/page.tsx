'use client';

import React, { useState, useEffect } from 'react';
import { MentorShell } from '@/components/MentorShell';
import { ServiceCard } from '@/components/services/ServiceCard';
import { ServiceModal } from '@/components/services/ServiceModal';
import { CardSkeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { MentorServiceDTO } from '@backend/types/mentorship';
import { Plus, Briefcase, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function MentorServicesPage() {
  const [services, setServices] = useState<MentorServiceDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<MentorServiceDTO | null>(null);

  const fetchServices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/mentor/services');
      if (!res.ok) {
        throw new Error('Failed to load services');
      }
      const data = await res.json();
      setServices(data.services || []);
    } catch (err: any) {
      setError(err.message || 'Error loading services');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenCreate = () => {
    setSelectedService(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (service: MentorServiceDTO) => {
    setSelectedService(service);
    setModalOpen(true);
  };

  const handleSave = async (payload: any) => {
    if (selectedService) {
      // Edit
      const res = await fetch(`/api/mentor/services/${selectedService.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Failed to update service');
      }
      setSuccessMsg('Service updated successfully');
    } else {
      // Create
      const res = await fetch('/api/mentor/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Failed to create service');
      }
      setSuccessMsg('New mentorship service created successfully');
    }

    setTimeout(() => setSuccessMsg(null), 3500);
    await fetchServices();
  };

  const handleToggleActive = async (service: MentorServiceDTO) => {
    try {
      const res = await fetch(`/api/mentor/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !service.active }),
      });
      if (!res.ok) throw new Error('Failed to toggle status');
      setSuccessMsg(
        service.active
          ? `Deactivated "${service.title}"`
          : `Activated "${service.title}"`
      );
      setTimeout(() => setSuccessMsg(null), 3000);
      await fetchServices();
    } catch (err: any) {
      setError(err.message || 'Failed to update service status');
    }
  };

  const handleDelete = async (service: MentorServiceDTO) => {
    if (!confirm(`Are you sure you want to remove "${service.title}"? If bookings exist, it will be safely deactivated.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/mentor/services/${service.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove service');
      const data = await res.json();
      if (data.action === 'DEACTIVATED') {
        setSuccessMsg(`Service has historical bookings and was safely deactivated.`);
      } else {
        setSuccessMsg(`Service was deleted.`);
      }
      setTimeout(() => setSuccessMsg(null), 3500);
      await fetchServices();
    } catch (err: any) {
      setError(err.message || 'Failed to remove service');
    }
  };

  return (
    <MentorShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
              Mentorship Services
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Define your service offerings, set pricing, and customize session durations
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add New Service
          </button>
        </div>

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : services.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="You haven't added any services yet"
            description="Create your first mentorship service so candidates on PATHWAY.ECO can book time with you."
            actionText="Create Your First Service"
            onAction={handleOpenCreate}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((svc) => (
              <ServiceCard
                key={svc.id}
                service={svc}
                onEdit={handleOpenEdit}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <ServiceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        service={selectedService}
        onSave={handleSave}
      />
    </MentorShell>
  );
}
