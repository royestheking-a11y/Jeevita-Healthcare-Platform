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

        <div className="space-y-12">
          {/* Card 1: Product Main View (Image + Details + Action) */}
          <Card className="overflow-hidden border-2 border-gray-100 shadow-xl shadow-amber-500/5">
            <CardContent className="p-0">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Left Side: Image */}
                <div className="bg-gradient-to-br from-gray-50 to-amber-50/50 p-8 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-100 relative">
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className={medicine.inStock ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}>
                      {medicine.inStock ? (
                        <><CheckCircle className="h-3 w-3 mr-1" />In Stock</>
                      ) : (
                        <><AlertCircle className="h-3 w-3 mr-1" />Out of Stock</>
                      )}
                    </Badge>
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                      <Package className="h-3 w-3 mr-1" />
                      {medicine.category}
                    </Badge>
                  </div>
                  <img
                    src={medicine.image}
                    alt={medicine.name}
                    className="w-full max-w-sm h-72 object-contain drop-shadow-lg transition-transform hover:scale-105 duration-300"
                  />
                  {similarMedicines.length > 0 && (
                    <div className="mt-8 w-full max-w-sm bg-white/60 backdrop-blur rounded-xl p-4 border border-indigo-50">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Similar Medicine</p>
                      <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                        {similarMedicines.slice(0, 3).map(similar => (
                          <div
                            key={similar.id}
                            onClick={() => onNavigate('medicine-details', { medicineId: similar.id })}
                            className="flex-shrink-0 w-24 h-24 bg-white rounded-lg border border-gray-200 p-2 cursor-pointer hover:border-amber-400 transition-colors"
                            title={similar.name}
                          >
                            <img src={similar.image} alt={similar.name} className="w-full h-full object-contain" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side: Product Identity & Action */}
                <div className="p-8 lg:p-10 flex flex-col justify-center bg-white">
                  <div className="mb-auto">
                    <p className="text-sm font-semibold text-amber-600 mb-2 uppercase tracking-wide">{medicine.genericName || medicine.category}</p>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 leading-tight">{medicine.name}</h1>
                    <p className="text-lg text-gray-600 mb-6 font-medium">{medicine.brand} Pharmaceuticals</p>

                    <div className="flex items-baseline gap-2 mb-8">
                      <span className="text-4xl font-bold text-amber-600">৳{medicine.price}</span>
                      <span className="text-gray-400 text-lg">/ pack</span>
                    </div>

                    {/* Quantity & Cart Action - Highlighted Section */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold text-gray-900">Quantity</span>
                        <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1}
                            className="h-10 w-10 text-gray-600 hover:text-amber-600"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setQuantity(quantity + 1)}
                            disabled={!medicine.inStock}
                            className="h-10 w-10 text-gray-600 hover:text-amber-600"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <Button
                        onClick={handleAddToCart}
                        disabled={!medicine.inStock}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30 h-12 text-lg font-semibold rounded-xl"
                      >
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Add to Cart - ৳{(medicine.price * quantity).toFixed(2)}
                      </Button>
                      {!medicine.inStock && (
                        <p className="text-red-500 text-sm mt-3 text-center font-medium flex items-center justify-center">
                          <AlertCircle className="h-4 w-4 mr-1" /> Currently unavailable
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Form</p>
                      <p className="font-medium text-gray-900">{medicine.form || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Strength</p>
                      <p className="font-medium text-gray-900">{medicine.strength || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Product Description & Info */}
          <div className="grid md:grid-cols-3 gap-10">
            <div className="md:col-span-2">
              <Card className="h-full border-2 border-gray-100">
                <CardHeader>
                  <CardTitle className="text-xl">Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {medicine.description || `${medicine.name} is a premium pharmaceutical product manufactured by ${medicine.brand}. It is formulated to meet high quality standards and provide effective relief. Please consult with a healthcare professional before use.`}
                    </p>
                  </div>

                  {medicine.genericName && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Generic Name</h3>
                      <p className="text-gray-600">{medicine.genericName}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Safety Information</h3>
                    <ul className="space-y-2 text-gray-600 text-sm bg-amber-50/50 p-4 rounded-lg border border-amber-100">
                      <li className="flex gap-2 items-start">
                        <span className="text-amber-500 mt-1">•</span>
                        <span>Keep this medicine out of the reach of children and pets.</span>
                      </li>
                      <li className="flex gap-2 items-start">
                        <span className="text-amber-500 mt-1">•</span>
                        <span>Store in a cool, dry place below 30°C, away from light and moisture.</span>
                      </li>
                      <li className="flex gap-2 items-start">
                        <span className="text-amber-500 mt-1">•</span>
                        <span>Do not use this medicine after the expiry date stated on the packaging.</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-1">
              <Card className="h-full border-2 border-gray-100 bg-gray-50/50">
                <CardHeader>
                  <CardTitle className="text-lg">Key Attributes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-500 text-sm">Manufacturer</span>
                      <span className="font-medium text-gray-900 text-right">{medicine.manufacturer || medicine.brand}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-500 text-sm">Category</span>
                      <span className="font-medium text-gray-900 text-right">{medicine.category}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-500 text-sm">Unit Price</span>
                      <span className="font-medium text-amber-600 text-right">৳{medicine.price}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-500 text-sm">Status</span>
                      <span className={medicine.inStock ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                        {medicine.inStock ? "Available" : "Stock Out"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>


      </div>
    </div >
  );
}
