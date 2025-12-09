import React, { useState } from 'react';
import { ArrowLeft, Plus, Minus, ShoppingCart, Package, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useData } from '../contexts/DataContext';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import { MedicineSeo } from '../seo-pages/MedicineSeo';
import { MedicineCard } from '../components/MedicineCard';

export function MedicineDetailsPage({ onNavigate }: { onNavigate: (page: string, data?: any) => void }) {
  const [quantity, setQuantity] = useState(1);
  const { medicineId } = useParams();
  const { addToCart } = useCart();
  const { medicines, loading } = useData();
  const medicine = medicines.find(m => m.id === medicineId);

  // Find similar medicines based on generic name
  const currentGenericName = medicine?.genericName;
  const similarMedicines = currentGenericName
    ? medicines.filter(m =>
      m.id !== medicine!.id &&
      m.genericName &&
      m.genericName.toLowerCase() === currentGenericName.toLowerCase()
    )
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">Medicine not found</p>
            <Button onClick={() => onNavigate('medicines')} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
              Back to Medicines
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: medicine.id,
        name: medicine.name,
        price: medicine.price,
        image: medicine.image,
      });
    }
    toast.success(`${quantity} ${medicine.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50 py-8">
      <MedicineSeo
        id={medicine.id}
        name={medicine.name}
        descriptionText={medicine.description}
        image={medicine.image}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          onClick={() => onNavigate('medicines')}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Medicines
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left - Image */}
          <Card>
            <CardContent className="p-8">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 mb-4">
                <img
                  src={medicine.image}
                  alt={medicine.name}
                  className="w-full h-96 object-contain"
                />
              </div>
              <div className="flex gap-2">
                <Badge className={medicine.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                  {medicine.inStock ? (
                    <><CheckCircle className="h-3 w-3 mr-1" />In Stock</>
                  ) : (
                    <><AlertCircle className="h-3 w-3 mr-1" />Out of Stock</>
                  )}
                </Badge>
                <Badge className="bg-amber-100 text-amber-700">
                  <Package className="h-3 w-3 mr-1" />
                  {medicine.category}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Right - Details */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-8">
                <h1 className="text-gray-900 mb-2">{medicine.name}</h1>
                <p className="text-gray-600 mb-4">{medicine.brand}</p>

                <div className="bg-amber-50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-1">Price</p>
                  <p className="text-3xl text-amber-600">৳{medicine.price}</p>
                </div>

                {/* Quantity Selector */}
                <div className="mb-6">
                  <label className="block text-sm text-gray-600 mb-2">Quantity</label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-16 text-center text-xl">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={!medicine.inStock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={!medicine.inStock}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:bg-gray-300"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart - ৳{(medicine.price * quantity).toFixed(2)}
                </Button>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Product Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {medicine.description || `${medicine.name} by ${medicine.brand} is a high-quality pharmaceutical product designed to provide effective treatment. This medicine is manufactured under strict quality control standards and is approved for safe use.`}
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between py-2 border-b">
                    <span>Category:</span>
                    <span className="text-gray-900">{medicine.category}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Brand:</span>
                    <span className="text-gray-900">{medicine.brand}</span>
                  </div>
                  {medicine.genericName && (
                    <div className="flex justify-between py-2 border-b">
                      <span>Generic Name:</span>
                      <span className="text-gray-900">{medicine.genericName}</span>
                    </div>
                  )}
                  {medicine.strength && (
                    <div className="flex justify-between py-2 border-b">
                      <span>Strength:</span>
                      <span className="text-gray-900">{medicine.strength}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b">
                    <span>Form:</span>
                    <span className="text-gray-900">{medicine.form || medicine.category}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Manufacturer:</span>
                    <span className="text-gray-900">{medicine.manufacturer || `${medicine.brand} Pharmaceuticals`}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <span className="text-amber-600">•</span>
                    <span>Take as directed by your healthcare provider</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-600">•</span>
                    <span>Store in a cool, dry place away from direct sunlight</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-600">•</span>
                    <span>Keep out of reach of children</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-600">•</span>
                    <span>Do not exceed recommended dosage</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Medicines Section */}
        {similarMedicines.length > 0 && (
          <div className="mt-16 border-t pt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Similar Medicines</h2>
                <p className="text-gray-600">Alternative medicines with the same generic components</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarMedicines.map(similar => (
                <MedicineCard
                  key={similar.id}
                  medicine={similar}
                  onViewDetails={(id) => onNavigate('medicine-details', { medicineId: id })}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
