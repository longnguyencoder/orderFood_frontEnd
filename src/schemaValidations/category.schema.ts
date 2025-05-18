import { DishSchema } from './dish.schema'
import z from 'zod'

export const CreateCategoryBody = z.object({
  name: z.string().min(1).max(256),
  description: z.string().max(10000),
  image: z.string()
})

export type CreateCategoryBodyType = z.TypeOf<typeof CreateCategoryBody>

export const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  image: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
})

export const CategoryRes = z.object({
  data: CategorySchema,
})

export type CategoryResType = z.TypeOf<typeof CategoryRes>

export const CategoryListRes = z.object({
  data: z.array(CategorySchema),
})

export type CategoryListResType = z.TypeOf<typeof CategoryListRes>

export const UpdateCategoryBody = CreateCategoryBody

export type UpdateCategoryBodyType = z.TypeOf<typeof UpdateCategoryBody>