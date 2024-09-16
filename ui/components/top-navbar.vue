<template>
  <nav class="bg-blue-600 p-4 text-white flex justify-between">
    <div class="text-lg font-bold">Dashboard App</div>
    <div class="space-x-4">
      <NuxtLink to="/sender-dashboard" class="hover:underline"
        >Sender Dashboard</NuxtLink
      >
      <NuxtLink to="/receiver-dashboard" class="hover:underline"
        >Receiver Dashboard</NuxtLink
      >
    </div>
  </nav>
</template>
