export interface CreateCategoryParams {
  rid: string
  name: string
  description: string
  img?: string
}
export interface DeleteCategoryParams {
  id: string
  rid: string
  img?: string
  template_id?: string
}
export interface CreateCategoryFromTemplatesParams {
  rid: string
  template_ids: string[]
}

export interface CreateCategoryAsTemplateParams {
  name: string
  description?: string
  img: string
  rid: string
  cuisine_type: string
  saveAsTemplate: boolean
}

export interface UpdateCategoryParams {
  id: string
  rid: string
  name?: string
  description?: string
  img?: string
  is_active?: boolean
}
