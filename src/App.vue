<script setup lang="ts">
import { ref } from 'vue'
import OperationStep from '@/OperationStep.vue'

const first = ref<HTMLElement>()
const second = ref<HTMLElement>()
const third = ref<HTMLElement>()

const step = ref()

const stepList = ref([{
  el: first,
  content: '这是第一步',
  beforeNext: async () => {
    // eslint-disable-next-line no-console
    console.log('before next')
    return true
  },
}, {
  el: second,
  content: '这是第二步',
}, {
  el: third,
  content: '这是第三步',
  class: 'rounded-10%',
}])
</script>

<template>
  <div class="p-10px h-200vh">
    <div class="flex space-x-10px">
      <button @click="step.start()">
        开始
      </button>
      <button @click="step.resume()">
        恢复
      </button>
    </div>
    <main class="p-20px space-y-10px">
      <div ref="first" class="rounded-5px border-2px border-sky-300 p-5px">
        first
      </div>
      <div ref="second" class="rounded-5px border-2px border-sky-300 p-5px">
        second
      </div>
    </main>
    <div ref="third" class="mt-680px circle-200px border-2px border-sky-300 p-5px">
      third
    </div>
    <OperationStep
      ref="step"
      :step-list="stepList"
      placement="top-end"
      :content-padding="10"
    >
      <template #action-prefix>
        <button @click="step.pause()">
          暂停
        </button>
      </template>
      <template #action-suffix>
        <button v-if="step.index + 1 === stepList.length" @click="step.pause()">
          关闭
        </button>
      </template>
    </OperationStep>
  </div>
</template>
