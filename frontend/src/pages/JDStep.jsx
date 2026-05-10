import React, { useState } from 'react'
import { Sparkles, ChevronRight, FileText, AlertCircle } from 'lucide-react'
import { api } from '../utils/api'
import toast from 'react-hot-toast'

const SAMPLE_JD = `Senior Full-Stack Engineer — FinTech Platform

We are building the next generation of real-time payment infrastructure at Stripe. We're looking for a Senior Full-Stack Engineer to lead development of our merchant dashboard and payment APIs.

Responsibilities:
- Architect and implement scalable REST and GraphQL APIs using Node.js and Python
- Build responsive React frontends with TypeScript
- Design distributed systems handling 10M+ transactions/day
- Collaborate with product, design, and data teams
- Mentor junior engineers and conduct code reviews

Required Skills:
- 5+ years of software engineering experience
- Proficiency in Python, Node.js, TypeScript, React
- Experience with PostgreSQL, Redis, Kafka
- Knowledge of AWS (EC2, RDS, Lambda, SQS)
- Strong understanding of payment systems, PCI-DSS compliance
- Experience with microservices architecture

Preferred Skills:
- Experience with Kubernetes and Docker
- Background in FinTech or Banking domain
- Contributions to open-source projects

Education: Bachelor's degree in Computer Science or related field
Certifications: AWS Solutions Architect preferred

Location: San Francisco, CA (Hybrid)`

export default function JDStep({ sessionId, onComplete }) {
  const [jdText, setJdText] = useState('')
  const [loading, setLoading] = useState(false)
  const [requirements, setRequirements] = useState(null)

  const handleParse = async () => {
    if (!jdText.trim()) {
      toast.error('Please enter a job description')
      return
    }
    setLoading(true)
    try {
      const result = await api.parseJD(jdText, sessionId)
      setRequirements(result.requirements)
      toast.success('JD parsed successfully!')
    } catch (e) {
      toast.error('Failed to parse JD: ' + (e.response?.data?.detail || e.message))
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    if (!requirements) {
      toast.error('Parse the JD first')
      return
    }
    onComplete(jdText, requirements)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      {/* Hero Section */}

<div className="mb-10 animate-fade-up">

  {/* Badge */}

  <div
    className="
      inline-flex
      items-center
      gap-2
      px-3
      py-1.5
      rounded-full
      border
      mb-6
    "
    style={{
      borderColor: 'rgba(129,140,248,0.18)',
      background: 'rgba(129,140,248,0.08)'
    }}
  >

    <Sparkles
      size={13}
      style={{
        color: 'var(--accent)'
      }}
    />

    <span
      className="
        text-[11px]
        uppercase
        tracking-[0.18em]
        font-medium
      "
      style={{
        color: 'var(--accent)'
      }}
    >
      AI Recruitment Intelligence
    </span>

  </div>

  {/* Heading */}

  <h1
    className="
      text-5xl
      font-bold
      leading-[1.05]
      tracking-tight
      max-w-4xl
    "
    style={{
      fontFamily: 'Space Grotesk',
      color: 'var(--text-primary)'
    }}
  >
    Hire Top Candidates
    <br />

    <span
      style={{
        color: 'var(--accent)'
      }}
    >
      10x faster
    </span>

  </h1>

  {/* Description */}

  <p
    className="
      mt-6
      text-lg
      leading-8
      max-w-3xl
    "
    style={{
      color: 'var(--text-muted)'
    }}
  >
    Parse job descriptions, analyze resumes,
    evaluate candidate fit, and generate
    AI-powered hiring shortlists in minutes.
  </p>

  {/* Stats */}

  <div className="flex items-center gap-8 mt-8">

    <div>

      <div
        className="
          text-2xl
          font-bold
        "
        style={{
          color: 'var(--text-primary)',
          fontFamily: 'Space Grotesk'
        }}
      >
        94%
      </div>

      <div
        className="text-sm mt-1"
        style={{
          color: 'var(--text-muted)'
        }}
      >
        Match Accuracy
      </div>

    </div>

    <div
      className="w-px h-10"
      style={{
        background: 'var(--border)'
      }}
    />

    <div>

      <div
        className="
          text-2xl
          font-bold
        "
        style={{
          color: 'var(--text-primary)',
          fontFamily: 'Space Grotesk'
        }}
      >
        45 sec
      </div>

      <div
        className="text-sm mt-1"
        style={{
          color: 'var(--text-muted)'
        }}
      >
        Avg Screening
      </div>

    </div>

    <div
      className="w-px h-10"
      style={{
        background: 'var(--border)'
      }}
    />

    <div>

      <div
        className="
          text-2xl
          font-bold
        "
        style={{
          color: 'var(--text-primary)',
          fontFamily: 'Space Grotesk'
        }}
      >
        12K+
      </div>

      <div
        className="text-sm mt-1"
        style={{
          color: 'var(--text-muted)'
        }}
      >
        Resumes Parsed
      </div>

    </div>

  </div>

</div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Job Description Text
            </label>
            <button
              onClick={() => setJdText(SAMPLE_JD)}
              className="text-xs px-3 py-1 rounded-md transition-colors"
              style={{ color: 'var(--accent)', background: 'rgba(129,140,248,0.1)' }}
            >
              Load Sample JD
            </button>
          </div>
          <textarea
            value={jdText}
            onChange={e => setJdText(e.target.value)}
            placeholder="Paste your Job Description here..."
            className="w-full rounded-xl p-4 text-sm resize-none outline-none transition-all"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              height: '420px',
              lineHeight: '1.6',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{jdText.length} characters</span>
            <button
              onClick={handleParse}
              disabled={loading || !jdText.trim()}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Parse JD
                </>
              )}
            </button>
          </div>
        </div>

        {/* Parsed Requirements */}
        <div>
          <div className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
            Extracted Requirements
          </div>
          {!requirements ? (
            <div
              className="rounded-xl flex flex-col items-center justify-center"
              style={{ background: 'var(--surface)', border: '1px dashed var(--border)', height: '420px' }}
            >
              <FileText size={40} style={{ color: 'var(--border)' }} className="mb-3" />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Requirements will appear here after parsing</p>
            </div>
          ) : (
            <div
              className="rounded-xl p-5 overflow-y-auto"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', height: '420px' }}
            >
              <div className="space-y-4 text-sm">
                <div>
                  <div className="font-semibold text-base" style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>
                    {requirements.title}
                  </div>
                  {requirements.company && (
                    <div style={{ color: 'var(--accent)' }}>{requirements.company}</div>
                  )}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {requirements.seniority_level && (
                      <span className="tag-pill" style={{ background: 'rgba(129,140,248,0.1)', color: 'var(--accent)' }}>
                        {requirements.seniority_level}
                      </span>
                    )}
                    {requirements.domain && (
                      <span className="tag-pill" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--green)' }}>
                        {requirements.domain}
                      </span>
                    )}
                    {requirements.location && (
                      <span className="tag-pill" style={{ background: 'rgba(100,100,150,0.15)', color: 'var(--text-muted)' }}>
                        📍 {requirements.location}
                      </span>
                    )}
                  </div>
                </div>

                {requirements.required_skills?.length > 0 && (
                  <div>
                    <div className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Required Skills</div>
                    <div className="flex flex-wrap gap-1.5">
                      {requirements.required_skills.map(s => (
                        <span key={s} className="tag-pill" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {requirements.preferred_skills?.length > 0 && (
                  <div>
                    <div className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Preferred Skills</div>
                    <div className="flex flex-wrap gap-1.5">
                      {requirements.preferred_skills.map(s => (
                        <span key={s} className="tag-pill" style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg p-3" style={{ background: 'var(--elevated)' }}>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Experience</div>
                    <div className="font-medium mt-1" style={{ color: 'var(--text-primary)' }}>
                      {requirements.min_experience_years}+ years
                    </div>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: 'var(--elevated)' }}>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Education</div>
                    <div className="font-medium mt-1 text-xs" style={{ color: 'var(--text-primary)' }}>
                      {requirements.education_requirements?.[0] || 'Not specified'}
                    </div>
                  </div>
                </div>

                {requirements.certifications?.length > 0 && (
                  <div>
                    <div className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Certifications</div>
                    {requirements.certifications.map(c => (
                      <div key={c} className="text-xs" style={{ color: 'var(--text-secondary)' }}>• {c}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {requirements && (
            <button
              onClick={handleContinue}
              className="btn btn-primary w-full mt-4"
            >
              Continue to Upload Candidates
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
