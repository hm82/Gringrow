import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const ProductsSection: React.FC = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Recommended Products</h2>
        <a href="#" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
          View All Products
          <span className="material-icons text-sm ml-1">arrow_forward</span>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
          </>
        ) : (
          products?.slice(0, 3).map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </section>
  );
};

interface ProductCardProps {
  product: any;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const getBgColor = () => {
    switch (product.category) {
      case "savings":
        return "bg-secondary-500";
      case "checking":
        return "bg-primary-600";
      case "cd":
        return "bg-amber-500";
      default:
        return "bg-primary-600";
    }
  };

  const getButtonColor = () => {
    switch (product.category) {
      case "savings":
        return "bg-secondary-500 hover:bg-secondary-600";
      case "checking":
        return "bg-primary-600 hover:bg-primary-700";
      case "cd":
        return "bg-amber-500 hover:bg-amber-600";
      default:
        return "bg-primary-600 hover:bg-primary-700";
    }
  };

  return (
    <Card className="overflow-hidden border border-gray-100">
      <div className={`${getBgColor()} text-white px-5 py-4`}>
        <h3 className="font-semibold">{product.name}</h3>
        <p className="text-sm opacity-90">{product.description}</p>
      </div>
      <CardContent className="p-5">
        <div className="mb-4">
          <span className="text-3xl font-bold">{product.interestRate.toFixed(2)}</span>
          <span className="text-xl font-semibold">%</span>
          <span className="text-sm text-gray-500 ml-1">APY</span>
        </div>
        <ul className="text-sm text-gray-700 space-y-2 mb-4">
          {product.features.map((feature: string, index: number) => (
            <li key={index} className="flex items-start">
              <span className="material-icons text-success mr-2 text-sm">check_circle</span>
              {feature}
            </li>
          ))}
        </ul>
        <Button className={`w-full text-white ${getButtonColor()}`}>
          Learn More
        </Button>
      </CardContent>
    </Card>
  );
};

const ProductSkeleton = () => (
  <Card className="overflow-hidden">
    <div className="px-5 py-4">
      <Skeleton className="h-6 w-40 mb-2" />
      <Skeleton className="h-4 w-full" />
    </div>
    <CardContent className="p-5">
      <div className="mb-4">
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex items-start">
          <Skeleton className="h-4 w-4 mr-2 rounded-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="flex items-start">
          <Skeleton className="h-4 w-4 mr-2 rounded-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="flex items-start">
          <Skeleton className="h-4 w-4 mr-2 rounded-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
    </CardContent>
  </Card>
);

export default ProductsSection;
