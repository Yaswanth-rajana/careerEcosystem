'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Calendar, Clock, Sparkles, CheckCircle2, ChevronRight, Info, ShieldCheck } from 'lucide-react';
import { Mentor, MentorSessionOption } from '@/lib/mentors/mentor-types';
import { Modal } from '@/components/design-system/Modal';
import { Button } from '@/components/design-system/Button';

interface BookingModalProps {
  mentor: Mentor | null;
  isOpen: boolean;
  onClose: () => void;
  preSelectedOptionId?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  mentor,
  isOpen,
  onClose,
  preSelectedOptionId,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedOptionId, setSelectedOptionId] = useState<string>(preSelectedOptionId || '');
  const [selectedSlot, setSelectedSlot] = useState<string>('Tomorrow at 6:00 PM');
  const [note, setNote] = useState<string>('');

  if (!mentor) return null;

  const sessionOptions = mentor.sessionOptions || [
    {
      id: 'default-1',
      title: '1-on-1 Career Guidance Session',
      durationMin: 45,
      price: mentor.startingPrice,
      description: 'Personalized advice on your career goals, portfolio, or technical strategy.',
      type: mentor.sessionTypes[0] || 'Career Guidance',
    },
  ];

  const selectedOption =
    sessionOptions.find((o) => o.id === selectedOptionId) || sessionOptions[0];

  const handleClose = () => {
    setStep(1);
    setNote('');
    onClose();
  };

  const sampleSlots = [
    mentor.nextAvailableAt || 'Tomorrow at 6:00 PM',
    'Tomorrow at 7:30 PM',
    'Friday at 5:00 PM',
    'Saturday at 11:00 AM',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 3 ? 'Booking Status' : `Book Session with ${mentor.name}`}
      maxWidth="lg"
    >
      <div className="space-y-6 text-left">
        {/* Mentor Mini Header */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-300 shrink-0">
            <Image src={mentor.avatar} alt={mentor.name} fill className="object-cover" sizes="48px" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-slate-900 font-display text-sm">
                {mentor.name}
              </h4>
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs text-slate-500">{mentor.role} · {mentor.domain}</p>
          </div>
        </div>

        {/* STEP 1: Select Session Option & Slot */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-display">
                Select Session Type
              </label>
              <div className="space-y-2.5">
                {sessionOptions.map((opt) => {
                  const isSelected = selectedOption.id === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedOptionId(opt.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-xs text-slate-900 font-display">
                          {opt.title}
                        </span>
                        <span className="font-extrabold text-sm text-blue-600">
                          ₹{opt.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-2">
                        {opt.description}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-600" /> {opt.durationMin} min
                        </span>
                        <span>·</span>
                        <span className="text-blue-600">{opt.type}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-display">
                Select Preferred Time Slot
              </label>
              <div className="grid grid-cols-2 gap-2">
                {sampleSlots.map((slot) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-3 py-2 rounded-xl border text-xs font-semibold text-left transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">{slot}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">Step 1 of 2</span>
              <Button
                variant="primary"
                size="md"
                onClick={() => setStep(2)}
                rightIcon={<ChevronRight className="w-4 h-4" />}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                Continue to Review
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Notes & Review Request */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-display">
                What topic or code blocker would you like to focus on? (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Preparing for a system design round on microservices, or reviewing my senior engineer resume..."
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Request Summary Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Selected Session:</span>
                <span className="font-bold text-slate-900">{selectedOption.title}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Duration:</span>
                <span className="font-semibold text-slate-900">{selectedOption.durationMin} mins</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Preferred Slot:</span>
                <span className="font-semibold text-emerald-600">{selectedSlot}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm">
                <span>Estimated Total:</span>
                <span className="text-blue-600">₹{selectedOption.price.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-xs">
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setStep(3)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                Submit Session Request
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Honest Boundary Status Notice */}
        {step === 3 && (
          <div className="space-y-5 text-center py-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200">
              <Info className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold font-display text-slate-900">
                Booking Integration Coming Soon
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                Thank you for testing the PATHWAY.ECO mentorship experience. Direct live scheduling & payment gateway integration will be active in the upcoming release.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1">
              <p className="font-bold text-slate-900">Request Context Preview:</p>
              <p className="text-slate-500">Mentor: {mentor.name}</p>
              <p className="text-slate-500">Session: {selectedOption.title}</p>
              <p className="text-slate-500">Slot: {selectedSlot}</p>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <Button variant="primary" size="md" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs" onClick={handleClose}>
                Done & Return to Mentors
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
