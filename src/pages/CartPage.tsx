import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../utils/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Trash2, Plus, Minus, ShoppingBag, User, MapPin, Phone, Package, ArrowRight, Edit, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface CartPageProps {
  onNavigate: (page: string, data?: any) => void;
}

interface Address {
  id: string;
  type: string;
  street: string;
  city: string;
  district: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

export function CartPage({ onNavigate }: CartPageProps) {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart, refreshCart } = useCart();
  const { user, updateUser } = useAuth();

  // Refresh cart when page loads to sync with localStorage (in case admin added items)
  useEffect(() => {
    if (user && refreshCart) {
      refreshCart();
    }
  }, [user, refreshCart]);
  const [showGuestCheckout, setShowGuestCheckout] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [guestInfo, setGuestInfo] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Dhaka',
  });

  const [newAddress, setNewAddress] = useState({
    type: 'Home',
    street: '',
    city: 'Dhaka',
    district: '',
    postalCode: '',
    phone: '',
  });

  // Load addresses from user profile
  useEffect(() => {
    if (user && user.addresses) {
      setAddresses(user.addresses);
      const defaultAddr = user.addresses.find((a: Address) => a.isDefault);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr);
      } else if (user.addresses.length > 0) {
        setSelectedAddress(user.addresses[0]);
      }
    }
  }, [user]);

  const [deliveryChargeDhaka, setDeliveryChargeDhaka] = useState('70');
  const [deliveryChargeOutside, setDeliveryChargeOutside] = useState('120');

  // Load delivery charges from API
  useEffect(() => {
    const loadDeliveryCharges = async () => {
      try {
        const [dhakaSetting, outsideSetting] = await Promise.all([
          settingsAPI.get('deliveryChargeDhaka').catch(() => ({ value: '70' })),
          settingsAPI.get('deliveryChargeOutside').catch(() => ({ value: '120' })),
        ]);
        setDeliveryChargeDhaka(dhakaSetting.value || '70');
        setDeliveryChargeOutside(outsideSetting.value || '120');
      } catch (error) {
        console.error('Error loading delivery charges:', error);
      }
    };
    loadDeliveryCharges();
  }, []);

  // Calculate delivery fee based on city
  const getDeliveryFee = (city: string): number => {
    const dhakaFee = parseInt(deliveryChargeDhaka);
    const outsideFee = parseInt(deliveryChargeOutside);

    const dhakaCities = ['Dhaka', 'Dhanmondi', 'Gulshan', 'Uttara', 'Banani', 'Wari', 'Old Dhaka'];
    const cityLower = city.toLowerCase();
    const isDhaka = dhakaCities.some(dc => cityLower.includes(dc.toLowerCase()));

    return isDhaka ? dhakaFee : outsideFee;
  };

  const deliveryFee = selectedAddress
    ? getDeliveryFee(selectedAddress.city)
    : guestInfo.city
      ? getDeliveryFee(guestInfo.city)
      : parseInt(deliveryChargeDhaka);

  const total = cartTotal + deliveryFee;

  const handleAddAddress = () => {
    if (!newAddress.street || !newAddress.city || !newAddress.district) {
      toast.error('Please fill all required fields');
      return;
    }

    const address: Address = {
      id: Date.now().toString(),
      ...newAddress,
      isDefault: addresses.length === 0,
    };

    const updatedAddresses = [...addresses, address];
    setAddresses(updatedAddresses);

    if (user) {
      updateUser({ addresses: updatedAddresses });
    }

    setSelectedAddress(address);
    setNewAddress({ type: 'Home', street: '', city: 'Dhaka', district: '', postalCode: '', phone: '' });
    setShowAddressForm(false);
    toast.success('Address added successfully!');
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    if (!user) {
      setShowGuestCheckout(true);
      return;
    }

    // Check if address is selected
    if (!selectedAddress) {
      toast.error('Please select or add a delivery address');
      return;
    }

    onNavigate('payment', {
      type: 'medicine',
      items: cart,
      amount: total,
      deliveryFee,
      address: selectedAddress,
    });
  };

  const handleGuestCheckout = () => {
    if (!guestInfo.name || !guestInfo.phone || !guestInfo.address || !guestInfo.city) {
      toast.error('Please fill in all fields');
      return;
    }

    onNavigate('payment', {
      type: 'medicine',
      items: cart,
      amount: total,
      deliveryFee,
      guestInfo: {
        ...guestInfo,
        address: `${guestInfo.address}, ${guestInfo.city}`,
      },
    });
    setShowGuestCheckout(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-orange-50/30 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent inline-block">Shopping Cart</h1>
          <p className="text-gray-600">Review your items and proceed to checkout</p>
        </div>

        {cart.length === 0 ? (
          <Card className="border-2 border-amber-200">
            <CardContent className="p-12 text-center">
              <div className="bg-gradient-to-br from-amber-100 to-orange-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-12 w-12 text-amber-600" />
              </div>
              <h3 className="text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">
                Add some medicines to get started
              </p>
              <Button
                onClick={() => onNavigate('medicines')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30"
              >
                <Package className="h-4 w-4 mr-2" />
                Browse Medicines
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <Card key={item.id} className="border-2 border-amber-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-xl border-2 border-amber-100"
                      />
                      <div className="flex-1">
                        <h4 className="text-gray-900 mb-2 font-semibold">{item.name}</h4>
                        <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-3">
                          ৳{item.price}
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-amber-50 border-2 border-amber-200 rounded-xl px-3 py-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 rounded-lg hover:bg-amber-100 transition-colors"
                            >
                              <Minus className="h-4 w-4 text-amber-700" />
                            </button>
                            <span className="w-12 text-center font-bold text-amber-900">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 rounded-lg hover:bg-amber-100 transition-colors"
                            >
                              <Plus className="h-4 w-4 text-amber-700" />
                            </button>
                          </div>
                          <p className="text-lg font-bold text-gray-900">
                            = ৳{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          removeFromCart(item.id);
                          toast.success('Item removed from cart');
                        }}
                        className="text-red-500 hover:text-red-700 p-3 rounded-xl hover:bg-red-50 transition-all h-fit"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Address Selection Section */}
              {user && (
                <Card className="border-2 border-amber-200">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-amber-900 flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Delivery Address
                      </CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAddressForm(true)}
                        className="border-amber-300 text-amber-700"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Address
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {addresses.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-gray-600 mb-4">No address found. Please add a delivery address.</p>
                        <Button
                          onClick={() => setShowAddressForm(true)}
                          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Address
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {addresses.map((address) => (
                          <div
                            key={address.id}
                            onClick={() => setSelectedAddress(address)}
                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedAddress?.id === address.id
                              ? 'border-amber-500 bg-amber-50'
                              : 'border-amber-200 hover:border-amber-300'
                              }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline">{address.type}</Badge>
                                  {address.isDefault && (
                                    <Badge className="bg-amber-500">Default</Badge>
                                  )}
                                </div>
                                <p className="text-gray-900 font-medium">{address.street}</p>
                                <p className="text-sm text-gray-600">
                                  {address.city}, {address.district} - {address.postalCode}
                                </p>
                                <p className="text-sm text-gray-600">Phone: {address.phone}</p>
                              </div>
                              {selectedAddress?.id === address.id && (
                                <div className="bg-amber-500 text-white rounded-full p-1">
                                  <CheckCircle className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="border-2 border-amber-200 sticky top-24">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                  <CardTitle className="text-amber-900">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal ({cart.length} items)</span>
                      <span className="font-semibold">৳{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Delivery Fee</span>
                      <span className="font-semibold">
                        ৳{deliveryFee}
                        {selectedAddress && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({selectedAddress.city === 'Dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="border-t-2 border-amber-200 pt-3 flex justify-between">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        ৳{total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {!user && (
                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl">
                      <p className="text-sm text-amber-800 mb-2 font-medium">
                        🚀 Need urgent delivery?
                      </p>
                      <p className="text-xs text-gray-600">
                        Checkout as guest without creating an account!
                      </p>
                    </div>
                  )}

                  {user && !selectedAddress && (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                      <p className="text-sm text-red-800 font-medium">
                        ⚠️ Please select or add a delivery address
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleCheckout}
                    disabled={!!user && !selectedAddress}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30 text-lg py-6 disabled:opacity-50"
                  >
                    {user ? 'Proceed to Payment' : 'Guest Checkout'}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>

                  {!user && (
                    <Button
                      onClick={() => onNavigate('login')}
                      variant="outline"
                      className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Login to Continue
                    </Button>
                  )}

                  <Button
                    onClick={() => {
                      clearCart();
                      toast.success('Cart cleared');
                    }}
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cart
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Add Address Dialog */}
        <Dialog open={showAddressForm} onOpenChange={setShowAddressForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Delivery Address</DialogTitle>
              <DialogDescription>Add a new address for delivery</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Address Type</Label>
                <Select value={newAddress.type} onValueChange={(value) => setNewAddress({ ...newAddress, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Home">Home</SelectItem>
                    <SelectItem value="Office">Office</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Street Address *</Label>
                <Input
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                />
              </div>
              <div>
                <Label>City *</Label>
                <Input
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                />
              </div>
              <div>
                <Label>District *</Label>
                <Input
                  value={newAddress.district}
                  onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                />
              </div>
              <div>
                <Label>Postal Code</Label>
                <Input
                  value={newAddress.postalCode}
                  onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone Number *</Label>
                <Input
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAddressForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAddAddress} className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                  Add Address
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Guest Checkout Dialog */}
        <Dialog open={showGuestCheckout} onOpenChange={setShowGuestCheckout}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Guest Checkout
              </DialogTitle>
              <DialogDescription>
                Provide your details for delivery. No account needed for urgent orders!
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="guest-name" className="text-gray-700 font-medium">Full Name *</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-400" />
                  <Input
                    id="guest-name"
                    value={guestInfo.name}
                    onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                    className="pl-10 border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="guest-phone" className="text-gray-700 font-medium">Phone Number *</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-400" />
                  <Input
                    id="guest-phone"
                    value={guestInfo.phone}
                    onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                    className="pl-10 border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="guest-city" className="text-gray-700 font-medium">City *</Label>
                <Input
                  id="guest-city"
                  value={guestInfo.city}
                  onChange={(e) => setGuestInfo({ ...guestInfo, city: e.target.value })}
                  className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              <div>
                <Label htmlFor="guest-address" className="text-gray-700 font-medium">Delivery Address *</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-amber-400" />
                  <Textarea
                    id="guest-address"
                    value={guestInfo.address}
                    onChange={(e) => setGuestInfo({ ...guestInfo, address: e.target.value })}
                    rows={3}
                    className="pl-10 border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-800">
                  <strong>Delivery Fee:</strong> ৳{getDeliveryFee(guestInfo.city)} ({guestInfo.city === 'Dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowGuestCheckout(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGuestCheckout}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30"
                >
                  Continue to Payment
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
