<template>
  <div
    class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex"
  >
    <!-- Sidebar -->
    <aside class="w-64 bg-white shadow-lg p-6 flex flex-col">
      <h2 class="text-2xl font-extrabold mb-8 text-indigo-700 tracking-wide">
        Support Portal
      </h2>
      <nav class="flex flex-col space-y-5 text-black font-bold">
        <a href="#" class="hover:text-pink-600 transition">Dashboard</a>
        <a href="#" class="hover:text-pink-600 transition">Settings</a>
      </nav>
    </aside>

    <!-- Main -->
    <main class="flex-1 p-10 relative">
      <!-- Header -->
      <header class="flex justify-between items-center mb-10">
        <div>
          <h1 class="text-4xl font-bold text-indigo-900">
            Welcome,
            <span class="text-pink-600">{{ user.name || "Loading..." }}</span>
          </h1>
          <p class="text-black font-medium mt-2">
            Role: {{ user.role || "..." }}
          </p>
        </div>
        <button
          @click="logout"
          class="px-5 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-semibold shadow-md transition"
        >
          Logout
        </button>
      </header>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center items-center h-48">
        <svg
          class="animate-spin h-12 w-12 text-pink-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      </div>

      <!-- Tickets Section -->
      <section v-else>
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-3xl font-semibold text-indigo-800">Your Tickets</h2>
          <button
            @click="showCreateTicket = true"
            class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold shadow-lg transition flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clip-rule="evenodd"
              />
            </svg>
            Create Ticket
          </button>
        </div>

        <div
          v-if="tickets?.length"
          class="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <article
            v-for="ticket in tickets"
            :key="ticket.id"
            class="bg-white rounded-xl shadow-lg p-6 border-l-8 border-pink-500 hover:shadow-xl transition-shadow"
          >
            <h3 class="text-2xl font-semibold mb-3 text-indigo-900">
              {{ ticket.title }}
            </h3>
            <p class="text-indigo-700 mb-5">{{ ticket.title }}</p>

            <div>
              <h4 class="font-semibold text-indigo-500 mb-2">Comments:</h4>
              <ul class="list-disc list-inside text-indigo-600">
                <li
                  v-if="!ticket.comments?.length"
                  class="italic text-indigo-300"
                >
                  No comments yet.
                </li>
                <li v-for="comment in ticket.comments" :key="comment.id">
                  {{ comment.content }}
                </li>
              </ul>
            </div>

            <button
              @click="openCommentModal(ticket.id)"
              class="mt-4 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 text-sm font-medium shadow"
            >
              Comment
            </button>
          </article>
        </div>

      
      </section>

      <!-- Create Ticket Modal -->
      <transition name="modal-fade">
        <div
          v-if="showCreateTicket"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <CreateTicketForm
              @close="showCreateTicket = false"
              @created="handleTicketCreated"
            />
          </div>
        </div>
      </transition>

      <!-- Add Comment Modal -->
      <transition name="modal-fade">
        <div
          v-if="showAddComment"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <AddComment
              :show="showAddComment"
              :ticketId="selectedTicketId"
              @close="showAddComment = false"
              @submitted="handleCommentAdded"
            />
          </div>
        </div>
      </transition>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../lib/api";
import CreateTicketForm from "../components/CreateTicketForm.vue";
import AddComment from "../components/AddCommentModal.vue";

const user = ref({});
const tickets = ref([]);
const loading = ref(true);
const showCreateTicket = ref(false);
const showAddComment = ref(false);
const selectedTicketId = ref(null);

const fetchDashboardData = async () => {
  loading.value = true;
  const token = localStorage.getItem("token");

  try {
    const userRes = await api.get("/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const ticketsRes = await api.post(
      "/graphql",
      {
        query: `
            query Tickets {
              tickets {
                id
                title
                status
                comments {
                  id
                  content
                }
              }
            }
          `,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (ticketsRes.data.errors) {
      throw new Error(ticketsRes.data.errors[0]?.message || "GraphQL error");
    }

    user.value = userRes.data;
    tickets.value = ticketsRes.data.data.tickets;
  } catch (err) {
    console.error("Dashboard error:", err.message);
    if (err.response?.status === 401) {
      logout();
    }
  } finally {
    loading.value = false;
  }
};

const handleTicketCreated = (newTicket) => {
  tickets.value.unshift(newTicket);
  showCreateTicket.value = false;
};

const openCommentModal = (ticketId) => {
  selectedTicketId.value = ticketId;
  showAddComment.value = true;
};

const handleCommentAdded = (ticketId, newComment) => {
  const ticket = tickets.value.find((t) => t.id === ticketId);
  if (ticket) {
    ticket.comments.push(newComment);
  }
  showAddComment.value = false;
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "/";
};

onMounted(fetchDashboardData);
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
