import http from '@/lib/http'
import {
  CategoryListResType,
  CategoryResType,
  CreateCategoryBodyType,
  UpdateCategoryBodyType
} from '@/schemaValidations/category.schema'

const categoryApiRequest = {
  list: () => http.get<CategoryListResType>('categories', { next: { tags: ['categories'] } }),
  add: (body: CreateCategoryBodyType) => http.post<CategoryResType>('categories', body),
  getCategory: (id: number) => http.get<CategoryResType>(`categories/${id}`),
  updateCategory: (id: number, body: UpdateCategoryBodyType) =>
    http.put<CategoryResType>(`categories/${id}`, body),
  deleteCategory: (id: number) => http.delete<CategoryResType>(`categories/${id}`)
}

export default categoryApiRequest