<template>
  <div class="someclass">
    {{ $route.params.slug }}
  </div>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
.someclass {
  transform: scale(2);
  transform-origin: left top;
  background-color: blue;
}
</style>
