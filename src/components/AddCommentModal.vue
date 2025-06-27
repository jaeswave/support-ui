<template>
    <transition name="modal-fade">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
          <h3 class="text-xl font-semibold mb-4 text-indigo-700">Add Comment</h3>
          
          <textarea
            v-model="content"
            class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
            rows="4"
            placeholder="Enter your comment..."
            ref="commentTextarea"
          ></textarea>
          
          <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>
          
          <div class="flex justify-end space-x-3">
            <button
              @click="close"
              class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              @click="submit"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
              :disabled="isSubmitting"
            >
              <span v-if="!isSubmitting">Submit</span>
              <span v-else>Submitting...</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </template>
  
  <script setup>
  import { ref, watch, nextTick } from 'vue';
  import api from "../lib/api";

  
  const props = defineProps({
    show: Boolean,
    ticketId: String
  });
  
  const emit = defineEmits(['close', 'comment-created']);
  
  const content = ref('');
  const isSubmitting = ref(false);
  const error = ref(null);
  const commentTextarea = ref(null);
  
  watch(() => props.show, (val) => {
    if (val) {
      nextTick(() => {
        commentTextarea.value?.focus();
      });
    }
  });
  
  const close = () => {
    emit('close');
    reset();
  };
  
  const reset = () => {
    content.value = '';
    error.value = null;
    isSubmitting.value = false;
  };
  
  const submit = async () => {
    if (!content.value.trim()) {
      error.value = 'Comment cannot be empty';
      return;
    }
  
    isSubmitting.value = true;
    error.value = null;
  
    try {
        const response = await api.post('/graphql', {
  query: `
    mutation CreateComment($ticketId: ID!, $content: String!) {
      createComment(ticketId: $ticketId, content: $content) {
        comment {
          id
          content
          createdAt
          user {
            id
          }
        }
        errors
      }
    }
  `,
  variables: {
    ticketId: props.ticketId,
    content: content.value
  }
}, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

  
      if (response.data.errors) {
        throw new Error(response.data.errors[0]?.message || 'Failed to create comment');
      }
  
      const result = response.data.data.createComment;
      
      if (result.errors && result.errors.length > 0) {
        error.value = result.errors[0];
      } else {
        emit('comment-created', result.comment);
        close();
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      error.value = err.message || 'Failed to add comment';
    } finally {
      isSubmitting.value = false;
    }
  };
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