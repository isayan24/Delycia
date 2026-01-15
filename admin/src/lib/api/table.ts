import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import axiosInstance from '../axios'

// Validation schemas - removed accessToken since we use httpOnly cookies
const createTableSchema = z.object({
  rid: z.string(),
  table_number: z.string(),
  capacity: z.number(),
  zone: z.string(),
})

const deleteTableSchema = z.object({
  id: z.string(),
})

type CreateTableData = z.infer<typeof createTableSchema>
type DeleteTableData = z.infer<typeof deleteTableSchema>

// Server Functions
export const createTable = createServerFn({ method: 'POST' })
  .inputValidator((data: CreateTableData) => createTableSchema.parse(data))
  .handler(async ({ data }) => {
    const { rid, table_number, capacity, zone } = data

    if (!rid || !table_number || !capacity || !zone) {
      throw new Error('Invalid request: missing required fields')
    }

    try {
      const payload = {
        rid,
        table_number,
        capacity,
        zone,
      }

      // No Authorization header needed - httpOnly cookies are sent automatically
      await axiosInstance.post(`/admin/tables`, payload)

      return {
        status: 201,
        message: 'Table created successfully',
        success: true,
      }
    } catch (error) {
      throw new Error(
        `Failed to create table: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  })

export const deleteTable = createServerFn({ method: 'POST' })
  .inputValidator((data: DeleteTableData) => deleteTableSchema.parse(data))
  .handler(async ({ data }) => {
    const { id } = data

    if (!id) {
      throw new Error('Table ID is required')
    }

    try {
      // No Authorization header needed - httpOnly cookies are sent automatically
      await axiosInstance.delete(`/admin/tables`, {
        data: { id },
      })

      return {
        status: 200,
        message: 'Table deleted successfully',
        deleted_table_id: id,
        success: true,
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to delete table'
      throw new Error(errorMessage)
    }
  })
