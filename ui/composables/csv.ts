import Papa from 'papaparse'

export const useCSVHandler = (file: File): void => {
  const requiredHeaders = [
    'end_to_end_id',
    'instd_amt',
    'instd_amt_currency',
    'xchg_rate_inf_unit_ccy',
    'xchg_rate_inf_xchg_rate',
    'cdtr_agt_bicfi',
    'cdtr_acct_iban',
  ]

  if (file && file instanceof Blob) {
    const reader = new FileReader()

    reader.onload = (event: ProgressEvent<FileReader>) => {
      const content = event.target?.result as string

      Papa.parse(content, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedData = results.data as Array<Record<string, string>>
          const headers = results.meta.fields

          if (!headers) {
            console.error('Failed to retrieve headers from the CSV')
            return
          }

          const missingHeaders = requiredHeaders.filter(
            (header) => !headers.includes(header)
          )

          if (missingHeaders.length > 0) {
            console.error('Missing required headers:', missingHeaders)
            return
          }

          const filteredData = parsedData.filter((row) => {
            return Object.values(row).some(
              (value) => value !== null && value !== ''
            )
          })

          console.log('Array of CSV Data Objects:', filteredData)
        },
        error: (error: Error) => {
          console.error('Error parsing CSV:', error)
        },
      })
    }

    reader.readAsText(file)
  } else {
    console.error('No valid file was provided')
  }
}
