import { getTranslations } from 'next-intl/server'
import { unstable_setRequestLocale } from 'next-intl/server'
import { Locale } from '@/config'
import dishApiRequest from '@/apiRequests/dish'
import categoryApiRequest from '@/apiRequests/category'
import Image from 'next/image'
import { Link } from '@/navigation'
import { formatCurrency, generateSlugUrl } from '@/lib/utils'
import { htmlToTextForDescription } from '@/lib/server-utils'
import envConfig from '@/config'
import { DishListResType } from '@/schemaValidations/dish.schema'
import { DishSlider } from './dish-slider'

// Function to ensure image URL is absolute
const getImageUrl = (imagePath: string) => {
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  return `${envConfig.NEXT_PUBLIC_URL}/images/${imagePath}`
}

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: Locale }
}) {
  const t = await getTranslations({ locale, namespace: 'HomePage' })
  const url = envConfig.NEXT_PUBLIC_URL + `/${locale}/categories`

  return {
    title: 'All Categories',
    description: 'Browse all food categories and their dishes',
    alternates: {
      canonical: url
    }
  }
}

export default async function CategoriesPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  unstable_setRequestLocale(locale)
  const t = await getTranslations('HomePage')

  try {
    // Fetch all categories and dishes
    const [categoriesResult, dishesResult] = await Promise.all([
      categoryApiRequest.list(),
      dishApiRequest.list()
    ])

    const categories = categoriesResult.payload.data
    const dishes = dishesResult.payload.data

    return (
      <div className='w-full space-y-12 py-8'>
        <section className='relative'>
          <div className='absolute inset-0 bg-black opacity-50'></div>
          <Image
            src='/banner.png'
            width={1200}
            height={400}
            quality={80}
            alt='All Categories'
            className='w-full h-[300px] object-cover'
          />
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='text-center text-white'>
              <h1 className='text-4xl font-bold mb-4'>All Categories</h1>
              <p className='text-lg'>Browse our complete menu by category</p>
            </div>
          </div>
        </section>

        {/* Categories and Dishes */}
        <div className='max-w-7xl mx-auto px-4 space-y-16'>
          {categories.map((category) => {
            const categoryDishes = dishes.filter((dish) => dish.categoryId === category.id)
            const hasMoreThanFourDishes = categoryDishes.length > 4

            return (
              <section key={category.id} className='space-y-6'>
                <div className='flex items-center gap-4'>
                  <Image
                    src={getImageUrl(category.image)}
                    width={80}
                    height={80}
                    quality={80}
                    alt={category.name}
                    className='rounded-lg object-cover w-20 h-20'
                  />
                  <div>
                    <h2 className='text-2xl font-bold'>{category.name}</h2>
                    <p className='text-gray-600'>{category.description}</p>
                  </div>
                </div>

                {hasMoreThanFourDishes ? (
                  <DishSlider dishes={categoryDishes} />
                ) : (
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                    {categoryDishes.map((dish) => (
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
                          <div className='p-5 max-h-[140px] min-h-[140px]'>  
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
                )}
              </section>
            )
          })}
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading categories:', error)
    return <div>Something went wrong</div>
  }
} 