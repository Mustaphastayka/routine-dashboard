import { useRef, useState } from 'react'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import PageHero from '../components/ui/PageHero.jsx'
import SectionHeader from '../components/ui/SectionHeader.jsx'
import {
  exportAppData,
  importAppData,
  readAppData,
  resetAppData,
  updateAppData,
} from '../lib/storage.js'

function Settings() {
  const fileInputRef = useRef(null)
  const [appData, setAppData] = useState(() => readAppData())
  const [profileName, setProfileName] = useState(appData.profile?.name ?? '')
  const [feedbackMessage, setFeedbackMessage] = useState('')

  const syncAppData = (nextAppData) => {
    setAppData(nextAppData)
    setProfileName(nextAppData.profile?.name ?? '')
  }

  const handleProfileSubmit = (event) => {
    event.preventDefault()

    const nextAppData = updateAppData((currentData) => ({
      ...currentData,
      profile: {
        ...currentData.profile,
        name: profileName.trim(),
      },
    }))

    syncAppData(nextAppData)
    setFeedbackMessage('Profile name saved.')
  }

  const handleResetData = () => {
    const shouldReset = window.confirm(
      'Reset all app data? This will remove routines, planner items, budget entries, and reports history.',
    )

    if (!shouldReset) {
      return
    }

    const nextAppData = resetAppData()
    syncAppData(nextAppData)
    setFeedbackMessage('All data has been reset.')
  }

  const handleExportData = () => {
    const jsonData = exportAppData()
    const blob = new Blob([jsonData], { type: 'application/json' })
    const blobUrl = URL.createObjectURL(blob)
    const downloadLink = document.createElement('a')

    downloadLink.href = blobUrl
    downloadLink.download = 'routine-dashboard-data.json'
    downloadLink.click()
    URL.revokeObjectURL(blobUrl)
    setFeedbackMessage('Data exported as JSON.')
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportData = async (event) => {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) {
      return
    }

    try {
      const fileText = await selectedFile.text()
      const nextAppData = importAppData(fileText)
      syncAppData(nextAppData)
      setFeedbackMessage('JSON data imported successfully.')
    } catch {
      setFeedbackMessage('Import failed. Please choose a valid JSON export file.')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 md:gap-6">
      <PageHero
        eyebrow="Settings"
        title="Settings"
        description="Manage your profile, backup data, or start fresh."
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Card as="article" variant="hero">
          <SectionHeader
            eyebrow="Profile"
            title="Update your name"
            description="Your name appears on the Dashboard."
          />

          <form className="mt-5 space-y-4" onSubmit={handleProfileSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">
                Profile name
              </span>
              <input
                type="text"
                value={profileName}
                onChange={(event) => setProfileName(event.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20"
              />
            </label>

            <Button type="submit" className="w-full">
              Save profile
            </Button>
          </form>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Data"
            title="Export, import, or reset"
            description="Back up your data, restore from a backup, or clear everything."
          />

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Button type="button" onClick={handleExportData}>
              Export JSON
            </Button>
            <Button type="button" variant="secondary" onClick={handleImportClick}>
              Import JSON
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImportData}
          />

          <div className="mt-5 rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-4">
            <p className="text-sm text-slate-300">
              Current profile name:
              <span className="ml-2 font-medium text-white">
                {appData.profile?.name?.trim() || 'Not set'}
              </span>
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="mt-5 w-full border-rose-300/20 text-rose-100 hover:bg-rose-400/10"
            onClick={handleResetData}
          >
            Reset all data
          </Button>

          {feedbackMessage ? (
            <p className="mt-4 text-sm text-slate-400">{feedbackMessage}</p>
          ) : null}
        </Card>
      </section>
    </div>
  )
}

export default Settings
