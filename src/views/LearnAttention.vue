<template>
  <div class="home">
    <InteractiveAttention />
  </div>
</template>

<script lang="js">
// @ is an alias to /src
import InteractiveAttention from "@/components/Interactive/InteractiveAttention.vue";

/*
Структура данного компонента представляет из себя

- интерактивный тренажер, направленный на изучение механизма внимания у нейросетей
- блок отвечающий за теорию и навигацию по ней
*/

export default {
  name: "LearnAttention",
  components: {
    InteractiveAttention,
  },
};
</script>
