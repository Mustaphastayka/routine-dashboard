import { APP_STORAGE_KEY, defaultAppData } from '../data/defaultAppData.js'
import { cloneValue, isPlainObject } from './dataUtils.js'

const sectionKeys = Object.keys(defaultAppData)
const legacyDemoRoutineTemplate = {
  id: 'morning-reset',
  name: 'Morning Reset',
  timeOfDay: 'morning',
  steps: [
    { id: 'drink-water', label: 'Drink water' },
    { id: 'review-priorities', label: 'Review priorities' },
    { id: 'start-focus-block', label: 'Start first focus block' },
  ],
}
const legacyDemoTaskKeys = legacyDemoRoutineTemplate.steps.map(
  (step) => `template:${step.id}`,
)

function isExactLegacyDemoRoutineTemplate(template) {
  if (!isPlainObject(template)) {
    return false
  }

  if (
    template.id !== legacyDemoRoutineTemplate.id ||
    template.name !== legacyDemoRoutineTemplate.name ||
    template.timeOfDay !== legacyDemoRoutineTemplate.timeOfDay ||
    !Array.isArray(template.steps) ||
    template.steps.length !== legacyDemoRoutineTemplate.steps.length
  ) {
    return false
  }

  return legacyDemoRoutineTemplate.steps.every((step, index) => {
    const candidate = template.steps[index]
    return candidate?.id === step.id && candidate?.label === step.label
  })
}

function removeLegacyDemoRoutineTemplate(appData) {
  const routineTemplates = Array.isArray(appData.routineTemplates)
    ? appData.routineTemplates
    : []
  const hasLegacyTemplate = routineTemplates.some(isExactLegacyDemoRoutineTemplate)

  if (!hasLegacyTemplate) {
    return appData
  }

  const cleanedDailyProgressByDate = Object.fromEntries(
    Object.entries(appData.dailyProgressByDate ?? {}).map(([dateKey, dayData]) => {
      const completionByTemplate = { ...(dayData?.completionByTemplate ?? {}) }
      const routineStatusByTemplate = { ...(dayData?.routineStatusByTemplate ?? {}) }
      delete completionByTemplate[legacyDemoRoutineTemplate.id]
      delete routineStatusByTemplate[legacyDemoRoutineTemplate.id]

      const routineTaskOrder = Array.isArray(dayData?.routineTaskOrder)
        ? dayData.routineTaskOrder.filter((taskKey) => !legacyDemoTaskKeys.includes(taskKey))
        : dayData?.routineTaskOrder

      return [
        dateKey,
        {
          ...dayData,
          completionByTemplate,
          routineStatusByTemplate,
          routineTaskOrder,
        },
      ]
    }),
  )

  return {
    ...appData,
    profile: {
      ...appData.profile,
      selectedRoutineTemplateId:
        appData.profile?.selectedRoutineTemplateId === legacyDemoRoutineTemplate.id
          ? ''
          : appData.profile?.selectedRoutineTemplateId ?? '',
    },
    routineTemplates: routineTemplates.filter(
      (template) => !isExactLegacyDemoRoutineTemplate(template),
    ),
    dailyProgressByDate: cleanedDailyProgressByDate,
  }
}

function getStorage() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null
  }

  return window.localStorage
}

function sanitizeAppData(rawData) {
  if (!isPlainObject(rawData)) {
    return cloneValue(defaultAppData)
  }

  const safeData = cloneValue(defaultAppData)

  sectionKeys.forEach((key) => {
    const defaultValue = defaultAppData[key]
    const rawValue = rawData[key]

    if (Array.isArray(defaultValue)) {
      safeData[key] = Array.isArray(rawValue) ? rawValue : cloneValue(defaultValue)
      return
    }

    if (isPlainObject(defaultValue)) {
      safeData[key] = isPlainObject(rawValue)
        ? { ...defaultValue, ...rawValue }
        : cloneValue(defaultValue)
      return
    }

    safeData[key] = rawValue ?? defaultValue
  })

  return removeLegacyDemoRoutineTemplate(safeData)
}

function writeAppData(appData) {
  const storage = getStorage()

  if (!storage) {
    return sanitizeAppData(appData)
  }

  const safeData = sanitizeAppData(appData)
  storage.setItem(APP_STORAGE_KEY, JSON.stringify(safeData))
  return safeData
}

export function getDefaultAppData() {
  return cloneValue(defaultAppData)
}

export function readAppData() {
  const storage = getStorage()

  if (!storage) {
    return getDefaultAppData()
  }

  const storedValue = storage.getItem(APP_STORAGE_KEY)

  if (!storedValue) {
    return writeAppData(defaultAppData)
  }

  try {
    const parsedValue = JSON.parse(storedValue)
    const safeData = sanitizeAppData(parsedValue)

    if (JSON.stringify(parsedValue) !== JSON.stringify(safeData)) {
      return writeAppData(safeData)
    }

    return safeData
  } catch {
    return writeAppData(defaultAppData)
  }
}

export function updateAppData(updater) {
  const currentData = readAppData()
  const nextData =
    typeof updater === 'function' ? updater(cloneValue(currentData)) : updater

  return writeAppData(nextData)
}

export function readDataSection(section, appData = readAppData()) {
  const fallbackValue = defaultAppData[section]

  if (!(section in appData)) {
    return cloneValue(fallbackValue)
  }

  return cloneValue(appData[section])
}

export function updateDataSection(section, updater) {
  return updateAppData((currentData) => {
    const currentSection = cloneValue(currentData[section] ?? defaultAppData[section])
    const nextSection =
      typeof updater === 'function' ? updater(currentSection) : updater

    return {
      ...currentData,
      [section]:
        nextSection === undefined ? cloneValue(defaultAppData[section]) : nextSection,
    }
  })
}

export function readNormalizedSection(
  section,
  normalize,
  appData = readAppData(),
) {
  return normalize(readDataSection(section, appData))
}

export function updateNormalizedSection(section, normalize, updater) {
  return updateDataSection(section, (currentSection) => {
    const normalizedCurrent = normalize(currentSection)
    const nextSection =
      typeof updater === 'function' ? updater(normalizedCurrent) : updater

    return normalize(nextSection)
  })
}

export function resetAppData() {
  return writeAppData(defaultAppData)
}

export function exportAppData() {
  return JSON.stringify(readAppData(), null, 2)
}

export function importAppData(rawData) {
  const parsedData =
    typeof rawData === 'string' ? JSON.parse(rawData) : cloneValue(rawData)

  return writeAppData(parsedData)
}

export { APP_STORAGE_KEY, sectionKeys as appDataSections }
