<template>
  <div class="relative">
    <Loader
      v-if="isLoading"
      class="absolute inset-0 z-50 bg-white bg-opacity-70 flex items-center justify-center"
    />

  <form @submit.prevent="handleLogin" class="space-y-4">
    <div v-if="error" class="text-red-600 text-sm">
      {{ error }}
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Email</label>
      <input
        v-model="form.email"
        type="email"
        required
        class="w-full mt-1 px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Password</label>
      <input
        v-model="form.password"
        type="password"
        required
        class="w-full mt-1 px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Role</label>
      <input
        :value="role"
        disabled
        class="w-full mt-1 px-3 py-2 border rounded bg-gray-100"
      />
    </div>

    <div v-if="role === 'agent'">
      <label class="block text-sm font-medium text-gray-700">Invite Code</label>
      <input
        v-model="form.inviteCode"
        type="text"
        required
        class="w-full mt-1 px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
      />
    </div>

    <button
      type="submit"
      class="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      Log In
    </button>
  </form>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import api from "../lib/api";
import Loader from "../components/Loader.vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const props = defineProps({ role: String });
const router = useRouter();
const error = ref(null);
const isLoading = ref(false);

const form = reactive({
  email: "",
  password: "",
  inviteCode: "",
});

const handleLogin = async () => {
  error.value = null;
  isLoading.value = true;
  try {
    const payload = {
      email: form.email,
      password: form.password,
    };

    if (props.role === "agent") {
      payload.invite_code = form.inviteCode;
    }

    const res = await api.post("/login", {
      ...payload,
      role: props.role,
    });

    const token = res.headers["authorization"]?.replace("Bearer ", "");

    localStorage.setItem("token", token);
    localStorage.setItem("role", props.role);

    toast.success("Login successful!");
    router.push(props.role === "agent" ? "/agent/dashboard" : "/dashboard");
  } catch (err) {
    const res = err.response?.data;
    error.value = res?.error || res?.errors?.join(", ") || "Login failed";
    toast.error(error.value);
  } finally {
    isLoading.value = false;
  }
};
</script>
