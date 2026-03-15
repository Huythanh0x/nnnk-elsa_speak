import { useState, useMemo } from 'react'
import { buildPhrase, createStudySet } from '../lib/api'

export default function StudySetForm({ session }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState(null) // { msg, type: 'error'|'success'|'info' }
  const [loading, setLoading] = useState(false)

  const phrases = useMemo(
    () => content.split('\n').map(buildPhrase).filter(Boolean),
    [content],
  )

  async function handleSubmit() {
    if (!title.trim()) { setStatus({ msg: 'Please enter a title.', type: 'error' }); return }
    if (!phrases.length) { setStatus({ msg: 'Add at least one phrase.', type: 'error' }); return }
    setLoading(true)
    setStatus({ msg: 'Submitting…', type: 'info' })
    try {
      await createStudySet(session, title.trim(), phrases)
      setStatus({ msg: 'Study set created!', type: 'success' })
      setTitle('')
      setContent('')
    } catch (err) {
      setStatus({ msg: err.message || 'Request failed', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  function handleCancel() {
    setTitle('')
    setContent('')
    setStatus(null)
  }

  const statusColor = {
    error: 'text-red-400',
    success: 'text-green-400',
    info: 'text-zinc-400',
  }

  return (
    <div>
      {status && (
        <p className={`mb-4 text-sm ${statusColor[status.type]}`}>{status.msg}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
        {/* Form */}
        <div className="space-y-4">
          <div>
            <label htmlFor="set-title">Title</label>
            <input
              id="set-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. My phrases"
            />
          </div>
          <div>
            <label htmlFor="set-content">
              Content <span className="text-zinc-500 font-normal">(one phrase per line)</span>
            </label>
            <textarea
              id="set-content"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={'love 3000\nSorry if it\'s all too much'}
              rows={12}
              className="resize-y min-h-[200px]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={handleCancel}
              className="text-sm text-zinc-500 hover:text-zinc-300 px-4 py-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed
                         text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              Submit
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-surface border border-[#2d2d35] rounded-xl p-4 sticky top-4">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Preview</h3>
          {phrases.length === 0 ? (
            <p className="text-sm text-zinc-500">Enter content (one phrase per line)</p>
          ) : (
            <ul className="space-y-0 max-h-96 overflow-y-auto text-sm divide-y divide-[#2d2d35]">
              {phrases.map((p, i) => (
                <li key={i} className="py-1.5 flex gap-2">
                  <span className="text-zinc-600 shrink-0 w-6 text-right">{i + 1}.</span>
                  <span className="text-zinc-200">{p.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
