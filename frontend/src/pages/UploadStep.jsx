import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Linkedin, X, CheckCircle, ChevronRight, Plus } from 'lucide-react'
import { api } from '../utils/api'
import toast from 'react-hot-toast'

const SAMPLE_LINKEDIN = JSON.stringify([
  {
    "firstName": "Priya",
    "lastName": "Sharma",
    "headline": "Senior Software Engineer | Python, React, AWS",
    "location": "San Francisco, CA",
    "email": "priya.sharma@email.com",
    "summary": "8 years of experience building scalable fintech systems. Led 3 engineering teams, shipped payment infrastructure processing $2B annually.",
    "skills": ["Python", "React", "TypeScript", "AWS", "PostgreSQL", "Kafka", "Kubernetes", "Redis", "Node.js", "GraphQL"],
    "experience": [
      {"company": "Plaid", "title": "Senior Software Engineer", "duration": "3 years", "description": "Led backend for real-time transaction enrichment API serving 5000 req/s"},
      {"company": "Robinhood", "title": "Software Engineer", "duration": "2.5 years", "description": "Built order execution system, PCI-DSS compliance framework"}
    ],
    "education": [{"school": "UC Berkeley", "degree": "B.S. Computer Science", "year": 2016}],
    "certifications": ["AWS Solutions Architect Professional", "PCI-DSS Practitioner"],
    "projects": ["Open-sourced fintech-utils library (2.3k stars)", "Built real-time fraud detection system with 99.7% accuracy"]
  }
], null, 2)

function FileCard({ file, onRemove }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--elevated)', border: '1px solid var(--border)' }}>
      <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: 'rgba(129,140,248,0.1)' }}>
        <FileText size={14} style={{ color: 'var(--accent)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{file.name}</div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(1)} KB</div>
      </div>
      <button onClick={() => onRemove(file)} className="p-1 rounded hover:bg-red-500/10 transition-colors">
        <X size={14} style={{ color: 'var(--text-muted)' }} />
      </button>
    </div>
  )
}

export default function UploadStep({ sessionId, requirements, onComplete }) {
  const [files, setFiles] = useState([])
  const [linkedinText, setLinkedinText] = useState('')
  const [activeTab, setActiveTab] = useState('resume')
  const [loading, setLoading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [parsedCount, setParsedCount] = useState(0)
  const [totalParsed, setTotalParsed] = useState(0)

  const onDrop = useCallback(accepted => {
    setFiles(prev => [...prev, ...accepted.filter(f =>
      !prev.find(p => p.name === f.name)
    )])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxFiles: 20
  })

  const removeFile = (file) => {
    setFiles(prev => prev.filter(f => f.name !== file.name))
  }

  const handleUpload = async () => {
    if (activeTab === 'resume' && files.length === 0) {
      toast.error('Please upload at least one resume')
      return
    }
    if (activeTab === 'linkedin' && !linkedinText.trim()) {
      toast.error('Please paste LinkedIn profile JSON')
      return
    }

    setLoading(true)
    try {
      let count = 0
      if (activeTab === 'resume' && files.length > 0) {
        const result = await api.uploadResumes(files, sessionId)
        count = result.parsed
        if (result.errors?.length) {
          result.errors.forEach(e => toast.error(`${e.file}: ${e.error}`))
        }
      }
      if (activeTab === 'linkedin' && linkedinText.trim()) {
        const result = await api.uploadLinkedIn(linkedinText, sessionId)
        count += result.parsed
      }
      setParsedCount(count)
      setTotalParsed(prev => prev + count)
      setUploaded(true)
      toast.success(`${count} candidate(s) parsed successfully!`)
    } catch (e) {
      toast.error('Upload failed: ' + (e.response?.data?.detail || e.message))
    } finally {
      setLoading(false)
    }
  }

  const handleAddMore = () => {
    setUploaded(false)
    setFiles([])
    setLinkedinText('')
    // totalParsed is intentionally preserved so the running total stays accurate
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
          <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Step 2 of 4</span>
        </div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
          Upload Candidates
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          Upload PDF/DOCX resumes or paste LinkedIn profile JSON data for evaluation.
        </p>
      </div>

      {/* JD Summary */}
      <div className="rounded-xl p-4 mb-6 flex items-center gap-4" style={{ background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)' }}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(129,140,248,0.15)' }}>
          <FileText size={18} style={{ color: 'var(--accent)' }} />
        </div>
        <div>
          <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{requirements?.title}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {requirements?.required_skills?.slice(0, 5).join(' · ')} {requirements?.required_skills?.length > 5 ? `+${requirements.required_skills.length - 5} more` : ''}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg mb-6 w-fit" style={{ background: 'var(--elevated)' }}>
        {[
          { id: 'resume', label: 'Resume Files', icon: FileText },
          { id: 'linkedin', label: 'LinkedIn JSON', icon: Linkedin }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all"
            style={{
              background: activeTab === tab.id ? 'var(--surface)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.3)' : 'none'
            }}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'resume' ? (
        <div>
          <div
            {...getRootProps()}
            className={`rounded-xl p-10 text-center cursor-pointer transition-all ${isDragActive ? 'drop-zone-active' : ''}`}
            style={{
              border: `2px dashed ${isDragActive ? 'var(--accent)' : 'var(--border)'}`,
              background: isDragActive ? 'rgba(129,140,248,0.05)' : 'var(--surface)',
            }}
          >
            <input {...getInputProps()} />
            <Upload size={36} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {isDragActive ? 'Drop files here' : 'Drag & drop resumes here'}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              PDF, DOCX, DOC · Up to 20 files
            </div>
            <button className="btn btn-secondary mt-4 text-xs">Browse Files</button>
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                {files.length} file(s) selected
              </div>
              {files.map(f => <FileCard key={f.name} file={f} onRemove={removeFile} />)}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              LinkedIn Profile JSON
            </label>
            <button
              onClick={() => setLinkedinText(SAMPLE_LINKEDIN)}
              className="text-xs px-3 py-1 rounded-md transition-colors"
              style={{ color: 'var(--accent)', background: 'rgba(129,140,248,0.1)' }}
            >
              Load Sample Profile
            </button>
          </div>
          <textarea
            value={linkedinText}
            onChange={e => setLinkedinText(e.target.value)}
            placeholder='[{"firstName": "John", "lastName": "Doe", "skills": [...], ...}]'
            className="w-full rounded-xl p-4 text-sm resize-none outline-none font-mono"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              height: '280px',
              fontSize: '12px',
            }}
          />
          <div className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            Paste a JSON array of LinkedIn profile objects. Single object also accepted.
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-6">
        {uploaded ? (
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--green)' }}>
            <CheckCircle size={16} />
            {parsedCount} parsed this batch · {totalParsed} total candidate(s)
            <button onClick={handleAddMore} className="ml-4 btn btn-secondary text-xs py-1.5">
              <Plus size={12} /> Add More
            </button>
          </div>
        ) : (
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {files.length > 0 || linkedinText ? `Ready to parse ${files.length || 1} candidate(s)` : 'No files selected'}
          </div>
        )}

        <div className="flex gap-3">
          {!uploaded ? (
            <button
              onClick={handleUpload}
              disabled={loading || (files.length === 0 && !linkedinText.trim())}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Parse Candidates
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="btn btn-primary"
            >
              Run AI Scoring
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
