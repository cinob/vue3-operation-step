<script setup lang="ts">
import { arrow, computePosition, flip, offset, shift } from '@floating-ui/dom'

const props = defineProps({
  el: {
    type: HTMLElement,
  },
})

const content = ref<HTMLElement>()
const tooltip = ref<HTMLElement>()
const arrowRef = ref<HTMLElement>()

const isShowTip = ref(false)

setTimeout(() => {
  isShowTip.value = true
}, 2000)

watchEffect(() => {
  if (isShowTip.value) {
    nextTick(() => {
      update()
    })
  }
})

function update() {
  const rect = props.el!.getBoundingClientRect()
  const { width, height } = rect
  Object.assign(content.value!.style, {
    left: `${props.el!.offsetLeft}px`,
    top: `${props.el!.offsetTop}px`,
    width: `${width}px`,
    height: `${height}px`,
  })
  computePosition(content.value!, tooltip.value!, {
    placement: 'bottom-start',
    middleware: [
      offset(6),
      flip(),
      shift(),
      arrow({ element: arrowRef.value! }),
    ],
  }).then(({ x, y, placement, middlewareData }) => {
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
  })
}
</script>

<template>
  <Teleport to="body">
    <div class="guide-wrapper">
      <div
        ref="content"
        class="content bg-#000/50"
        aria-describedby="tooltip"
      >
        <slot />
      </div>
      <div v-if="isShowTip" ref="tooltip" class="tooltip" role="tooltip">
        <slot name="tip" />
        <div ref="arrowRef" class="arrow" />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.guide-wrapper {
  --at-apply: absolute top-0 left-0 z-10 inset-0;
}
.content {
  --at-apply: absolute top-0 left-0;
}
.tooltip {
  --at-apply: bg-#222 text-white font-bold p-5px rounded-4px
  absolute top-0 left-0
  w-max text-90% pointer-events-none;
}
.arrow {
  --at-apply: absolute bg-#222 w-8px h-8px;
  transform: rotate(45deg);
}
</style>
