import { defaultAppData } from '../data/defaultAppData.js'
import { createEntityId, getLocalDateKey } from './dataUtils.js'
import { readAppData, updateAppData } from './storage.js'

function getTemplateFallback() {
  return defaultAppData.routineTemplates[0] ?? null
}

export function normalizeRoutineStep(step, index) {
  if (typeof step === 'string') {
    return {
      id: `step-${index + 1}`,
      label: step,
      timeLabel: '',
    }
  }

  return {
    id: step?.id ?? `step-${index + 1}`,
    label: step?.label ?? `Step ${index + 1}`,
    timeLabel: step?.timeLabel ?? step?.time ?? '',
  }
}

export function normalizeRoutineTemplate(template, index = 0) {
  return {
    id: template?.id ?? `template-${index + 1}`,
    name: template?.name ?? `My Routine ${index + 1}`,
    timeOfDay: template?.timeOfDay ?? 'anytime',
    steps: Array.isArray(template?.steps)
      ? template.steps.map(normalizeRoutineStep)
      : [],
  }
}

function createPersonalRoutineTemplate() {
  return {
    id: createEntityId('routine'),
    name: 'My Routine',
    timeOfDay: 'anytime',
    steps: [],
  }
}

function ensureSelectedRoutineTemplate(currentData) {
  const routineTemplates = Array.isArray(currentData.routineTemplates)
    ? currentData.routineTemplates.map((template, index) =>
        normalizeRoutineTemplate(template, index),
      )
    : []
  const selectedTemplateId = currentData.profile?.selectedRoutineTemplateId
  const selectedTemplate =
    routineTemplates.find((template) => template.id === selectedTemplateId) ??
    routineTemplates[0] ??
    null

  if (selectedTemplate) {
    return {
      nextData: {
        ...currentData,
        routineTemplates,
      },
      routineTemplates,
      selectedTemplate,
    }
  }

  const personalRoutine = createPersonalRoutineTemplate()

  return {
    nextData: {
      ...currentData,
      routineTemplates: [personalRoutine],
      profile: {
        ...currentData.profile,
        selectedRoutineTemplateId: personalRoutine.id,
      },
    },
    routineTemplates: [personalRoutine],
    selectedTemplate: personalRoutine,
  }
}

function stripTemplateTaskKeysFromOrder(dailyProgressByDate, taskKeys) {
  return Object.fromEntries(
    Object.entries(dailyProgressByDate ?? {}).map(([dateKey, dayData]) => [
      dateKey,
      {
        ...dayData,
        routineTaskOrder: Array.isArray(dayData?.routineTaskOrder)
          ? dayData.routineTaskOrder.filter((taskKey) => !taskKeys.includes(taskKey))
          : dayData?.routineTaskOrder,
      },
    ]),
  )
}

function normalizeRoutineAddition(addition, index = 0) {
  if (typeof addition === 'string') {
    return {
      id: `addition-${index + 1}`,
      label: addition,
      status: 'incomplete',
    }
  }

  return {
    id: addition?.id ?? `addition-${index + 1}`,
    label: addition?.label ?? addition?.title ?? `Today's task ${index + 1}`,
    status:
      addition?.status === 'completed' || addition?.status === 'skipped'
        ? addition.status
        : addition?.completed
          ? 'completed'
          : 'incomplete',
  }
}

function getTemplateStepStatus({ currentDay, templateId, stepId }) {
  const statusByTemplate = currentDay.routineStatusByTemplate ?? {}
  const explicitStatus = statusByTemplate[templateId]?.[stepId]

  if (explicitStatus === 'completed' || explicitStatus === 'skipped') {
    return explicitStatus
  }

  const completedStepIds = currentDay.completionByTemplate?.[templateId] ?? []
  return completedStepIds.includes(stepId) ? 'completed' : 'incomplete'
}

function buildTemplateTasks({ template, currentDay }) {
  if (!template) {
    return []
  }

  return template.steps.map((step, index) => ({
    key: `template:${step.id}`,
    id: step.id,
    templateId: template.id,
    label: step.label,
    timeLabel: step.timeLabel ?? '',
    status: getTemplateStepStatus({
      currentDay,
      templateId: template.id,
      stepId: step.id,
    }),
    kind: 'template',
    metaLabel: `Routine ${index + 1}`,
  }))
}

function buildAdditionTasks(additions) {
  return additions.map((addition, index) => ({
    key: `addition:${addition.id}`,
    id: addition.id,
    label: addition.label,
    status: addition.status,
    kind: 'addition',
    metaLabel: `Today only ${index + 1}`,
  }))
}

function orderRoutineTasks(tasks, order = []) {
  const taskMap = new Map(tasks.map((task) => [task.key, task]))
  const orderedTasks = order.map((taskKey) => taskMap.get(taskKey)).filter(Boolean)
  const remainingTasks = tasks.filter((task) => !order.includes(task.key))

  return [...orderedTasks, ...remainingTasks]
}

function buildRoutineDayState({ template, currentDay }) {
  const additions = Array.isArray(currentDay.routineAdditions)
    ? currentDay.routineAdditions.map(normalizeRoutineAddition)
    : []
  const templateTasks = buildTemplateTasks({ template, currentDay })
  const additionTasks = buildAdditionTasks(additions)
  const todaysTasks = orderRoutineTasks(
    [...templateTasks, ...additionTasks],
    currentDay.routineTaskOrder ?? [],
  )
  const completedCount = todaysTasks.filter((task) => task.status === 'completed').length
  const skippedCount = todaysTasks.filter((task) => task.status === 'skipped').length
  const totalCount = todaysTasks.length

  return {
    todaysAdditions: additions,
    todaysTasks,
    completedCount,
    skippedCount,
    totalCount,
    completionPercent: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
    nextSuggestedTask:
      todaysTasks.find((task) => task.status === 'incomplete') ?? null,
  }
}

export function readRoutineState(appData = readAppData()) {
  const templates = Array.isArray(appData.routineTemplates)
    ? appData.routineTemplates.map(normalizeRoutineTemplate)
    : []

  const fallbackTemplate = getTemplateFallback()
    ? normalizeRoutineTemplate(getTemplateFallback())
    : null
  const selectedTemplateId = appData.profile?.selectedRoutineTemplateId
  const selectedTemplate =
    templates.find((template) => template.id === selectedTemplateId) ??
    templates[0] ??
    fallbackTemplate ??
    null
  const todayKey = getLocalDateKey()
  const allDailyProgress = appData.dailyProgressByDate ?? {}
  const todayProgress = appData.dailyProgressByDate?.[todayKey] ?? {}
  const routineDayState = buildRoutineDayState({
    template: selectedTemplate,
    currentDay: todayProgress,
  })
  const savedDateKeys = Object.keys(allDailyProgress)
  const previousTrackedDays = savedDateKeys.filter((dateKey) => dateKey !== todayKey).length

  return {
    templates,
    selectedTemplateId: selectedTemplate?.id ?? '',
    selectedRoutineName: selectedTemplate?.name ?? '',
    routineSteps: selectedTemplate?.steps ?? [],
    todayKey,
    dailyProgressByDate: allDailyProgress,
    previousTrackedDays,
    ...routineDayState,
  }
}

export function addRoutineTemplateTask({ label, timeLabel = '' }) {
  const trimmedLabel = label.trim()
  const trimmedTimeLabel = timeLabel.trim()

  if (!trimmedLabel) {
    return readRoutineState()
  }

  const nextAppData = updateAppData((currentData) => {
    const { nextData, routineTemplates, selectedTemplate } =
      ensureSelectedRoutineTemplate(currentData)

    return {
      ...nextData,
      routineTemplates: routineTemplates.map((template) =>
        template.id === selectedTemplate.id
          ? {
              ...template,
              steps: [
                ...template.steps,
                {
                  id: createEntityId('routine-step'),
                  label: trimmedLabel,
                  timeLabel: trimmedTimeLabel,
                },
              ],
            }
          : template,
      ),
    }
  })

  return readRoutineState(nextAppData)
}

export function updateRoutineTemplateTask({ stepId, label, timeLabel = '' }) {
  const trimmedLabel = label.trim()
  const trimmedTimeLabel = timeLabel.trim()

  if (!trimmedLabel) {
    return readRoutineState()
  }

  const nextAppData = updateAppData((currentData) => ({
    ...currentData,
    routineTemplates: (Array.isArray(currentData.routineTemplates)
      ? currentData.routineTemplates
      : []
    ).map((template, index) => {
      const normalizedTemplate = normalizeRoutineTemplate(template, index)

      return {
        ...normalizedTemplate,
        steps: normalizedTemplate.steps.map((step) =>
          step.id === stepId
            ? {
                ...step,
                label: trimmedLabel,
                timeLabel: trimmedTimeLabel,
              }
            : step,
        ),
      }
    }),
  }))

  return readRoutineState(nextAppData)
}

export function deleteRoutineTemplateTask({ stepId }) {
  const templateTaskKey = `template:${stepId}`

  const nextAppData = updateAppData((currentData) => ({
    ...currentData,
    routineTemplates: (Array.isArray(currentData.routineTemplates)
      ? currentData.routineTemplates
      : []
    ).map((template, index) => {
      const normalizedTemplate = normalizeRoutineTemplate(template, index)

      return {
        ...normalizedTemplate,
        steps: normalizedTemplate.steps.filter((step) => step.id !== stepId),
      }
    }),
    dailyProgressByDate: Object.fromEntries(
      Object.entries(currentData.dailyProgressByDate ?? {}).map(([dateKey, dayData]) => {
        const completionByTemplate = Object.fromEntries(
          Object.entries(dayData?.completionByTemplate ?? {}).map(
            ([templateId, completedStepIds]) => [
              templateId,
              Array.isArray(completedStepIds)
                ? completedStepIds.filter((id) => id !== stepId)
                : completedStepIds,
            ],
          ),
        )
        const routineStatusByTemplate = Object.fromEntries(
          Object.entries(dayData?.routineStatusByTemplate ?? {}).map(
            ([templateId, statusMap]) => {
              const nextStatusMap = { ...(statusMap ?? {}) }
              delete nextStatusMap[stepId]

              return [templateId, nextStatusMap]
            },
          ),
        )

        return [
          dateKey,
          {
            ...dayData,
            completionByTemplate,
            routineStatusByTemplate,
            routineTaskOrder: Array.isArray(dayData?.routineTaskOrder)
              ? dayData.routineTaskOrder.filter((taskKey) => taskKey !== templateTaskKey)
              : dayData?.routineTaskOrder,
          },
        ]
      }),
    ),
  }))

  return readRoutineState(nextAppData)
}

export function moveRoutineTemplateTask({ stepId, direction }) {
  const nextAppData = updateAppData((currentData) => {
    const routineTemplates = Array.isArray(currentData.routineTemplates)
      ? currentData.routineTemplates.map((template, index) =>
          normalizeRoutineTemplate(template, index),
        )
      : []
    const selectedTemplateId = currentData.profile?.selectedRoutineTemplateId
    const selectedTemplate =
      routineTemplates.find((template) => template.id === selectedTemplateId) ??
      routineTemplates[0] ??
      null

    if (!selectedTemplate) {
      return currentData
    }

    const currentIndex = selectedTemplate.steps.findIndex((step) => step.id === stepId)

    if (currentIndex === -1) {
      return currentData
    }

    const nextIndex =
      direction === 'up'
        ? currentIndex - 1
        : direction === 'down'
          ? currentIndex + 1
          : currentIndex

    if (nextIndex < 0 || nextIndex >= selectedTemplate.steps.length) {
      return currentData
    }

    const nextSteps = [...selectedTemplate.steps]
    const [movedStep] = nextSteps.splice(currentIndex, 1)
    nextSteps.splice(nextIndex, 0, movedStep)

    return {
      ...currentData,
      routineTemplates: routineTemplates.map((template) =>
        template.id === selectedTemplate.id
          ? {
              ...template,
              steps: nextSteps,
            }
          : template,
      ),
      dailyProgressByDate: stripTemplateTaskKeysFromOrder(
        currentData.dailyProgressByDate,
        selectedTemplate.steps.map((step) => `template:${step.id}`),
      ),
    }
  })

  return readRoutineState(nextAppData)
}

export function updateSelectedRoutineTemplate(templateId) {
  const nextAppData = updateAppData((currentData) => ({
    ...currentData,
    profile: {
      ...currentData.profile,
      selectedRoutineTemplateId: templateId,
    },
  }))

  return readRoutineState(nextAppData)
}

export function toggleRoutineStepCompletion({ dateKey, templateId, stepId }) {
  return setRoutineTaskStatus({
    dateKey,
    templateId,
    stepId,
    status: 'completed',
  })
}

export function setRoutineTaskStatus({
  dateKey,
  templateId,
  stepId,
  additionId,
  status,
}) {
  const nextAppData = updateAppData((currentData) => {
    const dailyProgressByDate = currentData.dailyProgressByDate ?? {}
    const currentDay = dailyProgressByDate[dateKey] ?? {}
    const completionByTemplate = currentDay.completionByTemplate ?? {}
    const routineStatusByTemplate = currentDay.routineStatusByTemplate ?? {}
    const nextDay = { ...currentDay }

    if (templateId && stepId) {
      const currentStatus = getTemplateStepStatus({
        currentDay,
        templateId,
        stepId,
      })
      const nextStatus =
        currentStatus === status
          ? 'incomplete'
          : status === 'completed' || status === 'skipped'
            ? status
            : 'incomplete'
      const completedStepIds = completionByTemplate[templateId] ?? []
      const nextCompletedStepIds =
        nextStatus === 'completed'
          ? [...completedStepIds.filter((id) => id !== stepId), stepId]
          : completedStepIds.filter((id) => id !== stepId)

      nextDay.completionByTemplate = {
        ...completionByTemplate,
        [templateId]: nextCompletedStepIds,
      }
      nextDay.routineStatusByTemplate = {
        ...routineStatusByTemplate,
        [templateId]: {
          ...(routineStatusByTemplate[templateId] ?? {}),
          [stepId]: nextStatus,
        },
      }
    }

    if (additionId) {
      const routineAdditions = Array.isArray(currentDay.routineAdditions)
        ? currentDay.routineAdditions.map(normalizeRoutineAddition)
        : []

      nextDay.routineAdditions = routineAdditions.map((addition) => {
        if (addition.id !== additionId) {
          return addition
        }

        const nextStatus =
          addition.status === status
            ? 'incomplete'
            : status === 'completed' || status === 'skipped'
              ? status
              : 'incomplete'

        return {
          ...addition,
          status: nextStatus,
        }
      })
    }

    return {
      ...currentData,
      dailyProgressByDate: {
        ...dailyProgressByDate,
        [dateKey]: nextDay,
      },
    }
  })

  return readRoutineState(nextAppData)
}

export function addRoutineAddition({ dateKey, label }) {
  const trimmedLabel = label.trim()

  if (!trimmedLabel) {
    return readRoutineState()
  }

  const nextAppData = updateAppData((currentData) => {
    const dailyProgressByDate = currentData.dailyProgressByDate ?? {}
    const currentDay = dailyProgressByDate[dateKey] ?? {}
    const routineAdditions = Array.isArray(currentDay.routineAdditions)
      ? currentDay.routineAdditions.map(normalizeRoutineAddition)
      : []

    return {
      ...currentData,
      dailyProgressByDate: {
        ...dailyProgressByDate,
        [dateKey]: {
          ...currentDay,
          routineAdditions: [
            ...routineAdditions,
            {
              id: createEntityId('routine-addition'),
              label: trimmedLabel,
              status: 'incomplete',
            },
          ],
        },
      },
    }
  })

  return readRoutineState(nextAppData)
}

export function toggleRoutineAdditionCompletion({ dateKey, additionId }) {
  return setRoutineTaskStatus({
    dateKey,
    additionId,
    status: 'completed',
  })
}

export function deleteRoutineAddition({ dateKey, additionId }) {
  const nextAppData = updateAppData((currentData) => {
    const dailyProgressByDate = currentData.dailyProgressByDate ?? {}
    const currentDay = dailyProgressByDate[dateKey] ?? {}
    const routineAdditions = Array.isArray(currentDay.routineAdditions)
      ? currentDay.routineAdditions.map(normalizeRoutineAddition)
      : []

    return {
      ...currentData,
      dailyProgressByDate: {
        ...dailyProgressByDate,
        [dateKey]: {
          ...currentDay,
          routineAdditions: routineAdditions.filter(
            (addition) => addition.id !== additionId,
          ),
        },
      },
    }
  })

  return readRoutineState(nextAppData)
}

export function moveRoutineTask({ dateKey, taskKey, direction }) {
  const nextAppData = updateAppData((currentData) => {
    const currentRoutineState = readRoutineState(currentData)
    const orderedTaskKeys = currentRoutineState.todaysTasks.map((task) => task.key)
    const currentIndex = orderedTaskKeys.indexOf(taskKey)

    if (currentIndex === -1) {
      return currentData
    }

    const nextIndex =
      direction === 'up' ? currentIndex - 1 : direction === 'down' ? currentIndex + 1 : currentIndex

    if (nextIndex < 0 || nextIndex >= orderedTaskKeys.length) {
      return currentData
    }

    const nextOrder = [...orderedTaskKeys]
    const [movedTask] = nextOrder.splice(currentIndex, 1)
    nextOrder.splice(nextIndex, 0, movedTask)

    return {
      ...currentData,
      dailyProgressByDate: {
        ...(currentData.dailyProgressByDate ?? {}),
        [dateKey]: {
          ...(currentData.dailyProgressByDate?.[dateKey] ?? {}),
          routineTaskOrder: nextOrder,
        },
      },
    }
  })

  return readRoutineState(nextAppData)
}
