<template>
    <div class="p-6 space-y-4">
      <h1 class="text-3xl font-bold mb-4">Sender Dashboard</h1>
  
      <!-- Transfer statistics card -->
      <div class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-2xl font-semibold mb-4">Transfer Statistics</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-100 p-4 rounded-lg text-center">
            <h3 class="text-lg font-semibold">Past Transfers</h3>
            <p class="text-4xl font-bold">12</p>
          </div>
          <div class="bg-gray-100 p-4 rounded-lg text-center">
            <h3 class="text-lg font-semibold">Current Transfers</h3>
            <p class="text-4xl font-bold">3</p>
          </div>
        </div>
      </div>
  
      <!-- New transfer option -->
      <div class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-2xl font-semibold mb-4">Initiate New Transfer</h2>
        <button class="bg-blue-600 text-white py-2 px-4 rounded-lg">New Transfer</button>
      </div>
    </div>
</template>