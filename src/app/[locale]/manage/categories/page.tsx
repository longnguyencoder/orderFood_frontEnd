'use client'

import { useCategoryListQuery, useDeleteCategoryMutation } from '@/queries/useCategory'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/navigation'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

export default function CategoriesPage() {
  const t = useTranslations('Categories')
  const router = useRouter()
  const { data: categoriesData, isLoading } = useCategoryListQuery()
  const deleteCategoryMutation = useDeleteCategoryMutation()

  const handleDelete = async (id: number) => {
    try {
      await deleteCategoryMutation.mutateAsync(id)
      toast.success(t('deleteSuccess'))
    } catch (error) {
      toast.error(t('deleteError'))
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex justify-end space-x-2">
                  <Skeleton className="h-10 w-10" />
                  <Skeleton className="h-10 w-10" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Button onClick={() => router.push('/manage/categories/create')}>
          <Plus className="mr-2 h-4 w-4" />
          {t('create')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoriesData?.payload.data.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* {category.image && (
                <div className="relative w-full h-48 mb-4">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              )} */}
              <p className="text-gray-600 mb-4">{category.description}</p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/manage/categories/${category.id}/edit`)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(category.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}