<script setup lang="ts">
import Popover from '@/Popover.vue'

const first = ref<HTMLElement>()
</script>

<template>
  <div class="p-10px">
    <main class="p-20px space-y-10px">
      <div ref="first" class="rounded-5px border-2px border-sky-300 p-5px">
        first
      </div>
      <div class="rounded-5px border-2px border-sky-300 p-5px">
        second
      </div>
      <div class="rounded-5px border-2px border-sky-300 p-5px">
        third
      </div>
      <Popover :el="first">
        <template #tip>
          sd;flkjasd;lkfj
        </template>
      </Popover>
    </main>
  </div>
</template>
