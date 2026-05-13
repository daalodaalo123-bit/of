'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

interface Patient {
  _id: string
  id: string
  name: string
}

interface Treatment {
  _id: string
  patientId: string
  patientName: string
  title: string
  notes: string
  beforeImages: string[]
  afterImages: string[]
  date: string
  createdAt: string
}

export default function Treatments() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Form state
  const [form, setForm] = useState({ title: '', notes: '', date: new Date().toISOString().split('T')[0] })
  const [beforeFiles, setBeforeFiles] = useState<File[]>([])
  const [afterFiles, setAfterFiles] = useState<File[]>([])
  const [beforePreviews, setBeforePreviews] = useState<string[]>([])
  const [afterPreviews, setAfterPreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  const beforeInputRef = useRef<HTMLInputElement>(null)
  const afterInputRef = useRef<HTMLInputElement>(null)
  const beforeCameraRef = useRef<HTMLInputElement>(null)
  const afterCameraRef = useRef<HTMLInputElement>(null)

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return patients.filter(p => p.name.toLowerCase().includes(q)).slice(0, 8)
  }, [searchQuery, patients])

  const handleSelectPatient = (p: Patient) => {
    setSelectedPatientId(p.id || p._id)
    setSearchQuery(p.name)
    setShowSuggestions(false)
  }

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setShowSuggestions(true)
    if (!val) {
      setSelectedPatientId('')
      setTreatments([])
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    if (selectedPatientId) fetchTreatments(selectedPatientId)
    else setTreatments([])
  }, [selectedPatientId])

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/patients')
      const data = await res.json()
      setPatients(Array.isArray(data) ? data : data.patients || [])
    } catch (e) {
      console.error(e)
    }
  }

  const fetchTreatments = async (patientId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/treatments?patientId=${patientId}`)
      const data = await res.json()
      setTreatments(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleFiles = (files: FileList | null, type: 'before' | 'after') => {
    if (!files) return
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (type === 'before') {
      setBeforeFiles(prev => [...prev, ...arr])
      arr.forEach(f => {
        const reader = new FileReader()
        reader.onload = e => setBeforePreviews(prev => [...prev, e.target?.result as string])
        reader.readAsDataURL(f)
      })
    } else {
      setAfterFiles(prev => [...prev, ...arr])
      arr.forEach(f => {
        const reader = new FileReader()
        reader.onload = e => setAfterPreviews(prev => [...prev, e.target?.result as string])
        reader.readAsDataURL(f)
      })
    }
  }

  const removeFile = (type: 'before' | 'after', idx: number) => {
    if (type === 'before') {
      setBeforeFiles(prev => prev.filter((_, i) => i !== idx))
      setBeforePreviews(prev => prev.filter((_, i) => i !== idx))
    } else {
      setAfterFiles(prev => prev.filter((_, i) => i !== idx))
      setAfterPreviews(prev => prev.filter((_, i) => i !== idx))
    }
  }

  const uploadFile = async (file: File): Promise<string> => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (!res.ok) throw new Error('Upload failed')
    const { url } = await res.json()
    return url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatientId) return
    const patient = patients.find(p => p.id === selectedPatientId || p._id === selectedPatientId)
    if (!patient) return

    setSubmitting(true)
    try {
      const totalFiles = beforeFiles.length + afterFiles.length
      let uploaded = 0

      setUploadProgress(`Uploading photos 0/${totalFiles}...`)

      const uploadAll = async (files: File[]) => {
        const urls: string[] = []
        for (const f of files) {
          const url = await uploadFile(f)
          urls.push(url)
          uploaded++
          setUploadProgress(`Uploading photos ${uploaded}/${totalFiles}...`)
        }
        return urls
      }

      const beforeUrls = await uploadAll(beforeFiles)
      const afterUrls = await uploadAll(afterFiles)

      setUploadProgress('Saving treatment record...')

      await fetch('/api/treatments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id || patient._id,
          patientName: patient.name,
          title: form.title,
          notes: form.notes,
          beforeImages: beforeUrls,
          afterImages: afterUrls,
          date: form.date,
        }),
      })

      setShowModal(false)
      resetForm()
      fetchTreatments(selectedPatientId)
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setSubmitting(false)
      setUploadProgress('')
    }
  }

  const resetForm = () => {
    setForm({ title: '', notes: '', date: new Date().toISOString().split('T')[0] })
    setBeforeFiles([])
    setAfterFiles([])
    setBeforePreviews([])
    setAfterPreviews([])
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this treatment record?')) return
    setDeleting(id)
    try {
      await fetch(`/api/treatments/${id}`, { method: 'DELETE' })
      setTreatments(prev => prev.filter(t => t._id !== id))
    } catch (e) {
      alert('Failed to delete')
    } finally {
      setDeleting(null)
    }
  }

  const onDrop = useCallback((e: React.DragEvent, type: 'before' | 'after') => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files, type)
  }, [])

  const selectedPatient = patients.find(p => p.id === selectedPatientId || p._id === selectedPatientId)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Treatment Photos</h1>
          <p className="text-sm text-muted mt-1">Before &amp; after photos stored on Cloudinary</p>
        </div>
        {selectedPatientId && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
          >
            <span className="text-lg leading-none">+</span> New Treatment Session
          </button>
        )}
      </div>

      {/* Patient Search */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">Search Patient</label>
        <div ref={searchRef} className="relative w-full sm:w-96">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-base">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              onFocus={() => searchQuery && setShowSuggestions(true)}
              placeholder="Type patient name..."
              className="w-full bg-background border border-border rounded-xl pl-10 pr-10 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedPatientId(''); setTreatments([]); setShowSuggestions(false) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              >✕</button>
            )}
          </div>
          {showSuggestions && filteredPatients.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-xl shadow-lg z-30 overflow-hidden">
              {filteredPatients.map(p => (
                <button
                  key={p._id}
                  onClick={() => handleSelectPatient(p)}
                  className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-accent/50 transition-colors flex items-center gap-2"
                >
                  <span className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center text-xs font-semibold shrink-0">
                    {p.name.charAt(0).toUpperCase()}
                  </span>
                  {p.name}
                </button>
              ))}
            </div>
          )}
          {showSuggestions && searchQuery && filteredPatients.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-xl shadow-lg z-30 px-4 py-3 text-sm text-muted">
              No patients found
            </div>
          )}
        </div>
        {selectedPatientId && (
          <p className="text-xs text-green-600 mt-2">✓ Showing treatments for <strong>{searchQuery}</strong></p>
        )}
      </div>

      {/* Treatment List */}
      {!selectedPatientId && (
        <div className="text-center py-20 text-muted">
          <div className="text-5xl mb-4">🖼️</div>
          <p className="text-lg font-medium">Select a patient to view their treatment photos</p>
        </div>
      )}

      {selectedPatientId && loading && (
        <div className="text-center py-20 text-muted">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p>Loading treatments...</p>
        </div>
      )}

      {selectedPatientId && !loading && treatments.length === 0 && (
        <div className="text-center py-20 text-muted bg-card border border-border rounded-2xl">
          <div className="text-5xl mb-4">📷</div>
          <p className="text-lg font-medium mb-2">No treatment records yet</p>
          <p className="text-sm mb-6">Click &quot;New Treatment Session&quot; to add before &amp; after photos</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors"
          >
            Add First Treatment
          </button>
        </div>
      )}

      <div className="space-y-6">
        {treatments.map(t => (
          <div key={t._id} className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between p-4 sm:p-5 border-b border-border gap-4">
              <div>
                <h3 className="font-semibold text-foreground">{t.title}</h3>
                <p className="text-xs text-muted mt-0.5">
                  {new Date(t.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                {t.notes && <p className="text-sm text-muted mt-2 max-w-xl">{t.notes}</p>}
              </div>
              <button
                onClick={() => handleDelete(t._id)}
                disabled={deleting === t._id}
                className="self-end sm:self-auto text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                {deleting === t._id ? 'Deleting...' : '🗑 Delete'}
              </button>
            </div>

            {/* Photos Grid */}
            <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Before */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-3">Before</p>
                {t.beforeImages.length === 0 ? (
                  <p className="text-xs text-muted italic">No before photos</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {t.beforeImages.map((url, i) => (
                      <button key={i} onClick={() => setLightboxImg(url)} className="aspect-square rounded-xl overflow-hidden border border-border hover:opacity-90 transition-opacity">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="before" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* After */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-green-600 mb-3">After</p>
                {t.afterImages.length === 0 ? (
                  <p className="text-xs text-muted italic">No after photos</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {t.afterImages.map((url, i) => (
                      <button key={i} onClick={() => setLightboxImg(url)} className="aspect-square rounded-xl overflow-hidden border border-border hover:opacity-90 transition-opacity">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="after" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── New Treatment Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget && !submitting) { setShowModal(false); resetForm() } }}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="text-lg font-semibold text-foreground">New Treatment Session</h2>
              {!submitting && (
                <button onClick={() => { setShowModal(false); resetForm() }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent/50 text-muted transition-colors">✕</button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Session 1 — Whitening"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Treatment details, observations..."
                  rows={3}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Before Upload */}
              <div>
                <label className="block text-sm font-semibold text-amber-600 mb-2">Before Photos</label>
                <div
                  onDrop={e => onDrop(e, 'before')}
                  onDragOver={e => e.preventDefault()}
                  className="border-2 border-dashed border-border rounded-xl p-4 sm:p-6 text-center"
                >
                  <p className="text-sm text-muted mb-4">Drop photos here or</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button type="button" onClick={() => beforeInputRef.current?.click()} className="px-4 py-2 bg-accent/50 hover:bg-accent rounded-lg text-sm font-medium transition-colors border border-border">
                      📁 Upload Photo
                    </button>
                    <button type="button" onClick={() => beforeCameraRef.current?.click()} className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg text-sm font-medium transition-colors border border-amber-200 dark:border-amber-900/50">
                      📷 Take Photo
                    </button>
                  </div>
                  <input ref={beforeInputRef} type="file" multiple accept="image/*" className="hidden" onChange={e => handleFiles(e.target.files, 'before')} />
                  <input ref={beforeCameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleFiles(e.target.files, 'before')} />
                </div>
                {beforePreviews.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                    {beforePreviews.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeFile('before', i)} className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full text-xs flex items-center justify-center transition-colors">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* After Upload */}
              <div>
                <label className="block text-sm font-semibold text-green-600 mb-2">After Photos</label>
                <div
                  onDrop={e => onDrop(e, 'after')}
                  onDragOver={e => e.preventDefault()}
                  className="border-2 border-dashed border-border rounded-xl p-4 sm:p-6 text-center"
                >
                  <p className="text-sm text-muted mb-4">Drop photos here or</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button type="button" onClick={() => afterInputRef.current?.click()} className="px-4 py-2 bg-accent/50 hover:bg-accent rounded-lg text-sm font-medium transition-colors border border-border">
                      📁 Upload Photo
                    </button>
                    <button type="button" onClick={() => afterCameraRef.current?.click()} className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-500 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg text-sm font-medium transition-colors border border-green-200 dark:border-green-900/50">
                      📷 Take Photo
                    </button>
                  </div>
                  <input ref={afterInputRef} type="file" multiple accept="image/*" className="hidden" onChange={e => handleFiles(e.target.files, 'after')} />
                  <input ref={afterCameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleFiles(e.target.files, 'after')} />
                </div>
                {afterPreviews.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                    {afterPreviews.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeFile('after', i)} className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full text-xs flex items-center justify-center transition-colors">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                {!submitting && (
                  <button type="button" onClick={() => { setShowModal(false); resetForm() }} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm text-muted hover:bg-accent/40 transition-colors">
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-medium text-sm transition-colors"
                >
                  {submitting ? (uploadProgress || 'Saving...') : 'Save Treatment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightboxImg && (
        <div className="fixed inset-0 bg-black/90 z-[80] flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
          <button onClick={() => setLightboxImg(null)} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full text-lg transition-colors">✕</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightboxImg} alt="Full size" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
