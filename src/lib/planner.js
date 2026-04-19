import { defaultAppData } from '../data/defaultAppData.js'
import { createEntityId, isPlainObject } from './dataUtils.js'
import { readAppData, readNormalizedSection, updateNormalizedSection } from './storage.js'

export const plannerSections = [
  { id: 'today', label: 'Today' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'thisWeek', label: 'This Week' },
  { id: 'thisMonth', label: 'This Month' },
]
export const todayMissionLimit = 5

const sectionIds = plannerSections.map((section) => section.id)

function normalizeTask(task, index, sectionId) {
  if (typeof task === 'string') {
    return {
      id: `${sectionId}-${index + 1}`,
      title: task,
      priority: 'medium',
      dueDate: '',
      targetDuration: 60,
      progressMinutes: 0,
      completed: false,
    }
  }

  const targetDuration = Math.max(0, Number(task?.targetDuration ?? task?.durationMinutes ?? 60) || 0)
  const progressMinutes = Math.max(
    0,
    Number(task?.progressMinutes ?? task?.currentProgress ?? 0) || 0,
  )
  const completed =
    typeof task?.completed === 'boolean'
      ? task.completed
      : targetDuration > 0 && progressMinutes >= targetDuration

  return {
    id: task?.id ?? `${sectionId}-${index + 1}`,
    title: task?.title ?? task?.name ?? `Task ${index + 1}`,
    priority:
      task?.priority === 'high' || task?.priority === 'low' ? task.priority : 'medium',
    dueDate: task?.dueDate ?? '',
    targetDuration,
    progressMinutes: targetDuration > 0 ? Math.min(progressMinutes, targetDuration) : progressMinutes,
    completed,
  }
}

function normalizePlannerData(rawPlanner) {
  const safePlanner = defaultAppData.planner

  if (!isPlainObject(rawPlanner)) {
    return {
      today: [],
      tomorrow: [],
      thisWeek: [],
      thisMonth: [],
    }
  }

  const todaySource = Array.isArray(rawPlanner.today) ? rawPlanner.today : safePlanner.today
  const tomorrowSource = Array.isArray(rawPlanner.tomorrow) ? rawPlanner.tomorrow : safePlanner.tomorrow
  const thisWeekSource = Array.isArray(rawPlanner.thisWeek)
    ? rawPlanner.thisWeek
    : Array.isArray(rawPlanner.upcoming)
      ? rawPlanner.upcoming
      : safePlanner.thisWeek
  const thisMonthSource = Array.isArray(rawPlanner.thisMonth)
    ? rawPlanner.thisMonth
    : Array.isArray(rawPlanner.inbox)
      ? rawPlanner.inbox
      : safePlanner.thisMonth

  return {
    today: todaySource.map((task, index) => normalizeTask(task, index, 'today')),
    tomorrow: tomorrowSource.map((task, index) => normalizeTask(task, index, 'tomorrow')),
    thisWeek: thisWeekSource.map((task, index) =>
      normalizeTask(task, index, 'thisWeek'),
    ),
    thisMonth: thisMonthSource.map((task, index) =>
      normalizeTask(task, index, 'thisMonth'),
    ),
  }
}

export function readPlannerState(appData = readAppData()) {
  return readNormalizedSection('planner', normalizePlannerData, appData)
}

function writePlannerState(updater) {
  const nextAppData = updateNormalizedSection('planner', normalizePlannerData, updater)
  return readPlannerState(nextAppData)
}

export function addPlannerTask(sectionId, taskInput) {
  return writePlannerState((currentPlanner) => {
    const targetSection = sectionIds.includes(sectionId) ? sectionId : 'today'
    if (targetSection === 'today' && currentPlanner.today.length >= todayMissionLimit) {
      return currentPlanner
    }
    const targetDuration = Math.max(0, Number(taskInput.targetDuration) || 0)
    const progressMinutes = Math.max(0, Number(taskInput.progressMinutes) || 0)
    const newTask = {
      id: createEntityId('task'),
      title: taskInput.title.trim(),
      priority: taskInput.priority,
      dueDate: taskInput.dueDate,
      targetDuration,
      progressMinutes: targetDuration > 0 ? Math.min(progressMinutes, targetDuration) : progressMinutes,
      completed:
        Boolean(taskInput.completed) ||
        (targetDuration > 0 && progressMinutes >= targetDuration),
    }

    return {
      ...currentPlanner,
      [targetSection]: [...currentPlanner[targetSection], newTask],
    }
  })
}

export function updatePlannerTask(sectionId, taskId, updates) {
  return writePlannerState((currentPlanner) => {
    if (!sectionIds.includes(sectionId)) {
      return currentPlanner
    }

    return {
      ...currentPlanner,
      [sectionId]: currentPlanner[sectionId].map((task) =>
        task.id === taskId
          ? normalizeTask(
              {
                ...task,
                ...updates,
                title: (updates.title ?? task.title).trim(),
              },
              0,
              sectionId,
            )
          : task,
      ),
    }
  })
}

export function addPlannerTaskProgress(sectionId, taskId, minutesToAdd) {
  return writePlannerState((currentPlanner) => {
    if (!sectionIds.includes(sectionId)) {
      return currentPlanner
    }

    const normalizedIncrement = Math.max(0, Number(minutesToAdd) || 0)

    return {
      ...currentPlanner,
      [sectionId]: currentPlanner[sectionId].map((task) => {
        if (task.id !== taskId) {
          return task
        }

        const targetDuration = Math.max(0, Number(task.targetDuration) || 0)
        const nextProgress = task.progressMinutes + normalizedIncrement
        const cappedProgress =
          targetDuration > 0 ? Math.min(nextProgress, targetDuration) : nextProgress

        return normalizeTask(
          {
            ...task,
            progressMinutes: cappedProgress,
            completed: targetDuration > 0 ? cappedProgress >= targetDuration : task.completed,
          },
          0,
          sectionId,
        )
      }),
    }
  })
}

export function deletePlannerTask(sectionId, taskId) {
  return writePlannerState((currentPlanner) => {
    if (!sectionIds.includes(sectionId)) {
      return currentPlanner
    }

    return {
      ...currentPlanner,
      [sectionId]: currentPlanner[sectionId].filter((task) => task.id !== taskId),
    }
  })
}

export function togglePlannerTask(sectionId, taskId) {
  return writePlannerState((currentPlanner) => {
    if (!sectionIds.includes(sectionId)) {
      return currentPlanner
    }

    return {
      ...currentPlanner,
      [sectionId]: currentPlanner[sectionId].map((task) =>
        task.id === taskId
          ? (() => {
              const nextCompleted = !task.completed
              const targetDuration = Math.max(0, Number(task.targetDuration) || 0)
              const nextProgressMinutes = nextCompleted
                ? targetDuration > 0
                  ? targetDuration
                  : task.progressMinutes
                : task.progressMinutes

              return normalizeTask(
                {
                  ...task,
                  completed: nextCompleted,
                  progressMinutes: nextProgressMinutes,
                },
                0,
                sectionId,
              )
            })()
          : task,
      ),
    }
  })
}
