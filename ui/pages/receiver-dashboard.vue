<template>
  <v-container class="py-6">
    <v-row>
      <v-col>
        <v-card class="pa-6" outlined>
          <v-card-title class="text-h5 font-weight-bold"
            >Receiver Dashboard</v-card-title
          >
          <v-card-subtitle class="mb-4">Received Currencies</v-card-subtitle>

          <v-row class="gy-4">
            <!-- USD Currency Card -->
            <v-col cols="12" sm="6">
              <v-card class="pa-4" outlined>
                <v-card-title class="text-h6">USD</v-card-title>
                <v-card-subtitle class="text-h4 font-weight-bold"
                  >500</v-card-subtitle
                >
              </v-card>
            </v-col>

            <!-- EUR Currency Card -->
            <v-col cols="12" sm="6">
              <v-card class="pa-4" outlined>
                <v-card-title class="text-h6">EUR</v-card-title>
                <v-card-subtitle class="text-h4 font-weight-bold"
                  >300</v-card-subtitle
                >
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
