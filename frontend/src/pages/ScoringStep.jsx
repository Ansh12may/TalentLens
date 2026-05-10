import React, { useEffect, useState } from 'react'
import { Brain, Zap, BarChart2, FileOutput, CheckCircle } from 'lucide-react'
import { api } from '../utils/api'
import toast from 'react-hot-toast'

const SCORING_STEPS = [
  { id: 1, icon: Brain, label: 'Analyzing Job Requirements', desc: 'Extracting semantic features from JD' },
  { id: 2, icon: FileOutput, label: 'Processing Candidate Profiles', desc: 'Structuring skills, experience, education' },
  { id: 3, icon: Zap, label: 'Semantic Matching Engine', desc: 'Comparing candidates against JD dimensions' },
  { id: 4, icon: BarChart2, label: 'Computing Rubric Scores', desc: 'Skills, Experience, Education, Projects, Communication' },
]

function StepRow({ step, status }) {
  const Icon = step.icon
  const isActive = status === 'active'
  const isDone = status === 'done'

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl transition-all duration-500"
      style={{
        background: isActive ? 'rgba(129,140,248,0.08)' : isDone ? 'rgba(16,185,129,0.05)' : 'transparent',
        border: isActive ? '1px solid rgba(129,140,248,0.2)' : isDone ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent',
      }}
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: isActive ? 'rgba(129,140,248,0.15)' : isDone ? 'rgba(16,185,129,0.15)' : 'var(--elevated)',
        }}
      >
        {isDone
          ? <CheckCircle size={18} style={{ color: 'var(--green)' }} />
          : <Icon size={18} style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }} />
        }
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium" style={{ color: isActive ? 'var(--text-primary)' : isDone ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
          {step.label}
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{step.desc}</div>
        {isActive && (
          <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div className="h-full rounded-full animate-pulse" style={{ background: 'var(--accent)', width: '60%' }} />
          </div>
        )}
      </div>
      {isDone && (
        <div className="text-xs font-medium" style={{ color: 'var(--green)' }}>Done</div>
      )}
      {isActive && (
        <div className="w-4 h-4 border-2 rounded-full animate-spin flex-shrink-0 mt-1"
          style={{ borderColor: 'rgba(129,140,248,0.2)', borderTopColor: 'var(--accent)' }} />
      )}
    </div>
  )
}

export default function ScoringStep({ sessionId, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    const runScoring = async () => {
      // Animate through steps
      for (let i = 0; i < SCORING_STEPS.length; i++) {
        setCurrentStep(i + 1)
        await new Promise(r => setTimeout(r, 800 + Math.random() * 400))
      }

      try {
        const result = await api.scoreCandidates(sessionId)
        setCurrentStep(SCORING_STEPS.length + 1) // all done
        setTimeout(() => {
          onComplete(result.ranked_candidates)
        }, 600)
      } catch (e) {
        setError(e.response?.data?.detail || e.message)
        toast.error('Scoring failed: ' + (e.response?.data?.detail || e.message))
      }
    }
    runScoring()
  }, [])

  const allDone = currentStep > SCORING_STEPS.length

  return (
    <div className="p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-screen">
      {/* Central animation */}
      <div className="mb-10 relative">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto animate-pulse-glow"
          style={{ background: 'rgba(129,140,248,0.15)', border: '1px solid rgba(129,140,248,0.3)' }}>
          <Brain size={36} style={{ color: 'var(--accent)' }} />
        </div>
        {!allDone && (
          <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: 'var(--elevated)', border: '2px solid var(--base)' }}>
            <div className="w-3 h-3 border-2 rounded-full animate-spin"
              style={{ borderColor: 'rgba(129,140,248,0.3)', borderTopColor: 'var(--accent)' }} />
          </div>
        )}
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
          {allDone ? 'Scoring Complete!' : 'AI Agent Running...'}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {allDone
            ? 'All candidates have been scored and ranked.'
            : 'Claude is evaluating each candidate across 5 dimensions of the rubric.'}
        </p>
      </div>

      <div className="w-full space-y-2">
        {SCORING_STEPS.map((step, i) => {
          const status = currentStep > i + 1 ? 'done' : currentStep === i + 1 ? 'active' : 'pending'
          return <StepRow key={step.id} step={step} status={status} />
        })}
      </div>

      {error && (
        <div className="mt-6 p-4 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
          Error: {error}
        </div>
      )}

      {allDone && (
        <div className="mt-8 flex items-center gap-2 text-sm font-medium animate-fade-up" style={{ color: 'var(--green)' }}>
          <CheckCircle size={18} />
          Redirecting to results...
        </div>
      )}
    </div>
  )
}
