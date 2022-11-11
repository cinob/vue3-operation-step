<script lang="ts">
import type { PropType } from 'vue'
import { computed, defineComponent, nextTick, ref, watchEffect } from 'vue'
import type { Placement } from '@floating-ui/dom'
import { arrow, autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom'
export default defineComponent({
  name: 'OperationStep',
})
</script>

<script setup lang="ts">
const props = defineProps({
  stepList: {
    required: true,
    type: Array as PropType<{
      el: HTMLElement | string | undefined
      content: string
      class?: string
      beforePrev?: Function
      afterPrev?: Function
      beforeNext?: Function
      afterNext?: Function
    }[]>,
  },
  contentPadding: {
    type: Number,
    default: 5,
  },
  placement: {
    type: String as PropType<Placement>,
    default: 'top-start',
  },
  autoScrollIntoView: {
    default: true,
  },
  contentClass: String,
  tooltipClass: String,
  prevBtnText: String,
  nextBtnText: String,
  btnClass: String,
  disabledBtnClass: String,
  beforeChange: Function,
  afterChange: Function,
})

const currentStepIndex = ref(0)
const currentStep = computed(() => {
  return props.stepList ? props.stepList[currentStepIndex.value] : null
})
const currentEl = ref<HTMLElement | null>()

function updateCurrentEl() {
  currentEl.value = currentStep.value?.el
    ? (typeof currentStep.value.el === 'string'
        ? document.querySelector(currentStep.value!.el)
        : currentStep.value!.el) as HTMLElement
    : null
}

const content = ref<HTMLElement>()
const tooltip = ref<HTMLElement>()
const arrowRef = ref<HTMLElement>()

const isShowStep = ref(false)
const isShowTip = ref(true)

async function callWithHook(fn: Function) {
  if (props.beforeChange)
    await props.beforeChange()
  fn()
  if (props.afterChange)
    await props.afterChange()
}

async function start() {
  currentStepIndex.value = 0
  updateCurrentEl()
  if (currentEl.value)
    isShowStep.value = true
}

function skip() {
  isShowStep.value = false
}

function pause() {
  isShowStep.value = false
}

function resume() {
  updateCurrentEl()
  if (currentEl.value)
    isShowStep.value = true
}

watchEffect(() => {
  let cleanup: any
  if (isShowStep.value) {
    document.body.className += ' operation-step-lock'
    nextTick(() => {
      callWithHook(() => update(true))
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

  const el = currentEl.value

  if (!el)
    return false

  {
    const rect = el.getBoundingClientRect()
    const { width, height, x, y } = rect

    Object.assign(content.value!.style, {
      left: `${x - props.contentPadding}px`,
      top: `${y - props.contentPadding}px`,
      width: `${width + 2 * props.contentPadding}px`,
      height: `${height + 2 * props.contentPadding}px`,
    })
  }

  if (isChangeStep === true) {
    if (props.autoScrollIntoView)
      el.scrollIntoView(false)

    isShowTip.value = false
    await sleep(150)
    isShowTip.value = true
  }

  const { x, y, placement, middlewareData } = await computePosition(
    content.value!,
    tooltip.value!,
    {
      placement: props.placement,
      middleware: [
        offset(5 + props.contentPadding),
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

const isDisabledPrev = computed(() => {
  return currentStepIndex.value <= 0
})

const isDisabledNext = computed(() => {
  return currentStepIndex.value >= props.stepList.length - 1
})

async function prev() {
  if (currentStep.value?.beforePrev) {
    const res = await currentStep.value?.beforePrev()
    if (!res)
      return false
  }
  if (!isDisabledPrev.value) {
    callWithHook(() => {
      currentStepIndex.value = currentStepIndex.value - 1
      updateCurrentEl()
      update(true)
    })
  }
  if (currentStep.value?.afterPrev)
    await currentStep.value?.afterPrev()
}

async function next() {
  if (currentStep.value?.beforeNext) {
    const res = await currentStep.value?.beforeNext()
    if (!res)
      return false
  }
  if (!isDisabledNext.value) {
    callWithHook(() => {
      currentStepIndex.value = currentStepIndex.value + 1
      updateCurrentEl()
      update(true)
    })
  }
  if (currentStep.value?.afterNext)
    await currentStep.value?.afterNext()
}

defineExpose({
  start,
  skip,
  pause,
  resume,
  prev,
  next,
  index: currentStepIndex,
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isShowStep" class="guide-wrapper">
      <div
        ref="content"
        :class="`content ${contentClass} ${currentStep?.class}`"
      />
      <Transition>
        <div
          v-show="isShowTip"
          ref="tooltip"
          :class="`tooltip ${tooltipClass}`"
        >
          <div>
            <slot :current="currentStep">
              {{ currentStep?.content }}
            </slot>
          </div>
          <slot
            name="action"
            :current="currentStep"
          >
            <div class="action-wrapper">
              <slot name="action-prefix" />
              <button
                :class="`${btnClass || ''} ${isDisabledPrev ? `action-button-disabled ${disabledBtnClass || ''}` : ''}`"
                @click="prev()"
              >
                {{ prevBtnText || '上一步' }}
              </button>
              <button
                :class="`${btnClass || ''} ${isDisabledNext ? `action-button-disabled ${disabledBtnClass || ''}` : ''}`"
                @click="next()"
              >
                {{ nextBtnText || '下一步' }}
              </button>
              <slot name="action-suffix" />
            </div>
          </slot>
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
  --at-apply: fixed z-9999 inset-0 top-0 left-0 right-0 bottom-0;
}
.content {
  --at-apply: absolute top-0 left-0 outline-9999px transition-all outline-solid outline-#000/75;
}
.tooltip {
  --at-apply: bg-white text-#222 p-10px rounded-4px
  absolute top-0 left-0 z-1
  w-max text-90%;
}
.arrow {
  --at-apply: absolute bg-white square-8px;
  transform: rotate(45deg);
}
.action-wrapper {
  --at-apply: flex space-x-10px mt-10px text-14px;
}

.action-button-disabled {
  --at-apply: cursor-not-allowed;
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
