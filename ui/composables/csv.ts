import Papa from 'papaparse'

export const useCSVHandler = (file: File): void => {
  if (file && file instanceof Blob) {
    const reader = new FileReader()

    reader.onload = (event: ProgressEvent<FileReader>) => {
      const content = event.target?.result as string

      Papa.parse(content, {
        header: true,
        complete: (results) => {
          console.log('Parsed CSV Data:', results.data)
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
