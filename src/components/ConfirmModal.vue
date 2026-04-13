<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    title?: string
    message: string
    confirmText?: string
    cancelText?: string
  }>(),
  {
    title: 'Подтверждение',
    confirmText: 'Да',
    cancelText: 'Отмена',
  },
)

const emit = defineEmits<{
  confirm: []
  close: []
}>()

const handleConfirm = () => {
  emit('confirm')
  emit('close')
}

const handleClose = () => {
  emit('close')
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    event.stopImmediatePropagation()
    handleClose()
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
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" @click="handleClose"></div>
        
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <div
            class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            @click.stop
          >
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2">{{ title }}</h3>
              <p class="text-gray-600">{{ message }}</p>
            </div>
            
            <div class="flex gap-3 p-6 pt-0">
              <button
                @click="handleConfirm"
                class="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                {{ confirmText }}
              </button>
              <button
                @click="handleClose"
                class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {{ cancelText }}
              </button>
            </div>
            
            <button
              @click="handleClose"
              class="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>