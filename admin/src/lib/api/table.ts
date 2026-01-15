import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import axiosInstance from '../axios'

// Validation schemas
const createTableSchema = z.object({
  rid: z.string(),
  table_number: z.string(),
  capacity: z.number(),
  zone: z.string(),
  accessToken: z.string(),
})

const deleteTableSchema = z.object({
  id: z.string(),
  accessToken: z.string(),
})

// Server Functions
export const createTable = createServerFn({
  method: 'POST',
}).handler(async ({ data }: { data: z.infer<typeof createTableSchema> }) => {
  const validated = createTableSchema.parse(data)
  const { rid, table_number, capacity, zone, accessToken } = validated

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

    await axiosInstance.post(`/admin/tables`, payload, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

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

export const deleteTable = createServerFn({
  method: 'POST',
}).handler(async ({ data }: { data: z.infer<typeof deleteTableSchema> }) => {
  const validated = deleteTableSchema.parse(data)
  const { id, accessToken } = validated

  if (!id) {
    throw new Error('Table ID is required')
  }

  if (!accessToken) {
    throw new Error('Access token is required')
  }

  try {
    await axiosInstance.delete(`/admin/tables`, {
      headers: { Authorization: `Bearer ${accessToken}` },
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
      error.response?.data?.message || error.message || 'Failed to delete table'
    throw new Error(errorMessage)
  }
})
