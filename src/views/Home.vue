<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="p-4">
    <p>
      Для использования данной системы необходимо перейи на соотвествующие
      подразделы.
    </p>
    <p>В конце подраздела находится ссылка на следующий раздел.</p>
    <p>
      В качестве первого первого раздела для изучения является
      <router-link to="/LearnAttention">Механизм Attention </router-link>
    </p>
    <p>
      Больше информации
      <router-link to="/About">о проекте</router-link>
    </p>
    <InteractiveAttention />
    <!-- <HelloWorld msg="Home" /> -->
  </div>
</template>

<script lang="js">
// @ is an alias to /src
import InteractiveAttention from "@/components/Interactive/InteractiveAttention.vue";

export default {
  name: "Home",
  components: {
    InteractiveAttention,
  },
};
</script>
