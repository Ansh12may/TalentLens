import React, { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { api } from '../utils/api'
import toast from 'react-hot-toast'

const DIMENSIONS = [
  { key: 'skills_match', label: 'Skills Match', weight: '30%' },
  { key: 'experience_relevance', label: 'Experience Relevance', weight: '25%' },
  { key: 'education_certs', label: 'Education & Certs', weight: '15%' },
  { key: 'project_portfolio', label: 'Project / Portfolio', weight: '20%' },
  { key: 'communication_quality', label: 'Communication Quality', weight: '10%' },
]

export default function OverrideModal({ candidate, sessionId, onClose, onUpdate }) {
  const [dimension, setDimension] = useState('skills_match')
  const [newScore, setNewScore] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const currentScore = candidate.scores?.[dimension]?.score

  const handleSubmit = async () => {
    const score = parseFloat(newScore)
    if (isNaN(score) || score < 0 || score > 10) {
      toast.error('Score must be between 0 and 10')
      return
    }
    if (!reason.trim()) {
      toast.error('Please provide a reason for the override')
      return
    }
    setLoading(true)
    try {
      const result = await api.overrideScore({
        session_id: sessionId,
        candidate_id: candidate.id,
        dimension,
        new_score: score,
        reason: reason.trim()
      })
      toast.success('Score updated successfully')
      onUpdate(result.updated_candidate)
      onClose()
    } catch (e) {
      toast.error('Override failed: ' + (e.response?.data?.detail || e.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 animate-fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-lg font-bold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
              HR Score Override
            </div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {candidate.name}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <X size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <div className="p-3 rounded-lg mb-5 flex gap-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
          <p className="text-xs" style={{ color: '#fbbf24' }}>
            Score overrides are logged and visible in the final report. Final decisions remain with your team.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-muted)' }}>
              Dimension
            </label>
            <select
              value={dimension}
              onChange={e => setDimension(e.target.value)}
              className="w-full rounded-lg p-3 text-sm outline-none"
              style={{ background: 'var(--elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              {DIMENSIONS.map(d => (
                <option key={d.key} value={d.key}>
                  {d.label} ({d.weight})
                </option>
              ))}
            </select>
            {currentScore !== undefined && (
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Current score: {currentScore.toFixed(1)}/10
              </div>
            )}
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-muted)' }}>
              New Score (0–10)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={newScore}
              onChange={e => setNewScore(e.target.value)}
              placeholder="e.g. 7.5"
              className="w-full rounded-lg p-3 text-sm outline-none"
              style={{ background: 'var(--elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-muted)' }}>
              Reason for Override
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Candidate has additional context from phone screen indicating strong fit..."
              className="w-full rounded-lg p-3 text-sm resize-none outline-none"
              style={{ background: 'var(--elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', height: '90px' }}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="btn btn-primary flex-1">
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : 'Apply Override'}
          </button>
        </div>
      </div>
    </div>
  )
}
