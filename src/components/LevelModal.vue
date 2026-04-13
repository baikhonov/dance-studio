<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useScheduleStore } from '@/stores/schedule'
import AlertModal from '@/components/AlertModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import type { Level, NewLevel } from '@/types/lesson'

type LevelDraft = NewLevel & { id: null }
type LevelForm = Omit<Level, 'id'> & { id: number | null }

const props = defineProps<{
  level: Level | LevelDraft | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const store = useScheduleStore()
const FOR_ALL_ALIASES = ['для всех', 'все уровни']

const isEditing = ref(false)
const editableLevel = ref<LevelForm | null>(null)
const isConfirmOpen = ref(false)
const isAlertOpen = ref(false)
const alertMessage = ref('')
const levelToDelete = ref<number | null>(null)
const levelNameToDelete = ref('')

watch(
  () => props.level,
  (level) => {
    if (!level) {
      editableLevel.value = null
      return
    }

    if (level.id === null) {
      isEditing.value = true
      editableLevel.value = { id: null, name: '' }
      return
    }

    isEditing.value = false
    editableLevel.value = JSON.parse(JSON.stringify(level)) as LevelForm
  },
  { immediate: true },
)

const showAlert = (message: string) => {
  alertMessage.value = message
  isAlertOpen.value = true
}

const enableEditing = () => {
  isEditing.value = true
}

const requestDeleteLevel = () => {
  const current = props.level
  if (!current || current.id === null) return
  levelToDelete.value = current.id
  levelNameToDelete.value = current.name
  isConfirmOpen.value = true
}

const handleDeleteConfirm = () => {
  if (levelToDelete.value === null) return
  store.deleteLevel(levelToDelete.value)
  levelToDelete.value = null
  levelNameToDelete.value = ''
  isConfirmOpen.value = false
  emit('close')
}

const saveLevel = () => {
  if (!editableLevel.value) return

  const normalizedName = editableLevel.value.name.trim()
  const currentLevelId = editableLevel.value.id
  if (!normalizedName) {
    showAlert('Введите название уровня')
    return
  }

  if (FOR_ALL_ALIASES.includes(normalizedName.toLowerCase())) {
    showAlert('Уровень «Для всех» системный и не редактируется в справочнике')
    return
  }

  const isDuplicate = store.levels.some((level) => {
    if (currentLevelId !== null && level.id === currentLevelId) {
      return false
    }
    return level.name.trim().toLowerCase() === normalizedName.toLowerCase()
  })
  if (isDuplicate) {
    showAlert('Такой уровень уже существует')
    return
  }

  if (editableLevel.value.id !== null) {
    store.updateLevel({ id: editableLevel.value.id, name: normalizedName })
  } else {
    store.addLevel({ name: normalizedName })
  }

  emit('close')
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    if (isConfirmOpen.value || isAlertOpen.value) return
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
              class="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
              @click.stop
            >
              <div class="overflow-y-auto p-6" style="max-height: calc(90vh - 8px)">
                <template v-if="level && !isEditing && level.id !== null">
                  <h3 class="text-2xl font-bold text-gray-900 mb-4 pr-8">
                    {{ level.name }}
                  </h3>
                  <p class="text-sm text-gray-600 mb-6">
                    При удалении уровня у связанных занятий поле уровня будет очищено.
                  </p>
                  <div class="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      @click="enableEditing"
                      class="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                    >
                      Редактировать
                    </button>
                    <button
                      type="button"
                      @click="requestDeleteLevel"
                      class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Удалить
                    </button>
                  </div>
                </template>
                <template v-else-if="editableLevel">
                  <h3 class="text-xl font-bold text-gray-900 mb-4 pr-8">
                    {{ editableLevel.id === null ? 'Новый уровень' : 'Редактирование' }}
                  </h3>
                  <form @submit.prevent="saveLevel" class="space-y-4">
                    <div>
                      <label for="level-name" class="block text-sm font-medium text-gray-700 mb-1">
                        Название уровня
                      </label>
                      <input
                        id="level-name"
                        v-model="editableLevel.name"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                        required
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
                        @click="emit('close')"
                        class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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
                class="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
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
    :message="`Вы уверены, что хотите удалить уровень ${levelNameToDelete}? У связанных занятий уровень будет очищен.`"
    @confirm="handleDeleteConfirm"
    @close="isConfirmOpen = false"
  />

  <AlertModal :isOpen="isAlertOpen" :message="alertMessage" @close="isAlertOpen = false" />
</template>
