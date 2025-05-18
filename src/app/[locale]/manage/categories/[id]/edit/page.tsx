'use client'

import { useGetCategoryQuery, useUpdateCategoryMutation } from '@/queries/useCategory'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateCategoryBody } from '@/schemaValidations/category.schema'
import { toast } from 'sonner'
import { mediaApiRequest } from '@/apiRequests/media'
import { useState, useEffect } from 'react'

export default function EditCategoryPage({
  params
}: {
  params: { id: string }
}) {
  const t = useTranslations('Categories')
  const router = useRouter()
  const [imageUrl, setImageUrl] = useState<string>('')
  const categoryId = parseInt(params.id)

  const { data: categoryData } = useGetCategoryQuery({
    id: categoryId,
    enabled: true
  })
  const updateCategoryMutation = useUpdateCategoryMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(CreateCategoryBody)
  })

  useEffect(() => {
    if (categoryData?.payload) {
      reset(categoryData.payload)
    //   setImageUrl(categoryData.payload.image || '')
    }
  }, [categoryData, reset])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('imageSizeError'))
        return
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(t('imageTypeError'))
        return
      }
      const formData = new FormData()
      formData.append('file', file)
      try {
        const response = await mediaApiRequest.upload(formData)
        // setImageUrl(response.payload.data.url)
        toast.success(t('uploadSuccess'))
      } catch (error) {
        toast.error(t('uploadError'))
      }
    }
  }

  const onSubmit = async (data: any) => {
    try {
      if (!imageUrl) {
        toast.error(t('imageRequired'))
        return
      }
      await updateCategoryMutation.mutateAsync({
        id: categoryId,
        body: {
          ...data,
          image: imageUrl
        }
      })
      toast.success(t('updateSuccess'))
      router.push('/manage/categories')
    } catch (error) {
      toast.error(t('updateError'))
    }
  }

  if (!categoryData?.payload) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('editTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
                {...register('name')}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message as string}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea
                id="description"
                {...register('description')}
                aria-invalid={!!errors.description}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description.message as string}</p>
              )}
            </div>

            <div>
              <Label htmlFor="image">{t('image')}</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {imageUrl && (
                <div className="mt-2">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                {t('cancel')}
              </Button>
              <Button 
                type="submit" 
                disabled={updateCategoryMutation.isPending}
              >
                {updateCategoryMutation.isPending ? 'Updating...' : t('update')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}