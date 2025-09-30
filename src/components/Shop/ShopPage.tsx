import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Layout } from '../Layout/Layout';

interface Product {
  id: string;
  name: string;
  description: string;
  category: 'stationery' | 'books' | 'uniform' | 'equipment';
  price: number;
  image: string;
  inStock: boolean;
  quantity: number;
}

interface CartItem extends Product {
  cartQuantity: number;
}

export const ShopPage: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'stationery' | 'books' | 'uniform' | 'equipment'>('all');
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    // Products inspired by Katleho Tutors actual shop items
    const mockProducts: Product[] = [
      // Katleho Tutors Branded Clothing (from their website)
      {
        id: '1',
        name: 'Katleho Tutors Black T-Shirt',
        description: 'Official Katleho Tutors branded t-shirt - Black',
        category: 'uniform',
        price: 160,
        image: '/images/katleho/black-tshirt.png',
        inStock: true,
        quantity: 25
      },
      {
        id: '2',
        name: 'Katleho Tutors Grey Hoodie',
        description: 'Comfortable grey hoodie with Katleho Tutors branding',
        category: 'uniform',
        price: 350,
        image: '/images/katleho/grey-hoodie.jpg',
        inStock: true,
        quantity: 15
      },
      {
        id: '3',
        name: 'Katleho Tutors White Golfer',
        description: 'Classic white golfer shirt with embroidered logo',
        category: 'uniform',
        price: 200,
        image: '/images/katleho/white-golfer.jpg',
        inStock: true,
        quantity: 30
      },
      {
        id: '4',
        name: 'Katleho Tutors Black Sweater',
        description: 'Warm black sweater perfect for winter classes',
        category: 'uniform',
        price: 320,
        image: '/images/katleho/black-sweater.jpg',
        inStock: true,
        quantity: 20
      },
      {
        id: '5',
        name: 'Katleho Tutors Grey T-Shirt',
        description: 'Comfortable grey branded t-shirt',
        category: 'uniform',
        price: 160,
        image: '/images/katleho/grey-tshirt.jpg',
        inStock: true,
        quantity: 28
      },
      {
        id: '6',
        name: 'Mathematics Workbook - Grade 10',
        description: 'Comprehensive workbook with exercises and solutions',
        category: 'books',
        price: 120,
        image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop',
        inStock: true,
        quantity: 22
      },
      {
        id: '7',
        name: 'Scientific Calculator',
        description: 'CASIO FX-82ZA PLUS II Scientific Calculator',
        category: 'equipment',
        price: 250,
        image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&auto=format&fit=crop',
        inStock: true,
        quantity: 12
      },
      {
        id: '8',
        name: 'Katleho Tutors Black Hoodie',
        description: 'Premium black hoodie with Katleho Tutors logo',
        category: 'uniform',
        price: 350,
        image: '/images/katleho/black-hoodie.jpg',
        inStock: true,
        quantity: 18
      },
      {
        id: '9',
        name: 'Stationery Pack',
        description: 'Complete stationery set - pens, pencils, ruler, eraser',
        category: 'stationery',
        price: 85,
        image: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400&auto=format&fit=crop',
        inStock: true,
        quantity: 35
      },
      {
        id: '10',
        name: 'Katleho Tutors White Sweater',
        description: 'Elegant white sweater with embroidered branding',
        category: 'uniform',
        price: 320,
        image: '/images/katleho/white-sweater.jpg',
        inStock: false,
        quantity: 0
      },
      {
        id: '11',
        name: 'Physical Sciences Textbook',
        description: 'Grade 11 & 12 Physical Sciences comprehensive guide',
        category: 'books',
        price: 180,
        image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&auto=format&fit=crop',
        inStock: true,
        quantity: 14
      },
      {
        id: '12',
        name: 'Katleho Tutors Grey Golfer',
        description: 'Professional grey golfer shirt for students',
        category: 'uniform',
        price: 200,
        image: '/images/katleho/grey-golfer.jpg',
        inStock: true,
        quantity: 24
      }
    ];

    setProducts(mockProducts);
    setLoading(false);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, cartQuantity: quantity } : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.cartQuantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.cartQuantity, 0);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'stationery':
        return '✏️';
      case 'books':
        return '📚';
      case 'uniform':
        return '👕';
      case 'equipment':
        return '🔬';
      default:
        return '🛒';
    }
  };

  const filteredProducts = filter === 'all' 
    ? products 
    : products.filter(p => p.category === filter);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🛒 Brain Hub Shop</h1>
            <p className="text-gray-600">Learning materials, stationery, and more</p>
          </div>
          <button
            onClick={() => setShowCart(true)}
            className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-medium"
          >
            🛒 Cart
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          {[
            { value: 'all', label: 'All Products', icon: '🛍️' },
            { value: 'books', label: 'Books', icon: '📚' },
            { value: 'stationery', label: 'Stationery', icon: '✏️' },
            { value: 'equipment', label: 'Equipment', icon: '🔬' },
            { value: 'uniform', label: 'Uniform', icon: '👕' }
          ].map((filterOption) => (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === filterOption.value
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400'
              }`}
            >
              {filterOption.icon} {filterOption.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              {/* Product Image */}
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <span className="bg-red-600 text-white px-4 py-2 rounded-full font-semibold">
                      Out of Stock
                    </span>
                  </div>
                )}
                <span className="absolute top-2 right-2 px-2 py-1 bg-white rounded-full text-xs font-medium shadow">
                  {getCategoryIcon(product.category)}
                </span>
              </div>

              {/* Product Details */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 h-12">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">R{product.price}</p>
                    {product.inStock && (
                      <p className="text-xs text-green-600">In stock: {product.quantity}</p>
                    )}
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={!product.inStock}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      product.inStock
                        ? 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Modal */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Shopping Cart</h2>

                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🛒</div>
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    {/* Cart Items */}
                    <div className="space-y-4 mb-6">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600">R{item.price} each</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                              className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-medium">{item.cartQuantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                              className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                            >
                              +
                            </button>
                          </div>
                          <p className="font-semibold text-gray-900 w-24 text-right">
                            R{item.price * item.cartQuantity}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="border-t border-gray-200 pt-6">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-xl font-semibold text-gray-900">Total:</span>
                        <span className="text-3xl font-bold text-blue-600">R{getTotalPrice()}</span>
                      </div>

                      {/* Payment Info */}
                      <div className="bg-blue-50 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold text-gray-900 mb-2">Banking Details</h4>
                        <div className="text-sm text-gray-700 space-y-1">
                          <p><strong>Bank:</strong> ABSA Bank</p>
                          <p><strong>Account:</strong> 4107586852</p>
                          <p><strong>Branch Code:</strong> 632005</p>
                          <p><strong>Type:</strong> Business Cheque</p>
                          <p className="text-blue-600 font-medium mt-2">
                            Reference: Your Name + Order Number
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4">
                        <button
                          onClick={() => setShowCart(false)}
                          className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all font-medium"
                        >
                          Continue Shopping
                        </button>
                        <button
                          onClick={() => alert('Order placed! You will receive a confirmation email with payment instructions.')}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-medium"
                        >
                          Place Order
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Need Help with Your Order?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl mb-2">📞</div>
              <p className="font-medium">Call: 061 412 8252</p>
            </div>
            <div>
              <div className="text-3xl mb-2">📧</div>
              <p className="font-medium">shop@brainhub.co.za</p>
            </div>
            <div>
              <div className="text-3xl mb-2">💬</div>
              <p className="font-medium">WhatsApp Us</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ShopPage;
