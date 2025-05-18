'use client'

import { useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Link } from '@/navigation'
import { formatCurrency, generateSlugUrl } from '@/lib/utils'
import envConfig from '@/config'

// Function to ensure image URL is absolute
const getImageUrl = (imagePath: string) => {
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  return `${envConfig.NEXT_PUBLIC_URL}/images/${imagePath}`
}

interface Dish {
  id: number
  name: string
  price: number
  description: string
  image: string
  categoryId: number
  status: 'Available' | 'Unavailable' | 'Hidden'
  createdAt: Date
  updatedAt: Date
}

interface DishSliderProps {
  dishes: Dish[]
  onQuantityChange?: (dishId: number, quantity: number) => void
}

export function DishSlider({ dishes, onQuantityChange }: DishSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps'
  })

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  return (
    <div className='relative'>
      <div className='overflow-hidden' ref={emblaRef}>
        <div className='flex gap-6'>
          {dishes.map((dish: Dish) => (
            <div key={dish.id} className='flex-[0_0_calc(25%-16px)] min-w-[280px]'>
              <Link
                href={`/dishes/${generateSlugUrl({
                  name: dish.name,
                  id: dish.id
                })}`}
                className='group block'
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
            </div>
          ))}
        </div>
      </div>
      <Button
        variant='outline'
        size='icon'
        className='absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300'
        onClick={scrollPrev}
      >
        <ChevronLeft className='h-5 w-5' />
      </Button>
      <Button
        variant='outline'
        size='icon'
        className='absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300'
        onClick={scrollNext}
      >
        <ChevronRight className='h-5 w-5' />
      </Button>
    </div>
  )
} 