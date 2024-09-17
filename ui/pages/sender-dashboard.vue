<template>
  <v-container class="py-6">
    <v-row>
      <v-col>
        <!-- Transfer Statistics Card -->
        <v-card class="pa-6" outlined>
          <v-card-title class="text-h5 font-weight-bold"
            >Sender Dashboard</v-card-title
          >
          <v-card-subtitle class="mb-4">Transfer Statistics</v-card-subtitle>

          <v-row class="gy-4">
            <!-- Past Transfers -->
            <v-col cols="12" sm="6">
              <v-card class="pa-4" outlined>
                <v-card-title class="text-h6">Past Transfers</v-card-title>
                <v-card-subtitle class="text-h4 font-weight-bold text-center"
                  >12</v-card-subtitle
                >
              </v-card>
            </v-col>

            <!-- Current Transfers -->
            <v-col cols="12" sm="6">
              <v-card class="pa-4" outlined>
                <v-card-title class="text-h6">Current Transfers</v-card-title>
                <v-card-subtitle class="text-h4 font-weight-bold text-center"
                  >3</v-card-subtitle
                >
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-6">
      <v-col>
        <!-- New Transfer Option -->
        <v-card class="pa-6" outlined>
          <v-card-title class="text-h5 font-weight-bold"
            >Initiate New Transfer</v-card-title
          >
          <v-card-actions>
            <v-btn color="primary" class="white--text"> New Transfer </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
