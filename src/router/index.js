import { createRouter, createWebHistory } from "vue-router";

// list of component endpoints
const routeDef = [
  { name: "Главная", path: "/", componentName: "Home" },
  { name: "О проекте", componentName: "About" },
  //
  { name: "BERT", componentName: "ExplainedBert" },
  { name: "Stable Diffusion", componentName: "ExplainedStableDiffusion" },
  //
  { name: "Механизм Attention", componentName: "LearnAttention" },
  { name: "Механизм AutoEncoding", componentName: "LearnAutoEncoding" },
  { name: "Механизм Diffusion", componentName: "LearnDiffusion" },
  { name: "Механизм Transformer", componentName: "LearnTransformer" },
];

// auto add component as route from folder /views
const routes = routeDef.map(function (def) {
  return {
    name: def.name,
    path: def.path ? def.path : `/${def.componentName}`,
    component: () => import(`@/views/${def.componentName}.vue`),
  };
});

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
