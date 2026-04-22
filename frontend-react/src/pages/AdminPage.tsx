import { useEffect, useMemo, useState, type ChangeEvent, type SyntheticEvent } from 'react'
import { uploadSchoolLogo } from '../api/uploads'
import { DirectionModal } from '../components/DirectionModal'
import { LevelModal } from '../components/LevelModal'
import { TeacherModal } from '../components/TeacherModal'
import { DEFAULT_TEACHER_AVATAR, resolveBrandingLogoUrl, resolveTeacherPhotoUrl } from '../utils/assets'
import { getDirections, getLevels, getTeachers, type Direction, type Level, type Teacher } from '../services/schedule'
import { getSettings, SITE_SETTINGS_UPDATED_EVENT, updateSettings } from '../services/settings'

const DEFAULT_SCHOOL_NAME = 'Школа танцев'
const SYSTEM_LEVEL_ALIASES = ['для всех', 'все уровни']

const setFallbackImage = (event: SyntheticEvent<HTMLImageElement>, fallbackSrc: string) => {
  event.currentTarget.src = fallbackSrc
}

export function AdminPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false)

  const [directions, setDirections] = useState<Direction[]>([])
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null)
  const [isDirectionModalOpen, setIsDirectionModalOpen] = useState(false)

  const [levels, setLevels] = useState<Level[]>([])
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null)
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false)

  const [schoolNameDraft, setSchoolNameDraft] = useState('')
  const [logoPathDraft, setLogoPathDraft] = useState<string | null>(null)
  const [settingsMessage, setSettingsMessage] = useState('')
  const [settingsError, setSettingsError] = useState('')
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const managedLevels = useMemo(
    () => levels.filter((level) => !SYSTEM_LEVEL_ALIASES.includes(level.name.trim().toLowerCase())),
    [levels],
  )

  const logoPreviewUrl = resolveBrandingLogoUrl(logoPathDraft)

  const reloadAll = async () => {
    setError(null)
    try {
      const [teachersData, directionsData, levelsData, settings] = await Promise.all([
        getTeachers(),
        getDirections(),
        getLevels(),
        getSettings(),
      ])
      setTeachers(teachersData)
      setDirections(directionsData)
      setLevels(levelsData)
      setSchoolNameDraft(settings.schoolName || DEFAULT_SCHOOL_NAME)
      setLogoPathDraft(settings.logoPath)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить данные админки')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void reloadAll()
  }, [])

  const loadTeachers = () =>
    getTeachers()
      .then(setTeachers)
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка загрузки преподавателей'))

  const loadDirections = () =>
    getDirections()
      .then(setDirections)
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка загрузки направлений'))

  const loadLevels = () =>
    getLevels()
      .then(setLevels)
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка загрузки уровней'))

  const openTeacherModal = (teacher?: Teacher) => {
    setSelectedTeacher(teacher ?? null)
    setIsTeacherModalOpen(true)
  }

  const openDirectionModal = (direction?: Direction) => {
    setSelectedDirection(direction ?? null)
    setIsDirectionModalOpen(true)
  }

  const openLevelModal = (level?: Level) => {
    setSelectedLevel(level ?? null)
    setIsLevelModalOpen(true)
  }

  const saveStudioSettings = async () => {
    setSettingsMessage('')
    setSettingsError('')
    const normalizedName = schoolNameDraft.trim()
    if (!normalizedName) {
      setSettingsError('Введите название школы')
      return
    }
    setIsSavingSettings(true)
    try {
      const saved = await updateSettings({ schoolName: normalizedName, logoPath: logoPathDraft })
      setSchoolNameDraft(saved.schoolName || DEFAULT_SCHOOL_NAME)
      setLogoPathDraft(saved.logoPath)
      setSettingsMessage('Настройки сохранены')
      window.dispatchEvent(new Event(SITE_SETTINGS_UPDATED_EVENT))
    } catch {
      setSettingsError('Не удалось сохранить настройки')
    } finally {
      setIsSavingSettings(false)
    }
  }

  const handleSchoolLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    setSettingsMessage('')
    setSettingsError('')
    const file = event.target.files?.[0]
    if (!file) return
    setIsUploadingLogo(true)
    try {
      const uploaded = await uploadSchoolLogo(file)
      setLogoPathDraft(uploaded.path)
    } catch {
      setSettingsError('Не удалось загрузить логотип')
    } finally {
      setIsUploadingLogo(false)
      event.target.value = ''
    }
  }

  if (isLoading) {
    return <p className="text-slate-600 dark:text-slate-300">Загрузка админки...</p>
  }

  return (
    <div className="space-y-8 py-2">
      {error && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
        <section className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm md:p-5 dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Настройки школы</h2>
            <p className="text-sm text-gray-600 dark:text-slate-300">Название используется в шапке, футере и title страницы</p>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <label className="block">
              <span className="mb-1 block text-sm text-gray-700 dark:text-slate-300">Название школы</span>
              <input
                type="text"
                value={schoolNameDraft}
                onChange={(event) => setSchoolNameDraft(event.target.value)}
                maxLength={80}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 md:text-base dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </label>
            <button
              type="button"
              disabled={isSavingSettings}
              onClick={() => void saveStudioSettings()}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm text-white hover:bg-amber-600 disabled:opacity-60 md:text-base dark:bg-amber-700 dark:text-amber-50 dark:hover:bg-amber-800"
            >
              {isSavingSettings ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <p className="text-sm text-gray-700 dark:text-slate-300">Логотип</p>
            <div className="flex flex-wrap items-center gap-3">
              {logoPreviewUrl ? (
                <img
                  src={logoPreviewUrl}
                  alt="Логотип школы"
                  className="h-14 max-w-[180px] rounded border border-gray-200 bg-white object-contain p-1 dark:border-slate-600 dark:bg-slate-900"
                />
              ) : (
                <span className="text-sm text-gray-500 dark:text-slate-400">Логотип не загружен</span>
              )}
              <label className="inline-flex cursor-pointer items-center rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 dark:bg-blue-700 dark:text-blue-50 dark:hover:bg-blue-800">
                {isUploadingLogo ? 'Загрузка...' : 'Загрузить логотип'}
                <input
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => void handleSchoolLogoUpload(event)}
                />
              </label>
              <button
                type="button"
                disabled={!logoPathDraft}
                onClick={() => setLogoPathDraft(null)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Удалить логотип
              </button>
            </div>
          </div>

          {settingsMessage && <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">{settingsMessage}</p>}
          {settingsError && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{settingsError}</p>}
        </section>

        <section className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm md:p-5 dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Управление преподавателями</h2>
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-blue-700 md:text-sm dark:bg-blue-900/35 dark:text-blue-200">
                Всего: {teachers.length}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-300">Состав и карточки преподавателей</p>
          </div>

          <button
            type="button"
            onClick={() => openTeacherModal()}
            className="mb-4 rounded-lg bg-amber-500 px-3.5 py-2 text-sm text-white hover:bg-amber-600 md:text-base dark:bg-amber-700 dark:text-amber-50 dark:hover:bg-amber-800"
          >
            Добавить преподавателя
          </button>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {teachers.map((teacher) => (
              <button
                key={teacher.id}
                type="button"
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-left transition hover:border-blue-200 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-blue-500"
                onClick={() => openTeacherModal(teacher)}
              >
                <img
                  src={resolveTeacherPhotoUrl(teacher.photo)}
                  alt={teacher.name}
                  className="h-14 w-14 shrink-0 rounded-full object-cover"
                  onError={(event) => setFallbackImage(event, DEFAULT_TEACHER_AVATAR)}
                />
                <p className="text-base font-semibold leading-tight text-gray-900 dark:text-slate-100">{teacher.name}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm md:p-5 dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Управление направлениями</h2>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-emerald-700 md:text-sm dark:bg-emerald-900/30 dark:text-emerald-200">
                Всего: {directions.length}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-300">Справочник направлений для расписания</p>
          </div>

          <button
            type="button"
            onClick={() => openDirectionModal()}
            className="mb-4 rounded-lg bg-amber-500 px-3.5 py-2 text-sm text-white hover:bg-amber-600 md:text-base dark:bg-amber-700 dark:text-amber-50 dark:hover:bg-amber-800"
          >
            Добавить направление
          </button>

          <ul className="space-y-2">
            {directions.map((direction) => (
              <li key={direction.id}>
                <button
                  type="button"
                  className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left transition hover:border-emerald-200 hover:bg-emerald-50/40 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-emerald-500 dark:hover:bg-emerald-900/20"
                  onClick={() => openDirectionModal(direction)}
                >
                  <span className="font-medium leading-tight text-gray-800 dark:text-slate-100">{direction.name}</span>
                  <span className="text-sm font-semibold text-emerald-600" aria-hidden="true">
                    {'>'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm md:p-5 dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Управление уровнями</h2>
              <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-violet-700 md:text-sm dark:bg-violet-900/30 dark:text-violet-200">
                Всего: {managedLevels.length}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-300">Единый справочник уровней занятий</p>
          </div>

          <button
            type="button"
            onClick={() => openLevelModal()}
            className="mb-4 rounded-lg bg-amber-500 px-3.5 py-2 text-sm text-white hover:bg-amber-600 md:text-base dark:bg-amber-700 dark:text-amber-50 dark:hover:bg-amber-800"
          >
            Добавить уровень
          </button>

          <ul className="space-y-2">
            {managedLevels.map((level) => (
              <li key={level.id}>
                <button
                  type="button"
                  className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left transition hover:border-violet-200 hover:bg-violet-50/40 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-violet-500 dark:hover:bg-violet-900/20"
                  onClick={() => openLevelModal(level)}
                >
                  <span className="inline-flex items-center gap-2 font-medium leading-tight text-gray-800 dark:text-slate-100">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: level.color }} />
                    {level.name}
                  </span>
                  <span className="text-sm font-semibold text-violet-600" aria-hidden="true">
                    {'>'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <TeacherModal
        teacher={selectedTeacher}
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        onSaved={() => void loadTeachers()}
      />

      <DirectionModal
        direction={selectedDirection}
        allDirections={directions}
        isOpen={isDirectionModalOpen}
        onClose={() => setIsDirectionModalOpen(false)}
        onSaved={() => void loadDirections()}
      />

      <LevelModal
        level={selectedLevel}
        allLevels={levels}
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        onSaved={() => void loadLevels()}
      />
    </div>
  )
}
