import React, { useState } from 'react'
import { Download, RefreshCw, Filter, BarChart2, Users, TrendingUp, Award } from 'lucide-react'
import { api } from '../utils/api'
import CandidateCard from '../components/CandidateCard'
import OverrideModal from '../components/OverrideModal'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'

const REC_ORDER = ['Strong Hire', 'Hire', 'Maybe', 'No Hire']

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} style={{ color }} />
        <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <div className="text-2xl font-bold" style={{ color, fontFamily: 'Space Grotesk' }}>{value}</div>
    </div>
  )
}

export default function ResultsStep({ sessionId, candidates: initialCandidates, requirements, onReset }) {
  const [candidates, setCandidates] = useState(initialCandidates)
  const [filter, setFilter] = useState('All')
  const [overrideTarget, setOverrideTarget] = useState(null)
  const [showChart, setShowChart] = useState(false)

  const counts = {
    'All': candidates.length,
    'Strong Hire': candidates.filter(c => c.recommendation === 'Strong Hire').length,
    'Hire': candidates.filter(c => c.recommendation === 'Hire').length,
    'Maybe': candidates.filter(c => c.recommendation === 'Maybe').length,
    'No Hire': candidates.filter(c => c.recommendation === 'No Hire').length,
  }

  const filtered = filter === 'All' ? candidates : candidates.filter(c => c.recommendation === filter)
  const avgScore = candidates.length ? (candidates.reduce((a, c) => a + c.total_score, 0) / candidates.length).toFixed(1) : 0
  const topScore = candidates.length ? Math.max(...candidates.map(c => c.total_score)).toFixed(1) : 0

  const handleUpdate = (updatedCandidate) => {
    setCandidates(prev => {
      const updated = prev.map(c => c.id === updatedCandidate.id ? updatedCandidate : c)
      return updated.sort((a, b) => b.total_score - a.total_score).map((c, i) => ({ ...c, rank: i + 1 }))
    })
  }

  const handleDownload = (format) => {
    const url = api.getReportUrl(sessionId, format)
    window.open(url, '_blank')
  }

  // Radar chart data from top candidate
  const topCand = candidates[0]
  const radarData = topCand ? [
    { dim: 'Skills', score: topCand.scores?.skills_match?.score || 0 },
    { dim: 'Experience', score: topCand.scores?.experience_relevance?.score || 0 },
    { dim: 'Education', score: topCand.scores?.education_certs?.score || 0 },
    { dim: 'Projects', score: topCand.scores?.project_portfolio?.score || 0 },
    { dim: 'Communication', score: topCand.scores?.communication_quality?.score || 0 },
  ] : []

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--green)' }} />
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Step 4 of 4 — Complete</span>
          </div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
            Shortlist Results
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            {requirements?.title} · {candidates.length} candidates evaluated
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowChart(!showChart)} className="btn btn-secondary text-xs py-2">
            <BarChart2 size={13} /> {showChart ? 'Hide' : 'Show'} Chart
          </button>
          <button onClick={() => handleDownload('html')} className="btn btn-secondary text-xs py-2">
            <Download size={13} /> HTML Report
          </button>
          <button onClick={() => handleDownload('json')} className="btn btn-secondary text-xs py-2">
            <Download size={13} /> JSON Export
          </button>
          <button onClick={onReset} className="btn btn-secondary text-xs py-2">
            <RefreshCw size={13} /> New Session
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Total" value={candidates.length} color="var(--accent)" />
        <StatCard icon={Award} label="Top Score" value={topScore} color="var(--green)" />
        <StatCard icon={TrendingUp} label="Avg Score" value={avgScore} color="#f59e0b" />
        <StatCard icon={BarChart2} label="Strong Hire" value={counts['Strong Hire']} color="#10b981" />
      </div>

      {/* Radar Chart */}
      {showChart && topCand && (
        <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Top Candidate — {topCand.name} Score Breakdown
          </div>
          <div className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Dimension scores (0–10)</div>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#2a2a3e" />
              <PolarAngleAxis dataKey="dim" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Radar dataKey="score" stroke="#818cf8" fill="#818cf8" fillOpacity={0.2} dot />
              <Tooltip
                contentStyle={{ background: 'var(--elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'var(--text-primary)' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-1 flex-wrap mb-5">
        {['All', ...REC_ORDER].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: filter === f ? 'rgba(129,140,248,0.15)' : 'var(--elevated)',
              color: filter === f ? 'var(--accent)' : 'var(--text-muted)',
              border: filter === f ? '1px solid rgba(129,140,248,0.3)' : '1px solid var(--border)'
            }}
          >
            {f} {counts[f] !== undefined ? `(${counts[f]})` : ''}
          </button>
        ))}
      </div>

      {/* Candidate list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            No candidates in this category
          </div>
        ) : (
          filtered.map(c => (
            <CandidateCard
              key={c.id}
              candidate={c}
              onOverride={setOverrideTarget}
            />
          ))
        )}
      </div>

      {/* Override modal */}
      {overrideTarget && (
        <OverrideModal
          candidate={overrideTarget}
          sessionId={sessionId}
          onClose={() => setOverrideTarget(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}
