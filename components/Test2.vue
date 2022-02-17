<template>
  <div>{{ testState }} <span @click="switchState">click me</span></div>
</template>

<script>
// some extra comment here
import { useTest } from '~/composables/test'
import { onMounted } from '#app'
import { useUIState as ui } from '~/composables/useUIState'
export default {
  setup() {
    const { state: testState } = useTest() // test of a single line comment

    const { switchState } = ui('TEST_STATE')
    // test2

    onMounted(() => {
      setTimeout(() => {
        testState.value = 'something else 2'
      }, 10000)
    })
    return {
      testState,
      switchState,
    }
  },
}
</script>

<style lang="scss" scoped></style>
