<template>
  <div id="app">
    <nav class="navbar navbar-expand-sm navbar-light bg-light p-4">
      <router-link
        class="navbar-brand"
        v-for="route in $router.options.routes"
        :key="route.path"
        :to="route.path"
        >{{ route.name }}
      </router-link>
    </nav>
    <h1>{{ this.$route.name }}</h1>
    <router-view />
  </div>
</template>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

h1 {
  text-align: center;
}

.navbar {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
