<template>
  <div
    :class="cn(
      'inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-sm shadow-lg',
      {
        'bg-red-500': type === 'front',
        'bg-blue-500': type === 'back',
        'bg-gray-400': type === 'disabled'
      },
      className
    )"
  >
    {{ String(number).padStart(2, '0') }}
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/utils/cn'

interface Props {
  number: number
  type: 'front' | 'back' | 'disabled'
  className?: string
}

defineProps<Props>()
</script> 