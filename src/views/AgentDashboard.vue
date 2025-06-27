<template>
  <div
    class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex"
  >
    <!-- Sidebar remains the same -->
    <aside class="w-64 bg-white shadow-lg p-6 flex flex-col">
      <h2 class="text-2xl font-extrabold mb-8 text-indigo-700 tracking-wide">
        Support Portal
      </h2>
      <nav class="flex flex-col space-y-5 text-black font-bold">
        <a href="#" class="hover:text-pink-600 transition">Dashboard</a>
        <a href="#" class="hover:text-pink-600 transition">Settings</a>
        <button
          @click="downloadTicketsCSV"
          class="mt-6 text-blue-600 hover:underline"
        >
          Export CSV
        </button>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-10 relative">
      <header class="flex justify-between items-center mb-10">
        <h1 class="text-4xl font-bold text-indigo-900">
          Welcome,
          <span class="text-pink-600">{{ user.name || "Loading..." }}</span>
          (Agent)
        </h1>
        <button
          @click="logout"
          class="px-5 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-semibold shadow-md"
        >
          Logout
        </button>
      </header>

      <!-- Loading State -->
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

      <!-- Tickets Table -->
      <section v-else>
        <h2 class="text-3xl font-semibold text-indigo-800 mb-6">All Tickets</h2>
        <div
          v-if="tickets?.length"
          class="bg-white rounded-lg shadow overflow-hidden"
        >
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-indigo-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider"
                >
                  Title
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider"
                >
                  Assigned To
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider"
                >
                  Comments
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="ticket in tickets"
                :key="ticket.id"
                :class="ticket.assignedTo ? 'bg-green-50' : 'bg-red-50'"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ ticket.title }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="{
                      'bg-green-100 text-green-800': ticket.status === 'closed',
                      'bg-yellow-100 text-yellow-800':
                        ticket.status === 'in_progress',
                      'bg-red-100 text-red-800': ticket.status === 'open',
                    }"
                  >
                    {{ ticket.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{
                      ticket.status === "in_progress"
                        ? "Assigned"
                        : "Unassigned"
                    }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div
                    class="text-sm text-gray-900 max-w-xs max-h-20 overflow-y-auto"
                  >
                    <ul class="list-disc list-inside">
                      <li
                        v-for="c in ticket.comments"
                        :key="c.id"
                        class="text-xs"
                      >
                        <span class="font-medium"
                          >{{ user?.name || "agent" }}:</span
                        >
                        {{ c.content }}
                      </li>
                      <li
                        v-if="!ticket.comments.length"
                        class="text-xs italic text-gray-400"
                      >
                        No comments yet
                      </li>
                    </ul>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    v-if="!ticket.assignedTo"
                    @click="assignToMe(ticket.id)"
                    class="mr-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="isAssigning || ticket.status === 'in_progress'"
                  >
                    Assign to Me
                  </button>
                  <button
                    @click="openCommentModal(ticket.id)"
                    class="px-3 py-1 bg-pink-500 text-white rounded hover:bg-pink-600 text-xs shadow"
                  >
                    comment
                  </button>
                </td>
              </tr>
            </tbody>
            c
          </table>
        </div>
        <p v-else class="text-center mt-20 text-indigo-400">
          No tickets available.
        </p>
      </section>

      <transition name="modal-fade">
        <div
          v-if="showAddComment"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <AddComment
              :show="showAddComment"
              :ticketId="selectedTicketId"
              @close="showAddComment = false"
              @comment-created="handleCommentAdded"
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
import AddComment from "../components/AddCommentModal.vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const user = ref({});
const tickets = ref([]);
const loading = ref(true);
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
    toast.error(`Failed to load tickets: ${err.message}`);
    if (err.response?.status === 401) {
      logout();
    }
  } finally {
    loading.value = false;
  }
};

const assignToMe = async (ticketId) => {
  try {
    const response = await api.post(
      "/graphql",
      {
        query: `
          mutation AssignTicket($ticketId: ID!) {
            assignTicket(ticketId: $ticketId) {
              ticket {
                id
                agent {
                  id
                }
              }
              errors
            }
          }
        `,
        variables: { ticketId },
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    console.log(response.data)

    const result = response.data.data.assignTicket;

    if (result.errors && result.errors.length) {
      toast.error("Failed to assign ticket: " + result.errors.join(", "));
      return;
    }

    // Update local ticket state without re-fetching everything
    const updated = tickets.value.find((t) => t.id === ticketId);
    if (updated) {
      updated.assignedTo = result.ticket.assignedTo;
      toast.success("Ticket assigned successfully!");
    }
    //reload the page
    window.location.reload();
  } catch (error) {
    console.error(error);
    toast.error(error.message || "Failed to assign ticket");
  }
};

const openCommentModal = (ticketId) => {
  selectedTicketId.value = ticketId;
  showAddComment.value = true;
};

const handleCommentAdded = (comment) => {
  const ticket = tickets.value.find((t) => t.id === selectedTicketId.value);
  if (ticket) {
    ticket.comments.push(comment);
    toast.success("Comment added successfully!");
  }
  showAddComment.value = false;
};

const downloadTicketsCSV = async () => {
  try {
    const res = await api.get("/tickets/export_csv", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      responseType: "blob",
    });
    const blob = new Blob([res.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "tickets.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("CSV exported successfully!");
  } catch (e) {
    console.error("CSV download error:", e);
    toast.error("Failed to export CSV");
  }
};

const logout = () => {
  localStorage.removeItem("token");
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
