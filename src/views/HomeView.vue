<template>
    <div class="min-h-screen flex p-2">
      <!-- Left Side -->
      <div class="w-7/12 bg-blue-100 flex items-center justify-center p-10">
        <h1 class="text-7xl font-bold text-blue-800">
          Support App 👋
        </h1>
      </div>
  
      <div class="w-5/12 bg-white flex flex-col justify-center p-10 shadow-lg">
        <h2 class="text-2xl font-semibold mb-6 text-gray-800">
          {{ showLogin ? 'Jump Right In' : 'Let\'s Get Started' }}
        </h2>
  
        <div class="flex space-x-4 mb-6">
          <button
            :class="buttonClass('customer')"
            @click="role = 'customer'"
          >
            Customer
          </button>
          <button
            :class="buttonClass('agent')"
            @click="role = 'agent'"
          >
            Agent
          </button>
        </div>
  
        <component :is="currentForm" :role="role" @toggle="toggleForm" />
  
        <p class="text-sm text-center mt-4 text-gray-600">
          {{ showLogin ? "Don't have an account?" : "Already have an account?" }}
          <button class="text-blue-600 hover:underline" @click="toggleForm">
            {{ showLogin ? 'Sign up' : 'Log in' }}
          </button>
        </p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import LoginForm from '../components/LoginForm.vue';
  import SignUpForm from '../components/SignUpForm.vue';
  
  const role = ref('customer');
  const showLogin = ref(true);
  
  const toggleForm = () => {
    showLogin.value = !showLogin.value;
  };
  
  // Use the component object directly
  const currentForm = computed(() => (showLogin.value ? LoginForm : SignUpForm));
  
  const buttonClass = (r) =>
    `px-4 py-2 rounded ${
      role.value === r ? 'bg-blue-500 text-white' : 'bg-gray-200'
    }`;
  </script>
  