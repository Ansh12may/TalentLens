import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Edit3, AlertCircle, User, Briefcase } from 'lucide-react'
import { ScoreBar, RecBadge } from './ScoreBar'

const DIMENSIONS = [
  { key: 'skills_match', label: 'Skills Match', weight: '30%' },
  { key: 'experience_relevance', label: 'Experience Relevance', weight: '25%' },
  { key: 'education_certs', label: 'Education & Certs', weight: '15%' },
  { key: 'project_portfolio', label: 'Project / Portfolio', weight: '20%' },
  { key: 'communication_quality', label: 'Communication Quality', weight: '10%' },
]

export default function CandidateCard({ candidate, onOverride }) {
  const [expanded, setExpanded] = useState(false)
  const score = candidate.total_score || 0
  const rank = candidate.rank

  const rankColor = rank === 1 ? '#f59e0b' : rank === 2 ? '#9ca3af' : rank === 3 ? '#b45309' : 'var(--text-muted)'

  return (
    <div
      className="rounded-xl overflow-hidden card-hover"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${expanded ? '#3a3a5e' : 'var(--border)'}`,
        transition: 'all 0.2s'
      }}
    >
      {/* Card header */}
      <div
        className="p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          {/* Rank */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
            style={{
              background: rank <= 3 ? `${rankColor}15` : 'var(--elevated)',
              color: rankColor,
              border: rank <= 3 ? `1px solid ${rankColor}30` : '1px solid var(--border)'
            }}
          >
            #{rank}
          </div>

          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
            style={{ background: 'var(--elevated)', color: 'var(--accent)' }}
          >
            {(candidate.name || '?')[0].toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                {candidate.name || 'Unknown Candidate'}
              </span>
              {candidate.hr_override && (
                <span className="tag-pill text-xs" style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}>
                  HR Override
                </span>
              )}
              <span className="tag-pill text-xs" style={{ background: 'rgba(100,100,150,0.2)', color: 'var(--text-muted)' }}>
                {candidate.source?.toUpperCase()}
              </span>
            </div>
            <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
              {candidate.email || candidate.filename}
            </div>
          </div>

          {/* Score + Rec */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ color: 'var(--accent)', fontFamily: 'Space Grotesk' }}>
                {score.toFixed(1)}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>/ 10</div>
            </div>
            <RecBadge recommendation={candidate.recommendation} />
            <div className="ml-2" style={{ color: 'var(--text-muted)' }}>
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </div>

        {/* Mini score bars */}
        <div className="mt-4 grid grid-cols-5 gap-2">
          {DIMENSIONS.map(d => {
            const dim = candidate.scores?.[d.key]
            return (
              <div key={d.key}>
                <div className="text-xs mb-1 truncate" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                  {d.label.split(' ')[0]}
                </div>
                <ScoreBar score={dim?.score || 0} showLabel={false} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t" style={{ borderColor: 'var(--border)' }}>
          {/* Dimension breakdown */}
          <div className="p-5">
            <div className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
              Scoring Rubric Breakdown
            </div>
            <div className="space-y-3">
              {DIMENSIONS.map(d => {
                const dim = candidate.scores?.[d.key]
                if (!dim) return null
                return (
                  <div key={d.key} className="grid gap-2" style={{ gridTemplateColumns: '160px 1fr 40px' }}>
                    <div>
                      <div className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                        {d.label}
                        {dim.overridden && (
                          <span className="tag-pill" style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', fontSize: '9px' }}>
                            Overridden
                          </span>
                        )}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Weight: {d.weight}</div>
                    </div>
                    <div>
                      <ScoreBar score={dim.score} />
                      <div className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        {dim.justification}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-semibold" style={{ color: 'var(--accent)' }}>
                        {dim.score.toFixed(1)}
                      </div>
                      <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)', fontSize: '9px' }}>
                        +{dim.weighted_score?.toFixed(2) ?? (dim.score * dim.weight).toFixed(2)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Weighted total */}
            <div className="mt-4 pt-4 flex items-center justify-between border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Weighted Total</div>
              <div className="text-xl font-bold" style={{ color: 'var(--accent)', fontFamily: 'Space Grotesk' }}>
                {score.toFixed(2)} / 10
              </div>
            </div>
          </div>

          {/* Profile snapshot */}
          {candidate.profile && (
            <div className="border-t p-5" style={{ borderColor: 'var(--border)' }}>
              <div className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Profile Snapshot</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Top Skills</div>
                  <div className="flex flex-wrap gap-1">
                    {(candidate.profile.skills || []).slice(0, 8).map(s => (
                      <span key={s} className="tag-pill" style={{ background: 'rgba(129,140,248,0.1)', color: 'var(--accent)' }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Experience</div>
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {candidate.profile.total_experience_years} years
                  </div>
                  {candidate.profile.work_experience?.[0] && (
                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Last: {candidate.profile.work_experience[0].title} @ {candidate.profile.work_experience[0].company}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Override history */}
          {candidate.overrides?.length > 0 && (
            <div className="border-t p-5" style={{ borderColor: 'var(--border)' }}>
              <div className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Override History</div>
              {candidate.overrides.map((o, i) => (
                <div key={i} className="text-xs rounded-lg p-3 mb-2" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
                  <div className="font-medium mb-1" style={{ color: '#a78bfa' }}>
                    {o.dimension} · {o.original_score?.toFixed(1)} → {o.new_score.toFixed(1)}
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>{o.reason}</div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="border-t p-4 flex justify-end gap-2" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => onOverride(candidate)}
              className="btn btn-secondary text-xs py-2"
            >
              <Edit3 size={13} />
              Override Score
            </button>
          </div>
        </div>
      )}
    </div>
  )
}