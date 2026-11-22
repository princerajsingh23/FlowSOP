import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';
import { ResilientImage } from './ResilientImage';

interface TransformationSectionProps {
  onTryProcessConvert: (sampleText: string) => void;
}

const STAGES = [
  {
    index: '01',
    title: 'Owner input',
    subtitle: 'Capture the process once in plain language',
    quote:
      '“When a customer places an order, verify payment, check stock, prepare the order, quality-check it, pack it, and dispatch.”',
    detail:
      'Instead of repeating instructions verbally to every new hire, record how the work actually runs.',
  },
  {
    index: '02',
    title: 'Structured workflow',
    subtitle: 'Convert explanations into ordered steps',
    quote: 'Order Processing becomes six verifiable, sequential steps.',
    detail:
      '01 Verify payment · 02 Check stock · 03 Prepare order · 04 Quality check · 05 Pack order · 06 Dispatch.',
  },
  {
    index: '03',
    title: 'Team executes',
    subtitle: 'Guided execution with manager visibility',
    quote: 'Owner approves -> Manager assigns -> Employee follows -> System tracks.',
    detail:
      'Every completed step updates live completion rates across shifts without shadowing or guesswork.',
  },
];

const ORDER_STEPS = [
  'Verify payment',
  'Check inventory',
  'Prepare order',
  'Quality check',
  'Pack order',
  'Dispatch',
];

export function TransformationSection({ onTryProcessConvert }: TransformationSectionProps) {
  const [activeStage, setActiveStage] = useState(0);

  return (
    <section id="transformation" className="py-24 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium tracking-wide text-blue-700 mb-3">
                01 · The Transformation
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 text-balance">
                From unstructured knowledge to structured operations.
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-xl">
                Businesses rarely lack know-how—they lack repeatable execution. FlowSOP turns one
                explanation into a live checklist that every shift follows consistently.
              </p>

              <div className="mt-8 space-y-3" role="tablist" aria-label="Transformation stages">
                {STAGES.map((stage, idx) => {
                  const isActive = idx === activeStage;
                  return (
                    <button
                      key={stage.index}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveStage(idx)}
                      className={`w-full text-left p-5 rounded-xl border transition-colors duration-150 ${
                        isActive
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="font-display text-base font-semibold">
                          {stage.index}. {stage.title}
                        </span>
                        <span
                          className={`text-xs ${isActive ? 'text-slate-300' : 'text-slate-500'}`}
                        >
                          {stage.subtitle}
                        </span>
                      </div>
                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                            className="mt-3 pt-3 border-t border-slate-700/80 space-y-2"
                          >
                            <p className="text-sm text-blue-200 font-medium">{stage.quote}</p>
                            <p className="text-sm text-slate-300 leading-relaxed">{stage.detail}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <span className="text-sm text-slate-600">
                Test this exact order process inside the live checklist API.
              </span>
              <button
                type="button"
                onClick={() =>
                  onTryProcessConvert(
                    'When a customer places an order, verify payment, check stock, prepare the order, quality-check it, pack it, and dispatch.'
                  )
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Load into Checklist API
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 flex-1 min-h-[320px]">
              <ResilientImage
                src="/src/assets/images/workflow_fulfillment_pack_1795377267172.jpg"
                alt="Quality control specialist inspecting and packing a product box at a clean timber workbench"
                fallbackTitle="Order Fulfillment Quality Check"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-6 text-white">
                <p className="text-xs text-slate-300 mb-1">
                  Approved SOP · Order Processing · 6 Steps
                </p>
                <p className="font-display text-lg font-semibold">
                  Every station follows the same verified sequence.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="font-display text-sm font-semibold text-slate-900">
                  Generated Step Sequence
                </span>
                <span className="font-mono text-xs text-slate-500 tabular-nums">6 / 6 steps</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ORDER_STEPS.map((step, index) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.25, delay: index * 0.05 }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white border border-slate-200"
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono shrink-0 ${
                        index < 2
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {index < 2 ? <Check className="w-3 h-3" aria-hidden="true" /> : `0${index + 1}`}
                    </span>
                    <span className="text-xs font-medium text-slate-800 truncate">{step}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
