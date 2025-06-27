<template>
    <button
      :type="type"
      :class="[
        'py-2 px-4 rounded transition font-medium',
        primary
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'bg-gray-200 text-gray-800 hover:bg-gray-300',
      ]"
      @click="$emit('click')"
    >
      <slot />
    </button>
  </template>
  
  <script setup>
  defineProps({
    type: { type: String, default: 'button' },
    primary: { type: Boolean, default: false },
  });
  </script>
  