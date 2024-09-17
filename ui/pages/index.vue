<template>
  <v-container
    class="d-flex flex-column align-center justify-center"
    style="height: 100vh"
  >
    <v-card class="pa-6" width="400">
      <v-card-title class="text-h5 font-weight-bold">Login</v-card-title>
      <v-card-text>
        <v-form>
          <v-select
            v-model="role"
            :items="roles"
            label="Login as"
            required
          ></v-select>

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

const email = ref('')
const password = ref('')
const role = ref('')

const roles = ['Sender', 'Receiver']

const router = useRouter()

function login() {
  if (role.value === 'Sender') {
    router.push('/sender-dashboard')
  } else if (role.value === 'Receiver') {
    router.push('/receiver-dashboard')
  }
}
</script>
