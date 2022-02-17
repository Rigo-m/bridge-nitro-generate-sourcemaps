import { useState, ref } from '#app'

const shared = ref('test')

export const useTest = () => {
  return { state: useState('test', () => 'something'), shared }
}
