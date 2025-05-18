import { getTranslations } from 'next-intl/server'
import { unstable_setRequestLocale } from 'next-intl/server'
import { Locale } from '@/config'
import dishApiRequest from '@/apiRequests/dish'
import categoryApiRequest from '@/apiRequests/category'
import Image from 'next/image'
import { Link } from '@/navigation'
import { formatCurrency, generateSlugUrl } from '@/lib/utils'
import envConfig from '@/config'
import { notFound } from 'next/navigation'
import { DishListResType } from '@/schemaValidations/dish.schema'

// Function to ensure image URL is absolute
const getImageUrl = (imagePath: string) => {
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  return `${envConfig.NEXT_PUBLIC_URL}/images/${imagePath}`
}

export async function generateMetadata({
  params: { locale, slug }
}: {
  params: { locale: Locale; slug: string }
}) {
  const categoryId = parseInt(slug.split('-i.')[1])
  if (isNaN(categoryId)) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found'
    }
  }

  try {
    const categoryResult = await categoryApiRequest.getCategory(categoryId)
    const category = categoryResult.payload.data

    return {
      title: category.name,
      description: category.description,
      alternates: {
        canonical: envConfig.NEXT_PUBLIC_URL + `/${locale}/categories/${slug}`
      }
    }
  } catch (error) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found'
    }
  }
}

export default async function CategoryPage({
  params: { locale, slug }
}: {
  params: { locale: string; slug: string }
}) {
  unstable_setRequestLocale(locale)
  const t = await getTranslations('HomePage')

  const categoryId = parseInt(slug.split('-i.')[1])
  if (isNaN(categoryId)) {
    notFound()
  }

  try {
    // Fetch category details and dishes
    const [categoryResult, dishesResult] = await Promise.all([
      categoryApiRequest.getCategory(categoryId),
      dishApiRequest.list()
    ])

    const category = categoryResult.payload.data
    const dishes = dishesResult.payload.data.filter(dish => dish.categoryId === categoryId)

    return (
      <div className='w-full space-y-12 py-8'>
        <section className='relative'>
          <div className='absolute inset-0 bg-black opacity-50'></div>
          <Image
            src={getImageUrl(category.image)}
            width={1200}
            height={400}
            quality={80}
            alt={category.name}
            className='w-full h-[300px] object-cover'
          />
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='text-center text-white'>
              <h1 className='text-4xl font-bold mb-4'>{category.name}</h1>
              <p className='text-lg'>{category.description}</p>
            </div>
          </div>
        </section>

        {/* Dishes Grid */}
        <div className='max-w-7xl mx-auto px-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {dishes.map((dish) => (
              <Link
                href={`/dishes/${generateSlugUrl({
                  name: dish.name,
                  id: dish.id
                })}`}
                className='group block'
                key={dish.id}
              >
                <div className='bg-gray-50 rounded-xl shadow-lg overflow-hidden transition-all duration-300 group-hover:-translate-y-1'>
                  <div className='relative h-48'>
                    <Image
                      src={getImageUrl(dish.image)}
                      fill
                      quality={80}
                      alt={dish.name}
                      className='object-cover transition-transform duration-300 group-hover:scale-110'
                    />
                  </div>
                  <div className='p-5'>
                    <h3 className='text-xl font-bold mb-2 text-gray-800 group-hover:text-primary transition-colors duration-300'>
                      {dish.name}
                    </h3>
                    <p className='text-gray-600 text-sm mb-3 line-clamp-2'>
                      {dish.description}
                    </p>
                    <p className='font-bold text-lg text-primary'>
                      {formatCurrency(dish.price)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading category:', error)
    notFound()
  }
} 