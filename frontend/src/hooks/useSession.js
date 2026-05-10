import {
  useState,
  useCallback
} from 'react'

import { v4 as uuidv4 } from 'uuid'


export function useSession() {

  // Fresh session every app load
  const [sessionId] = useState(
    () => uuidv4().slice(0, 8)
  )

  const [step, setStep] =
    useState(1)

  const [jdText, setJdText] =
    useState('')

  const [requirements, setRequirements] =
    useState(null)

  const [uploadedFiles, setUploadedFiles] =
    useState([])

  const [linkedinData, setLinkedinData] =
    useState('')

  const [parsedCandidates, setParsedCandidates] =
    useState([])

  const [rankedCandidates, setRankedCandidates] =
    useState([])

  const [isLoading, setIsLoading] =
    useState(false)

  const [loadingMsg, setLoadingMsg] =
    useState('')

  const [error, setError] =
    useState(null)


  const reset = useCallback(() => {

    setStep(1)

    setJdText('')

    setRequirements(null)

    setUploadedFiles([])

    setLinkedinData('')

    setParsedCandidates([])

    setRankedCandidates([])

    setIsLoading(false)

    setLoadingMsg('')

    setError(null)

    window.location.reload()

  }, [])


  return {

    sessionId,

    step,
    setStep,

    jdText,
    setJdText,

    requirements,
    setRequirements,

    uploadedFiles,
    setUploadedFiles,

    linkedinData,
    setLinkedinData,

    parsedCandidates,
    setParsedCandidates,

    rankedCandidates,
    setRankedCandidates,

    isLoading,
    setIsLoading,

    loadingMsg,
    setLoadingMsg,

    error,
    setError,

    reset
  }
}