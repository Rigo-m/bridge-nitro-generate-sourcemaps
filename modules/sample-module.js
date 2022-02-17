import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  setup(options, nuxt) {
    nuxt.addHooks({
      'build:before': async () => {
        const getResponse = () => 'kek'
        console.log('buildberfore')
        return await getResponse()
      },
    })
  },
})
