import React from 'react'
import { Brain, ChevronRight } from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Job Description', desc: 'Parse & extract requirements' },
  { id: 2, label: 'Upload Candidates', desc: 'Resumes & LinkedIn profiles' },
  { id: 3, label: 'AI Scoring', desc: 'Semantic evaluation' },
  { id: 4, label: 'Shortlist', desc: 'Ranked results & report' },
]

export default function Layout({ children, currentStep, sessionId }) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--base)' }}>
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(129,140,248,0.15)' }}>
              <Brain size={16} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <div className="font-semibold text-sm" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>TalentLens</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>AI Hiring Agent</div>
            </div>
          </div>
        </div>

        <nav className="p-4">
          <div className="text-xs font-medium mb-3 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Workflow</div>
          <div className="space-y-1">
            {STEPS.map((s, i) => {
              const isActive = currentStep === s.id
              const isDone = currentStep > s.id
              return (
                <div
                  key={s.id}
                  className="flex items-start gap-3 p-3 rounded-lg transition-all duration-150"
                  style={{
                    background: isActive ? 'rgba(129,140,248,0.1)' : 'transparent',
                    borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                    style={{
                      background: isDone ? 'var(--green)' : isActive ? 'var(--accent)' : 'var(--elevated)',
                      color: isDone || isActive ? '#fff' : 'var(--text-muted)',
                    }}
                  >
                    {isDone ? '✓' : s.id}
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: isActive ? 'var(--accent)' : isDone ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                      {s.label}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.desc}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 w-64 p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Session</div>
          <div className="font-mono text-xs mt-1" style={{ color: 'var(--accent)' }}>{sessionId}</div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
