<template>
  <v-container
    class="d-flex flex-column align-center justify-center"
    style="height: 100vh"
  >
    <v-card class="pa-6" width="400">
      <v-card-title class="text-h5 font-weight-bold">Login</v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            required
          ></v-text-field>

          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            required
          ></v-text-field>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-btn color="primary" @click="login">Login</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import store from '../store';

const email = ref('')
const password = ref('')

const router = useRouter()

function login() {
  store.setUser({
    email: email,
    accounts: [],
    messages: []
  });
  router.push('/sender-dashboard')
}
</script>
