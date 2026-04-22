<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useScheduleStore } from '@/stores/schedule'
import AlertModal from '@/components/AlertModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { uploadTeacherPhoto } from '@/api/uploads'
import { DEFAULT_TEACHER_AVATAR, resolveTeacherPhotoUrl } from '@/utils/assets'
import type { NewTeacher, Teacher } from '@/types/lesson'

type TeacherDraft = NewTeacher & { id: null }
type TeacherForm = Omit<Teacher, 'id'> & { id: number | null }

const props = defineProps<{
  teacher: Teacher | TeacherDraft | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const store = useScheduleStore()

const isEditing = ref(false)
const editableTeacher = ref<TeacherForm | null>(null)
const isConfirmOpen = ref(false)
const isAlertOpen = ref(false)
const alertMessage = ref('')
const teacherToDelete = ref<number | null>(null)
const teacherNameToDelete = ref('')

watch(
  () => props.teacher,
  (teacher) => {
    if (!teacher) {
      editableTeacher.value = null
      return
    }
    const isNew = teacher.id === null

    if (isNew) {
      isEditing.value = true
      editableTeacher.value = {
        id: null,
        name: '',
        photo: '',
      }
    } else {
      isEditing.value = false
      editableTeacher.value = JSON.parse(JSON.stringify(teacher)) as TeacherForm
    }
  },
  { immediate: true },
)

const showAlert = (message: string) => {
  alertMessage.value = message
  isAlertOpen.value = true
}

const setFallbackImage = (event: Event, fallbackSrc: string) => {
  const image = event.target as HTMLImageElement | null
  if (image) {
    image.src = fallbackSrc
  }
}

const enableEditing = () => {
  isEditing.value = true
}

const cancelEditing = () => {
  const current = props.teacher
  if (!current) {
    emit('close')
    return
  }
  if (current.id === null) {
    emit('close')
    return
  }
  editableTeacher.value = JSON.parse(JSON.stringify(current)) as TeacherForm
  isEditing.value = false
}

const requestDeleteTeacher = () => {
  const t = props.teacher
  if (!t || t.id === null) return
  teacherToDelete.value = t.id
  teacherNameToDelete.value = t.name
  isConfirmOpen.value = true
}

const handleDeleteConfirm = async () => {
  if (teacherToDelete.value === null) return
  try {
    await store.deleteTeacher(teacherToDelete.value)
    teacherToDelete.value = null
    teacherNameToDelete.value = ''
    isConfirmOpen.value = false
    emit('close')
  } catch {
    showAlert('Не удалось удалить преподавателя')
  }
}

const saveTeacher = async () => {
  if (!editableTeacher.value) return

  if (editableTeacher.value.name.trim() === '') {
    showAlert('Введите имя преподавателя')
    return
  }

  try {
    if (editableTeacher.value.id !== null) {
      await store.updateTeacher(editableTeacher.value as Teacher)
    } else {
      const newTeacher: NewTeacher = {
        name: editableTeacher.value.name,
        photo: editableTeacher.value.photo,
      }
      await store.addTeacher(newTeacher)
    }
    emit('close')
  } catch {
    showAlert('Не удалось сохранить преподавателя')
  }
}

const handlePhotoUpload = async (event: Event) => {
  if (!editableTeacher.value) return
  const target = event.target as HTMLInputElement | null
  const file = target?.files?.[0]
  if (file) {
    try {
      const uploaded = await uploadTeacherPhoto(file)
      editableTeacher.value.photo = uploaded.path
    } catch {
      showAlert('Не удалось загрузить фото')
    }
  }
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    if (isConfirmOpen.value || isAlertOpen.value) {
      return
    }
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isOpen" class="fixed inset-0 z-50">
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')">
          <div class="fixed inset-0 flex items-center justify-center p-4">
            <div
              class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-transparent dark:border-slate-700"
              @click.stop
            >
              <div class="overflow-y-auto p-6" style="max-height: calc(90vh - 8px)">
                <template v-if="teacher && !isEditing && teacher.id !== null">
                  <h3 class="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4 pr-8">
                    {{ teacher.name }}
                  </h3>
                  <div class="flex justify-center mb-6">
                    <img
                      :src="resolveTeacherPhotoUrl(teacher.photo)"
                      :alt="teacher.name"
                      class="w-40 h-40 rounded-lg object-cover border-2 border-gray-100 dark:border-slate-600 shadow-md"
                      @error="setFallbackImage($event, DEFAULT_TEACHER_AVATAR)"
                    />
                  </div>
                  <div class="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <button
                      type="button"
                      @click="enableEditing"
                      class="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                    >
                      Редактировать
                    </button>
                    <button
                      type="button"
                      @click="requestDeleteTeacher"
                      class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Удалить
                    </button>
                  </div>
                </template>
                <template v-else-if="editableTeacher">
                  <h3 class="text-xl font-bold text-gray-900 dark:text-slate-100 mb-4 pr-8">
                    {{ editableTeacher.id === null ? 'Новый преподаватель' : 'Редактирование' }}
                  </h3>
                  <form @submit.prevent="saveTeacher" class="space-y-4">
                    <div>
                      <label for="teacher-name" class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Имя преподавателя
                      </label>
                      <input
                        id="teacher-name"
                        v-model="editableTeacher.name"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-amber-400 focus:border-transparent dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label for="teacher-photo" class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Фото преподавателя
                      </label>
                      <input
                        id="teacher-photo"
                        type="file"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-amber-400 focus:border-transparent dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100"
                        @change="handlePhotoUpload"
                      />
                      <img
                        v-if="editableTeacher.photo"
                        :src="resolveTeacherPhotoUrl(editableTeacher.photo)"
                        alt=""
                        class="mt-2 w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-slate-600"
                        @error="setFallbackImage($event, DEFAULT_TEACHER_AVATAR)"
                      />
                    </div>
                    <div class="flex gap-3 pt-4">
                      <button
                        type="submit"
                        class="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                      >
                        Сохранить
                      </button>
                      <button
                        type="button"
                        @click="cancelEditing"
                        class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                      >
                        Отмена
                      </button>
                    </div>
                  </form>
                </template>
              </div>

              <button
                type="button"
                @click="emit('close')"
                class="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <ConfirmModal
    :isOpen="isConfirmOpen"
    :message="`Вы уверены, что хотите удалить преподавателя ${teacherNameToDelete}?`"
    @confirm="handleDeleteConfirm"
    @close="isConfirmOpen = false"
  />

  <AlertModal
    :isOpen="isAlertOpen"
    :message="alertMessage"
    @close="isAlertOpen = false"
  />
</template>
