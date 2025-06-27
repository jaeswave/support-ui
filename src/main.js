// src/main.js
import { createApp, h, provide } from "vue";
import App from "./App.vue";
import router from "./router";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { apolloClient } from "./apollo";

import "./style.css";
import Vue3Toastify from "vue3-toastify";
import "vue3-toastify/dist/index.css";
const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient);
  },
  render: () => h(App),
});

app.use(router);
app.use(Vue3Toastify);
app.mount("#app");
