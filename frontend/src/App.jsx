import React, { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import JDStep from './pages/JDStep'
import UploadStep from './pages/UploadStep'
import ScoringStep from './pages/ScoringStep'
import ResultsStep from './pages/ResultsStep'
import { useSession } from './hooks/useSession'

export default function App() {
  const {
    sessionId, step, setStep,
    requirements, setRequirements,
    jdText, setJdText,
    rankedCandidates, setRankedCandidates,
    reset
  } = useSession()

  const handleJDComplete = (text, reqs) => {
    setJdText(text)
    setRequirements(reqs)
    setStep(2)
  }

  const handleUploadComplete = () => {
    setStep(3)
  }

  const handleScoringComplete = (candidates) => {
    setRankedCandidates(candidates)
    setStep(4)
  }

  const handleReset = () => {
    reset()
    setStep(1)
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#f0f0ff',
            border: '1px solid #2a2a3e',
            fontSize: '13px',
            borderRadius: '10px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      <Layout currentStep={step} sessionId={sessionId}>
        {step === 1 && (
          <JDStep sessionId={sessionId} onComplete={handleJDComplete} />
        )}
        {step === 2 && (
          <UploadStep
            sessionId={sessionId}
            requirements={requirements}
            onComplete={handleUploadComplete}
          />
        )}
        {step === 3 && (
          <ScoringStep sessionId={sessionId} onComplete={handleScoringComplete} />
        )}
        {step === 4 && (
          <ResultsStep
            sessionId={sessionId}
            candidates={rankedCandidates}
            requirements={requirements}
            onReset={handleReset}
          />
        )}
      </Layout>
    </>
  )
}
