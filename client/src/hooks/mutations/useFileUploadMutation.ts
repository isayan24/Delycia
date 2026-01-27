import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

interface FileUploadVariables {
  fileName: string
  fileData: string // base64 or blob url? The original code sends it as 'fileData' value.
}

interface FileUploadResponse {
  downloadLink: string
  [key: string]: any
}

export const useFileUploadMutation = () => {
  return useMutation({
    mutationFn: async (variables: FileUploadVariables) => {
      // Direct call to external service, not using our internal axios instance
      const response = await axios.post(
        'https://files.expressme.in/upload',
        variables,
      )
      return response.data as FileUploadResponse
    },
  })
}
