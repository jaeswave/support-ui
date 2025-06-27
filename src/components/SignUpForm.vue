<template>
  <div class="relative">
    <Loader
      v-if="isLoading"
      class="absolute inset-0 z-50 bg-white bg-opacity-70 flex items-center justify-center"
    />

    <form @submit.prevent="handleSignUp" class="space-y-4">
      <div v-if="error" class="text-red-600 text-sm">
        {{ error }}
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Name</label>
        <input
          v-model="form.name"
          type="text"
          required
          class="w-full mt-1 px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
        />
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
        <label class="block text-sm font-medium text-gray-700"
          >Confirm Password</label
        >
        <input
          v-model="form.confirmPassword"
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
        <label class="block text-sm font-medium text-gray-700"
          >Invite Code</label
        >
        <input
          v-model="form.inviteCode"
          type="text"
          required
          class="w-full mt-1 px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
        />
      </div>

      <button
        type="submit"
        class="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition"
      >
        Sign Up
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
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  inviteCode: "",
});

const handleSignUp = async () => {
  error.value = null;

  if (form.password !== form.confirmPassword) {
    error.value = "Passwords do not match!";
    toast.error(error.value);
    return;
  }

  isLoading.value = true;

  try {
    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: props.role,
    };

    if (props.role === "agent") {
      payload.invite_code = form.inviteCode;
    }

    await api.post("/users", { user: payload });

    toast.success("Signup successful! Please log in.");
    window.location.href = "/";
  } catch (err) {
    const res = err.response?.data;
    error.value = res?.error || res?.errors?.join(", ") || "Login failed";
    toast.error(error.value);
  } finally {
    isLoading.value = false;
  }
};
</script>
