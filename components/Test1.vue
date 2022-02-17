<template>
  <div>{{ testState }} -- {{ shared }} -- {{ isOpen ? 'open' : 'closed' }}</div>
</template>

<script>
import { useTest } from '~/composables/test'
import { onMounted } from '#app'
import { useUIState } from '~/composables/useUIState'
export default {
  setup() {
    const { state: testState, shared } = useTest()

    const { isOpen } = useUIState('TEST_STATE')

    onMounted(() => {
      setTimeout(() => {
        testState.value = 'something else'
      }, 5000)
    })
    return {
      testState,
      shared,
      isOpen,
    }
  },
}
</script>

<style lang="scss" scoped>
.test {
  // applying some styles
  transform: scale(1.5);
  transform-origin: left center;
}
</style>
