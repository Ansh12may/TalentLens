import React from 'react'

export function ScoreBar({ score, max = 10, showLabel = true }) {
  const pct = (score / max) * 100
  let color = '#ef4444'
  if (score >= 7.5) color = '#10b981'
  else if (score >= 5) color = '#f59e0b'

  return (
    <div className="flex items-center gap-2">
      <div className="score-bar-track flex-1">
        <div
          className="score-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono flex-shrink-0 w-8 text-right" style={{ color }}>
          {score.toFixed(1)}
        </span>
      )}
    </div>
  )
}

export function RecBadge({ recommendation }) {
  const classes = {
    'Strong Hire': 'rec-strong-hire',
    'Hire': 'rec-hire',
    'Maybe': 'rec-maybe',
    'No Hire': 'rec-no-hire',
  }
  return (
    <span className={`tag-pill text-xs font-semibold ${classes[recommendation] || 'rec-maybe'}`}>
      {recommendation}
    </span>
  )
}
