import React from 'react';
import { ShoppingCart, Plus, Package } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';

interface MedicineCardProps {
  medicine: {
    id: string;
    name: string;
    brand: string;
    price: number;
    image: string;
    category: string;
    inStock: boolean;
  };
  onViewDetails?: (medicineId: string) => void;
}

export function MedicineCard({ medicine, onViewDetails }: MedicineCardProps) {
  const { t } = useLanguage();
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id: medicine.id,
      name: medicine.name,
      price: medicine.price,
      image: medicine.image,
    });
    toast.success(`${medicine.name} added to cart!`);
  };

  return (
    <div
      onClick={() => onViewDetails?.(medicine.id)}
      className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-amber-100 hover:border-amber-300 cursor-pointer"
    >
      {/* Medicine Image */}
      <div className="relative h-48 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
        <img
          src={medicine.image}
          alt={medicine.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-white/95 text-gray-700 border-0 shadow-lg">
            <Package className="h-3 w-3 mr-1" />
            {medicine.category}
          </Badge>
        </div>

        {/* Stock Status */}
        {!medicine.inStock ? (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <Badge className="bg-red-500 text-white border-0 px-4 py-2">
              Out of Stock
            </Badge>
          </div>
        ) : (
          <div className="absolute top-3 right-3">
            <Badge className="bg-green-500 text-white border-0 shadow-lg">
              In Stock
            </Badge>
          </div>
        )}
      </div>

      {/* Medicine Info */}
      <div className="p-4">
        <h4 className="text-gray-900 mb-1 line-clamp-2 group-hover:text-amber-600 transition-colors">
          {medicine.name}
        </h4>
        <p className="text-sm text-gray-500 mb-4">{medicine.brand}</p>

        {/* Price & Action */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Price</p>
            <p className="text-amber-600">৳{medicine.price}</p>
          </div>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={!medicine.inStock}
            size="sm"
            className={`${medicine.inStock
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30'
                : 'bg-gray-300 cursor-not-allowed'
              }`}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

    </div>
  );
}
