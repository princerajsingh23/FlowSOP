import { useCallback, useState } from 'react';
import { motion, MotionConfig } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { ResilientImage } from './components/ResilientImage';
import { TransformationSection } from './components/TransformationSection';
import { WorkdaySection } from './components/WorkdaySection';
import { ChecklistWorkspace } from './components/ChecklistWorkspace';
import { PlatformPricingSection } from './components/PlatformPricingSection';
import type { WorkdayShift } from './types/checklist';

const HERO_STRIP = [
  {
    index: '01',
    problem: 'Knowledge lives in heads',
    outcome: 'Documented once into repeatable SOPs',
  },
  {
    index: '02',
    problem: 'Training takes too long',
    outcome: 'New staff follow guided shift steps',
  },
  {
    index: '03',
    problem: 'Execution is invisible',
    outcome: 'Managers see real-time completion',
  },
  {
    index: '04',
    problem: 'Before vs. with FlowSOP',
    outcome: 'Consistent delivery every single shift',
  },
];

export default function App() {
  const [workspaceShiftFilter, setWorkspaceShiftFilter] = useState<WorkdayShift | 'All'>('All');
  const [incomingProcessText, setIncomingProcessText] = useState<string | null>(null);

  const scrollToWorkspace = useCallback(() => {
    const el = document.getElementById('workspace');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleSelectShiftForWorkspace = useCallback(
    (shift: WorkdayShift) => {
      setWorkspaceShiftFilter(shift);
      scrollToWorkspace();
    },
    [scrollToWorkspace]
  );

  const handleTryProcessConvert = useCallback(
    (sampleText: string) => {
      setIncomingProcessText(sampleText);
      scrollToWorkspace();
    },
    [scrollToWorkspace]
  );

  return (
    <MotionConfig reducedMotion="user">
      <div id="top" className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {/* Strict 3-Zone Top Bar */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
            <a
              href="#top"
              className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
            >
              FlowSOP
            </a>

            <nav
              aria-label="Primary navigation"
              className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
            >
              <a
                href="#transformation"
                className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
              >
                Transformation
              </a>
              <a
                href="#workday"
                className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
              >
                Workday
              </a>
              <a
                href="#workspace"
                className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
              >
                Checklists
              </a>
              <a
                href="#pricing"
                className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
              >
                Pricing
              </a>
            </nav>

            <div className="flex items-center shrink-0">
              <a
                href="#workspace"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Open Workspace
              </a>
            </div>
          </div>
        </header>

        <main className="flex-1">
          {/* Hero Section */}
          <section className="bg-[#0B132B] text-white border-b border-slate-800">
            <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="lg:col-span-6 flex flex-col justify-center"
                >
                  <p className="text-xs font-medium tracking-wide text-blue-300 mb-4">
                    FlowSOP · Operations Platform
                  </p>
                  <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-[1.08] text-white text-balance">
                    Turn business knowledge into intelligent workflows.
                  </h1>
                  <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                    An operational platform that captures how a business works, converts procedures
                    into structured SOPs, and gives teams live checklists backed by a real REST API.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={scrollToWorkspace}
                      className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      Launch Checklist Workspace
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <a
                      href="#transformation"
                      className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
                    >
                      See how it works
                    </a>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="lg:col-span-6 relative rounded-2xl overflow-hidden border border-slate-700/80 min-h-[300px] lg:min-h-[420px]"
                >
                  <ResilientImage
                    src="/src/assets/images/hero_operations_command_1795377267462.jpg"
                    alt="Operations dispatch coordinator overseeing fulfillment stations in a modern warehouse studio"
                    fallbackTitle="FlowSOP Operations Command"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/90 via-[#0B132B]/20 to-transparent" />
                  <div className="absolute bottom-5 left-6 right-6">
                    <p className="text-xs text-blue-200 font-medium">
                      Morning Opening · Active Fulfillment · Closing Reconciliation
                    </p>
                    <p className="font-display text-base font-semibold text-white mt-1">
                      Approved operational guidance at the moment of work.
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Full-width 4-Column Operational Proof Strip */}
              <div className="mt-14 pt-10 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {HERO_STRIP.map((item, idx) => (
                  <motion.div
                    key={item.index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: 0.14 + idx * 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <p className="font-mono text-xs text-blue-300 tabular-nums">{item.index}</p>
                    <h2 className="font-display text-base font-semibold text-white mt-1.5">
                      {item.problem}
                    </h2>
                    <p className="text-sm text-slate-400 mt-1 leading-relaxed">{item.outcome}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <TransformationSection onTryProcessConvert={handleTryProcessConvert} />

          <WorkdaySection onSelectShiftForWorkspace={handleSelectShiftForWorkspace} />

          <ChecklistWorkspace
            externalShiftFilter={workspaceShiftFilter}
            incomingProcessText={incomingProcessText}
            onIncomingProcessConsumed={() => setIncomingProcessText(null)}
          />

          <PlatformPricingSection />
        </main>

        {/* Quiet Footer */}
        <footer className="bg-white border-t border-slate-200 py-10">
          <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <span className="font-display text-base font-bold text-slate-900">FlowSOP</span>
              <p className="text-xs text-slate-500 mt-1">
                Turn business knowledge into intelligent workflows.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600">
              <a href="#transformation" className="hover:text-slate-900 transition-colors">
                Transformation
              </a>
              <a href="#workday" className="hover:text-slate-900 transition-colors">
                Workday
              </a>
              <a href="#workspace" className="hover:text-slate-900 transition-colors">
                Checklist API
              </a>
              <a href="#pricing" className="hover:text-slate-900 transition-colors">
                Pricing
              </a>
            </div>
            <p className="text-xs text-slate-500">© {new Date().getFullYear()} FlowSOP</p>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
