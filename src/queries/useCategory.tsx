import categoryApiRequest from '@/apiRequests/category'
import { CreateCategoryBodyType, UpdateCategoryBodyType } from '@/schemaValidations/category.schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useCategoryListQuery = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoryApiRequest.list
  })
}

export const useGetCategoryQuery = ({
  id,
  enabled
}: {
  id: number
  enabled: boolean
}) => {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => categoryApiRequest.getCategory(id),
    enabled
  })
}

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateCategoryBodyType) => categoryApiRequest.add(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  })
}

export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      body
    }: {
      id: number
      body: UpdateCategoryBodyType
    }) => categoryApiRequest.updateCategory(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  })
}

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => categoryApiRequest.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  })
}