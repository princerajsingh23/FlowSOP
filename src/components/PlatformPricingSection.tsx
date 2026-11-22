import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';

const ARCHITECTURE_LAYERS = [
  {
    layer: '01. Experience',
    stack: 'React Frontend',
    detail: 'Responsive shift checklists for floor staff and operational visibility for managers.',
  },
  {
    layer: '02. Application',
    stack: 'REST API Business Logic',
    detail: 'Stateful endpoints managing SOP versions, ordered steps, and live shift completion.',
  },
  {
    layer: '03. Intelligence',
    stack: 'Process Structuring',
    detail: 'Turns plain-language owner explanations into standardized, assignable step sequences.',
  },
  {
    layer: '04. Data',
    stack: 'Persistent Storage & Access',
    detail: 'Durable record of every procedure, completion timestamp, and team assignment.',
  },
];

const PLANS = [
  {
    id: 'starter',
    audience: 'For early-stage teams',
    name: 'Starter',
    price: '₹499',
    cadence: '/month',
    limits: [
      'Up to 15 active SOP checklists',
      'Up to 5 team members',
      'Employee shift execution view',
      'Morning & closing templates',
    ],
    featured: false,
  },
  {
    id: 'business',
    audience: 'For growing multi-shift operations',
    name: 'Business',
    price: '₹1,499',
    cadence: '/month',
    limits: [
      'Unlimited SOP checklists & steps',
      'Up to 25 team members',
      'Process-to-checklist converter',
      'Manager completion analytics & training',
    ],
    featured: true,
  },
  {
    id: 'pro',
    audience: 'For multi-location teams',
    name: 'Pro',
    price: '₹3,999',
    cadence: '/month',
    limits: [
      'Unlimited teams & locations',
      'Full REST API & webhook integrations',
      'Role-based approval workflows',
      'Dedicated onboarding support',
    ],
    featured: false,
  },
];

export function PlatformPricingSection() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleRequestDemo(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  return (
    <section id="pricing" className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Platform Architecture */}
        <div className="mb-20">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-medium tracking-wide text-blue-700 mb-3">
              04 · Platform Architecture
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 text-balance">
              A simple architecture for an intelligent operations layer.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ARCHITECTURE_LAYERS.map((item, idx) => (
              <motion.div
                key={item.layer}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.25, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="p-6 rounded-xl bg-white border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <p className="font-mono text-xs text-blue-700 font-medium">{item.layer}</p>
                  <h3 className="font-display text-lg font-bold text-slate-900 mt-2">
                    {item.stack}
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* SaaS Business Model Pricing */}
        <div className="pt-16 border-t border-slate-200">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-xs font-medium tracking-wide text-blue-700 mb-3">
                05 · Simple SaaS Pricing
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 text-balance">
                Start with one repeatable workflow.
              </h2>
            </div>
            <p className="text-sm text-slate-600 max-w-md">
              Transparent monthly plans built for small teams scaling into multi-shift operations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {PLANS.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`p-8 rounded-2xl border flex flex-col justify-between transition-colors ${
                    plan.featured
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-900 border-slate-200'
                  }`}
                >
                  <div>
                    <p
                      className={`text-xs font-medium ${
                        plan.featured ? 'text-blue-300' : 'text-slate-500'
                      }`}
                    >
                      {plan.name} · {plan.audience}
                    </p>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="font-display text-4xl font-bold tabular-nums">
                        {plan.price}
                      </span>
                      <span
                        className={`text-sm ${plan.featured ? 'text-slate-300' : 'text-slate-500'}`}
                      >
                        {plan.cadence}
                      </span>
                    </div>

                    <ul className="mt-6 pt-6 border-t border-current/15 space-y-3">
                      {plan.limits.map((limit) => (
                        <li key={limit} className="flex items-start gap-2.5 text-sm">
                          <Check
                            className={`w-4 h-4 mt-0.5 shrink-0 ${
                              plan.featured ? 'text-blue-400' : 'text-blue-700'
                            }`}
                            aria-hidden="true"
                          />
                          <span className={plan.featured ? 'text-slate-200' : 'text-slate-700'}>
                            {limit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlan(plan.id);
                        setSubmitted(false);
                      }}
                      className={`w-full px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                        plan.featured
                          ? 'bg-blue-600 hover:bg-blue-500 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {isSelected ? `${plan.name} Plan Selected` : `Choose ${plan.name}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Onboarding Request Form */}
          <div className="mt-10 p-8 rounded-2xl bg-white border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-xl font-bold text-slate-900">
                {selectedPlan
                  ? `Request workspace setup for the ${
                      PLANS.find((p) => p.id === selectedPlan)?.name
                    } plan`
                  : 'Every business has knowledge. Turn it into an operating system.'}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Receive API documentation and a guided rollout template for your team.
              </p>
            </div>

            {submitted ? (
              <div className="px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm font-medium text-emerald-800">
                Rollout packet prepared for {email}.
              </div>
            ) : (
              <form
                onSubmit={handleRequestDemo}
                className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="work@company.com"
                  aria-label="Work email address"
                  className="sm:w-64 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Request Setup
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
