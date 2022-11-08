<script setup lang="ts">
import { arrow, autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom'

const props = defineProps<{
  stepList: {
    el: HTMLElement | string | undefined
    content: string
    style?: string
  }[]
  prevBtnText?: string
  nextBtnText?: string
}>()

const currentStepIndex = ref(0)
const currentStep = computed(() => {
  return props.stepList ? props.stepList[currentStepIndex.value] : null
})

const content = ref<HTMLElement>()
const tooltip = ref<HTMLElement>()
const arrowRef = ref<HTMLElement>()

const isShowStep = ref(false)
const isShowTip = ref(true)

function start() {
  currentStepIndex.value = 0
  isShowStep.value = true
}

function skip() {
  isShowStep.value = false
}

function pause() {
  isShowStep.value = false
}

function resume() {
  isShowStep.value = true
}

watchEffect(() => {
  let cleanup: any
  if (isShowStep.value) {
    document.body.className += ' operation-step-lock'
    nextTick(() => {
      update(true)
      cleanup = autoUpdate(content.value!, tooltip.value!, update)
    })
  }
  else {
    document.body.className = document.body.className.replace(' operation-step-lock', '')
    cleanup && cleanup()
  }
})

function sleep(time: number) {
  return new Promise(resolve => setTimeout(resolve, time))
}

async function update(isChangeStep = false) {
  if (!content.value || !tooltip.value)
    return

  const el = (typeof currentStep.value!.el === 'string'
    ? document.querySelector(currentStep.value!.el)
    : currentStep.value!.el) as HTMLElement

  {
    const rect = el.getBoundingClientRect()
    const { width, height, x, y } = rect

    Object.assign(content.value!.style, {
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
    })
  }

  if (isChangeStep === true) {
    el.scrollIntoView(false)
    isShowTip.value = false
    await sleep(150)
    isShowTip.value = true
  }

  const { x, y, placement, middlewareData } = await computePosition(
    content.value!,
    tooltip.value!,
    {
      placement: 'top-start',
      middleware: [
        offset(6),
        flip(),
        shift(),
        arrow({ element: arrowRef.value!, padding: 15 }),
      ],
    })
  Object.assign(tooltip.value!.style, {
    left: `${x}px`,
    top: `${y}px`,
  })

  const { x: arrowX, y: arrowY } = middlewareData.arrow!

  const staticSide = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
  }[placement.split('-')[0]]

  Object.assign(arrowRef.value!.style, {
    left: arrowX != null ? `${arrowX}px` : '',
    top: arrowY != null ? `${arrowY}px` : '',
    right: '',
    bottom: '',
    [staticSide!]: '-4px',
  })
}

function prev() {
  currentStepIndex.value = Math.max(currentStepIndex.value - 1, 0)
  update(true)
}

function next() {
  currentStepIndex.value = Math.min(currentStepIndex.value + 1, props.stepList.length - 1)
  update(true)
}

defineExpose({
  start,
  skip,
  pause,
  resume,
  prev,
  next,
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isShowStep" class="guide-wrapper">
      <div
        ref="content"
        class="content"
        :style="currentStep?.style"
      />
      <Transition>
        <div v-show="isShowTip" ref="tooltip" class="tooltip">
          <div>
            {{ currentStep?.content }}
          </div>
          <div class="action-wrapper">
            <slot :name="`action${currentStepIndex + 1}`" :current="currentStep">
              <button class="action-button" @click="prev()">
                {{ prevBtnText || '上一个' }}
              </button>
              <button class="action-button" @click="next()">
                {{ nextBtnText || '下一个' }}
              </button>
              </slot>
          </div>
          <div ref="arrowRef" class="arrow" />
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<style>
.operation-step-lock {
  overflow: hidden!important;
}
</style>

<style scoped>
.guide-wrapper {
  --at-apply: fixed z-9999 inset-0 ;
}
.content {
  --at-apply: absolute top-0 left-0 outline-9999px transition-all outline-solid outline-#000/75;
}
.tooltip {
  --at-apply: bg-white text-#222 font-bold p-10px rounded-4px
  absolute top-0 left-0 z-1
  w-max text-90%;
}
.arrow {
  --at-apply: absolute bg-white square-8px;
  transform: rotate(45deg);
}
.action-wrapper {
  --at-apply: flex justify-between space-x-10px mt-10px;
}
.action-button {
  --at-apply: flex justify-between text-14px;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 150ms ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
