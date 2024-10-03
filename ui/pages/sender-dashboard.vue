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
      <v-col>
        <v-card>
          <v-card-title> Upload CSV {{ showDatePicker }} </v-card-title>
          <v-card-actions>
            <v-container>
              <v-row>
                <v-text-field v-model="name" label="Enter Name" />
              </v-row>
              <v-row>
                <v-text-field v-model="messageId" label="Enter Message ID" />
              </v-row>
              <v-row>
                <v-text-field
                  type="number"
                  v-model="numberOfTx"
                  label="Number of transactions"
                />
              </v-row>
              <v-row>
                <v-text-field
                  type="number"
                  v-model="controlSum"
                  label="Control Sum"
                />
              </v-row>
              <v-row>
                <v-select
                  v-model="pmtMtd"
                  :items="pmtMtdOptions"
                  label="Select a payment method"
                />
              </v-row>
              <v-row>
                <v-btn @click="showDatePicker = !showDatePicker">
                  {{
                    parsedDate.length > 0 ? parsedDate : 'Select Execution Date'
                  }}
                </v-btn>
              </v-row>
              <v-row v-if="showDatePicker">
                <v-date-picker v-model="selectedDate" no-title scrollable />
              </v-row>
              <v-row>
                <v-file-input
                  label="Upload CSV"
                  accept=".csv"
                  @change="handleFileChange"
                />
              </v-row>
            </v-container>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
definePageMeta({
  middleware: 'is-logged-in' 
});
</script>


<script>
export default {
  data() {
    return {
      name: '',
      messageId: '',
      numberOfTx: 0,
      controlSum: 0,
      initgPtyOrgId: '123456',
      pmtInfId: 'X-BA-PAY002',
      pmtMtd: '',
      pmtMtdOptions: ['TRF'],
      selectedDate: null,
      showDatePicker: false,
    }
  },
  computed: {
    parsedDate() {
      if (!this.selectedDate) {
        return ''
      }

      const date = new Date(this.selectedDate)

      const pad = (num) => (num < 10 ? '0' + num : num)

      const year = date.getFullYear()
      const month = pad(date.getMonth() + 1)
      const day = pad(date.getDate())

      return `${year}-${month}-${day}`
    },
  },
  methods: {
    handleDateChange(date) {
      this.selectedDate = date
    },
    handleFileChange: (event) => {
      const input = event.target
      if (input.files && input.files[0]) {
        const file = input.files[0]
        useCSVHandler(file)
      }
    },
  },
}
</script>
