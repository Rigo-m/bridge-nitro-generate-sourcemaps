import { computed, ref, useState } from '#app'

/**
 * Simple state management for UI purposes. Tightly adapted from a small utility in shopware-pwa repo
 *
 * @remarks
 * You can decide to not pass stateName to keep the UIState internally in the component.
 *
 * @example
 * ```js
 * // Component 1
 * const {isOpen, switchState} = useUIState('OVERLAY_STATE')
 * switchState()
 * // Component 2
 * const {isOpen} = useUIState('OVERLAY_STATE')
 * // isOpen will be true
 * ```
 * @param {string} stateName - represents the name that gets shared as a boolean state between components
 * @link https://github.com/vuestorefront/shopware-pwa/blob/master/packages/composables/src/logic/useUIState.ts
 * @return { isOpen: boolean, switchState: function }
 */
export const useUIState = (stateName) => {
  let state
  if (stateName) {
    state = useState(stateName, () => false)
  } else {
    state = ref(false)
  }

  const isOpen = computed(() => state.value)

  const switchState = (to) => {
    state.value = typeof to === 'undefined' ? !state.value : !!to
  }

  return {
    isOpen,
    switchState,
  }
}
