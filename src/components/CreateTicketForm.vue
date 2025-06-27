<template>
  <div class="relative min-h-[200px]">
    <Loader
      v-if="isLoading"
      class="absolute inset-0 z-50 bg-white bg-opacity-70 flex items-center justify-center"
    />

    <form
      @submit.prevent="handleCreate"
      class="space-y-4 bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-auto"
    >
      <h2 class="text-lg font-semibold text-indigo-700 mb-4">New Ticket</h2>

      <div v-if="error" class="p-3 bg-red-50 text-red-600 text-sm rounded">
        {{ error }}
      </div>

      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Title</label
          >
          <input
            v-model="form.title"
            type="text"
            required
            placeholder="Enter ticket title"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div class="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span v-if="!isLoading">Create</span>
            <span v-else>Creating...</span>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import Loader from "../components/Loader.vue";
import api from "../lib/api";

const emit = defineEmits(["close", "created"]);

const isLoading = ref(false);
const error = ref(null);
const form = reactive({ title: "" });

const CREATE_TICKET_MUTATION = `
    mutation CreateTicket($title: String!) {
      createTicket(title: $title) {
        ticket {
          id
          title
          status
        }
      }
    }
  `;

const handleCreate = async () => {
  error.value = null;
  isLoading.value = true;

  try {
    const token = localStorage.getItem("token");
    const res = await api.post(
      "/graphql",
      {
        query: CREATE_TICKET_MUTATION,
        variables: { title: form.title },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const newTicket = res.data.data.createTicket.ticket;
    emit("created", newTicket);
    emit("close");
    toast.success(`Ticket "${newTicket.title}" created successfully!`);
    window.location.reload();
  } catch (err) {
    error.value = err.response?.data?.error || "Failed to create ticket";
    toast.error(error.value);
  } finally {
    isLoading.value = false;
  }
};
</script>
