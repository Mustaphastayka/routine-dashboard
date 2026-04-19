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
    }
  }

  return {
    id: step?.id ?? `step-${index + 1}`,
    label: step?.label ?? `Step ${index + 1}`,
  }
}

export function normalizeRoutineTemplate(template, index = 0) {
  return {
    id: template?.id ?? `template-${index + 1}`,
    name: template?.name ?? `Template ${index + 1}`,
    timeOfDay: template?.timeOfDay ?? 'anytime',
    steps: Array.isArray(template?.steps)
      ? template.steps.map(normalizeRoutineStep)
      : [],
  }
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
    status: getTemplateStepStatus({
      currentDay,
      templateId: template.id,
      stepId: step.id,
    }),
    kind: 'template',
    metaLabel: `Step ${index + 1}`,
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
    todayKey,
    dailyProgressByDate: allDailyProgress,
    previousTrackedDays,
    ...routineDayState,
  }
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
