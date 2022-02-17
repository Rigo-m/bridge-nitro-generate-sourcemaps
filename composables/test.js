import { useState } from '#app'

export const useTest = () => {
  return { state: useState('test', () => 'something') }
}
