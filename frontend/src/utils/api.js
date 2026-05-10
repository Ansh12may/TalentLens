import axios from 'axios'

const API_BASE = '/api'

export const api = {

  async parseJD(jdText, sessionId) {

    const form = new FormData()

    form.append('jd_text', jdText)
    form.append('session_id', sessionId)

    const res = await axios.post(
      `${API_BASE}/parse-jd`,
      form
    )

    return res.data
  },

  async uploadResumes(files, sessionId) {

    const form = new FormData()

    form.append('session_id', sessionId)

    files.forEach(file => {
      form.append('files', file)
    })

    const res = await axios.post(
      `${API_BASE}/upload-resumes`,
      form,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    return res.data
  },

  async uploadLinkedIn(
    profilesJson,
    sessionId
  ) {

    const form = new FormData()

    form.append('session_id', sessionId)
    form.append('linkedin_data', profilesJson)

    const res = await axios.post(
      `${API_BASE}/upload-linkedin`,
      form
    )

    return res.data
  },

  async scoreCandidates(sessionId) {

    const form = new FormData()

    form.append('session_id', sessionId)

    const res = await axios.post(
      `${API_BASE}/score-candidates`,
      form
    )

    return res.data
  },

  async getResults(sessionId) {

    const res = await axios.get(
      `${API_BASE}/results/${sessionId}`
    )

    return res.data
  },

  // NEW
  async getSession(sessionId) {

    const res = await axios.get(
      `${API_BASE}/session/${sessionId}`
    )

    return res.data
  },

  async overrideScore(payload) {

    const res = await axios.post(
      `${API_BASE}/override`,
      payload
    )

    return res.data
  },

  getReportUrl(
    sessionId,
    format = 'html'
  ) {

    return `${API_BASE}/report/${sessionId}?format=${format}`
  }
}


// SESSION HELPERS

export const getOrCreateSessionId = () => {

  let sessionId = localStorage.getItem(
    'session_id'
  )

  if (!sessionId) {

    sessionId = crypto.randomUUID()

    localStorage.setItem(
      'session_id',
      sessionId
    )
  }

  return sessionId
}


export const clearSession = () => {

  localStorage.removeItem('session_id')
}