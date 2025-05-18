"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useDishListQuery } from "@/queries/useDish";
import {
  cn,
  formatCurrency,
  generateSlugUrl,
  handleErrorApi,
} from "@/lib/utils";
import Quantity from "@/app/[locale]/guest/menu/quantity";
import { useMemo, useState } from "react";
import { GuestCreateOrdersBodyType } from "@/schemaValidations/guest.schema";
import { useGuestOrderMutation } from "@/queries/useGuest";
import { DishStatus } from "@/constants/type";
import { useRouter } from "@/navigation";
import { useTableListQuery } from "@/queries/useTable";
import { DishSlider } from "../../(public)/categories/dish-slider";
import envConfig from "@/config";
import Link from "next/link";
import dishApiRequest from "@/apiRequests/dish";
import categoryApiRequest from "@/apiRequests/category";
import { useCategoryListQuery } from "@/queries/useCategory";

const getImageUrl = (imagePath: string) => {
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  return `${envConfig.NEXT_PUBLIC_URL}/images/${imagePath}`;
};

export default function MenuOrder() {
  const { data } = useDishListQuery();

  const dishes = useMemo(() => data?.payload.data ?? [], [data]);
  const [orders, setOrders] = useState<GuestCreateOrdersBodyType>([]);
  const { mutateAsync } = useGuestOrderMutation();
  const { data: categoriesResult } = useCategoryListQuery();
  const { data: dishesResult } = useDishListQuery();
  const router = useRouter();
  // React 19 hoặc Next.js 15 thì không cần dùng useMemo chỗ này
  const totalPrice = useMemo(() => {
    return orders.reduce((result, order) => {
      const dish = dishes.find((d) => d.id === order.dishId);
      if (!dish) return result;
      return result + order.quantity * dish.price;
    }, 0);
  }, [dishes, orders]);
  const categories = categoriesResult?.payload.data ?? [];

  const handleQuantityChange = (dishId: number, quantity: number) => {
    setOrders((prevOrders) => {
      if (quantity === 0) {
        return prevOrders.filter((order) => order.dishId !== dishId);
      }
      const index = prevOrders.findIndex((order) => order.dishId === dishId);
      if (index === -1) {
        return [...prevOrders, { dishId, quantity }];
      }
      const newOrders = [...prevOrders];
      newOrders[index] = { ...newOrders[index], quantity };
      return newOrders;
    });
  };

  const handleOrder = async () => {
    try {
      await mutateAsync(orders);
      router.push(`/guest/orders`);
    } catch (error) {
      handleErrorApi({
        error,
      });
    }
  };
  console.log("orders", dishes);
  return (
    <>
      {/* Categories and Dishes */}
      <div className=" px-4 space-y-16">
        {categories.map((category) => {
          const categoryDishes = dishes.filter(
            (dish) => dish.categoryId === category.id
          );
          const hasMoreThanFourDishes = categoryDishes.length > 4;

          return (
            <section key={category.id} className="space-y-6">
              <div className="flex items-center gap-4">
                <Image
                  src={getImageUrl(category.image)}
                  width={80}
                  height={80}
                  quality={80}
                  alt={category.name}
                  className="rounded-lg object-cover w-20 h-20"
                />
                <div>
                  <h2 className="text-2xl font-bold">{category.name}</h2>
                  <p className="text-gray-600">{category.description}</p>
                </div>
              </div>

              {hasMoreThanFourDishes ? (
                <DishSlider dishes={categoryDishes} onQuantityChange={handleQuantityChange} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {categoryDishes.map((dish) => (
                    <div key={dish.id} className="group block">
                      <div className="bg-slate-50 rounded-xl shadow-md overflow-hidden transition-all duration-300 group-hover:-translate-y-1">
                        <div className="relative h-40">
                          <Image
                            src={getImageUrl(dish.image)}
                            fill
                            quality={80}
                            alt={dish.name}
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold mb-1 text-gray-800 group-hover:text-primary transition-colors duration-300">
                            {dish.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {dish.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-black">
                              {formatCurrency(dish.price)}
                            </p>
                            <Quantity
                              value={orders.find(order => order.dishId === dish.id)?.quantity ?? 0}
                              onChange={(value) => handleQuantityChange(dish.id, value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
      <div className="sticky bottom-0">
        <Button
          className="w-full justify-between"
          onClick={handleOrder}
          disabled={orders.length === 0}
        >
          <span>Đặt hàng · {orders.length} món</span>
          <span>{formatCurrency(totalPrice)}</span>
        </Button>
      </div>
    </>
  );
}
