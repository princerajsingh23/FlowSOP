import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ResilientImage } from './ResilientImage';
import type { WorkdayShift } from '../types/checklist';

interface WorkdaySectionProps {
  onSelectShiftForWorkspace: (shift: WorkdayShift) => void;
}

const WORKDAY_PHASES: {
  id: WorkdayShift;
  number: string;
  timeWindow: string;
  headline: string;
  summary: string;
  tasks: string[];
  image: string;
  imageAlt: string;
  caption: string;
}[] = [
  {
    id: 'Morning',
    number: '01',
    timeWindow: '07:00 — 10:00',
    headline: 'Morning opening readiness',
    summary:
      'Verify facility security, calibrate POS stations, confirm top-SKU stock counts, and assign daily roles before doors open.',
    tasks: ['Opening checklist', 'Staff shift assignments', 'Morning inventory spot check'],
    image: '/src/assets/images/workday_morning_brief_1795377267109.jpg',
    imageAlt: 'Operations manager briefing two staff members with a tablet during morning opening',
    caption: 'Morning Shift · Opening checklist & staff assignments',
  },
  {
    id: 'Workday',
    number: '02',
    timeWindow: '10:00 — 18:00',
    headline: 'Active floor & order execution',
    summary:
      'Keep customer service, order fulfillment, and two-point quality inspections consistent across every station during peak demand.',
    tasks: ['Order processing steps', 'Customer refund policy lookup', 'Quality inspection gates'],
    image: '/src/assets/images/workflow_fulfillment_pack_1795377267172.jpg',
    imageAlt: 'Fulfillment specialist inspecting and packing an order at a clean workbench',
    caption: 'Workday Shift · Order processing & quality control',
  },
  {
    id: 'Closing',
    number: '03',
    timeWindow: '18:00 — 21:30',
    headline: 'Closing & stock reconciliation',
    summary:
      'Close the loop cleanly with cash drawer reconciliation, damaged goods logging, equipment shutdown, and manager sign-off.',
    tasks: ['Closing procedures', 'Inventory ledger updates', 'Daily operations report'],
    image: '/src/assets/images/hero_operations_command_1795377267462.jpg',
    imageAlt: 'Operations command floor wrapping up daily dispatch schedules',
    caption: 'Closing Shift · Inventory updates & daily sign-off',
  },
  {
    id: 'Always On',
    number: '04',
    timeWindow: 'Continuous',
    headline: 'Onboarding & manager visibility',
    summary:
      'Track completion rates across every department and onboard new team members directly inside approved company workflows.',
    tasks: ['SOP-based employee training', 'Completion rate visibility', 'Exception review'],
    image: '/src/assets/images/manager_visibility_desk_1795377267093.jpg',
    imageAlt: 'Operations director reviewing completion metrics on a laptop at an oak table',
    caption: 'Always On · Manager visibility & guided training',
  },
];

export function WorkdaySection({ onSelectShiftForWorkspace }: WorkdaySectionProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const current = WORKDAY_PHASES[selectedIdx];

  return (
    <section id="workday" className="py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs font-medium tracking-wide text-blue-700 mb-3">
              02 · The Workday Rhythm
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 text-balance">
              FlowSOP works where the work happens.
            </h2>
          </div>
          <p className="text-sm text-slate-600 max-w-md leading-relaxed">
            One operating layer connects the entire day—from opening checklist to closing
            reconciliation and manager analytics.
          </p>
        </div>

        {/* Segmented Timeline Control */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-2 p-1.5 bg-slate-200/70 rounded-xl mb-10"
          role="tablist"
          aria-label="Workday phases"
        >
          {WORKDAY_PHASES.map((phase, idx) => {
            const isSelected = idx === selectedIdx;
            return (
              <button
                key={phase.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedIdx(idx)}
                className={`relative px-4 py-3 rounded-lg text-left transition-colors duration-150 ${
                  isSelected ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isSelected && (
                  <motion.span
                    layoutId="workday-active-tab"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/80"
                  />
                )}
                <span className="relative z-10 flex items-center justify-between gap-2">
                  <span className="font-display text-sm font-semibold whitespace-nowrap">
                    {phase.number}. {phase.id}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500 tabular-nums hidden sm:inline">
                    {phase.timeWindow}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Phase Showcase */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-white rounded-2xl border border-slate-200 overflow-hidden"
          >
            <div className="lg:col-span-7 relative min-h-[300px] lg:min-h-[420px]">
              <ResilientImage
                src={current.image}
                alt={current.imageAlt}
                fallbackTitle={current.headline}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-6 right-6 text-white">
                <p className="text-xs text-slate-200">{current.caption}</p>
              </div>
            </div>

            <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono tabular-nums mb-3">
                  <span>Phase {current.number}</span>
                  <span aria-hidden="true">·</span>
                  <span>{current.timeWindow}</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
                  {current.headline}
                </h3>
                <p className="mt-3 text-base text-slate-600 leading-relaxed">{current.summary}</p>

                <div className="mt-6 pt-6 border-t border-slate-200">
                  <p className="text-xs font-medium text-slate-500 mb-3">
                    Core operational checklists
                  </p>
                  <ul className="space-y-2.5">
                    {current.tasks.map((task, i) => (
                      <li
                        key={task}
                        className="flex items-center gap-3 text-sm text-slate-800 font-medium"
                      >
                        <span className="font-mono text-xs text-blue-700 tabular-nums">
                          0{i + 1}
                        </span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => onSelectShiftForWorkspace(current.id)}
                  className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
                >
                  Filter {current.id} Checklists Below
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
