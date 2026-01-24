/**
 * APP.JS - Dapur Ghania Premium Hampers
 * Logic: React Multi-page, Firebase Integration, Shopping Cart
 */

const { useState, useEffect } = React;

// 1. Inisialisasi Firebase (Menggunakan Config Global)
const firebaseConfig = JSON.parse(__firebase_config);
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const appId = typeof __app_id !== 'undefined' ? __app_id : 'hampers-ghania-pro';

function App() {
    // State Navigasi Halaman
    const [currentPage, setCurrentPage] = useState('home'); 
    
    // State Data & User
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [orderForm, setOrderForm] = useState({ name: '', phone: '', address: '' });

    // 2. Auth: Sign In Anonymously agar user bisa akses data publik
    useEffect(() => {
        const initAuth = async () => {
            try {
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    await auth.signInWithCustomToken(__initial_auth_token);
                } else {
                    await auth.signInAnonymously();
                }
            } catch (e) {
                console.error("Auth Error:", e);
            }
        };
        initAuth();
        const unsub = auth.onAuthStateChanged(u => { if(u) setUser(u); });
        return () => unsub();
    }, []);

    // 3. Fetch Data Produk dari Firestore (Path: /artifacts/{appId}/public/data/products)
    useEffect(() => {
        if (!user) return;
        const prodRef = db.collection('artifacts')
                          .doc(appId)
                          .collection('public')
                          .doc('data')
                          .collection('products');
        
        const unsubscribe = prodRef.onSnapshot(snap => {
            const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProducts(list);
        }, err => console.error("Firestore Error:", err));
        
        return () => unsubscribe();
    }, [user]);

    // 4. Fungsi Keranjang
    const addToCart = (product) => {
        const exist = cart.find(item => item.id === product.id);
        if (exist) {
            setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
        } else {
            setCart([...cart, { ...product, qty: 1 }]);
        }
        setIsCartOpen(true);
    };

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    const handleCheckout = (e) => {
        e.preventDefault();
        const itemsText = cart.map(i => `${i.name} (${i.qty}x)`).join(', ');
        const waMsg = `Halo Dapur Ghania, saya pesan:\n\nProduk: ${itemsText}\nTotal: Rp ${cartTotal.toLocaleString()}\n\nNama: ${orderForm.name}\nAlamat: ${orderForm.address}`;
        window.open(`https://wa.me/62895334016084?text=${encodeURIComponent(waMsg)}`);
    };

    // --- KOMPONEN HALAMAN ---

    const Navbar = () => (
        <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
                    <div className="w-10 h-10 bg-[#4A3728] rounded-full flex items-center justify-center text-white font-bold">G</div>
                    <h1 className="text-xl font-black text-[#4A3728]">Dapur Ghania</h1>
                </div>
                <div className="hidden md:flex gap-6 text-sm font-bold uppercase tracking-wider">
                    <button 
                        onClick={() => setCurrentPage('home')} 
                        className={`transition-colors ${currentPage === 'home' ? 'text-[#C5A059] border-b-2 border-[#C5A059]' : 'text-gray-400'}`}
                    >Katalog</button>
                    <button 
                        onClick={() => setCurrentPage('about')} 
                        className={`transition-colors ${currentPage === 'about' ? 'text-[#C5A059] border-b-2 border-[#C5A059]' : 'text-gray-400'}`}
                    >Tentang Kami</button>
                </div>
            </div>
            <button onClick={() => setIsCartOpen(true)} className="bg-[#F7F2EB] p-2 rounded-full relative active:scale-90 transition-transform">
                🛒 <span className="font-bold ml-1">{cart.reduce((a, b) => a + b.qty, 0)}</span>
            </button>
        </nav>
    );

    const HomePage = () => (
        <main className="max-w-6xl mx-auto p-6 animate-fadeIn">
            <div className="text-center my-10">
                <h2 className="text-3xl font-black text-[#4A3728] uppercase tracking-tighter">Premium Hampers Selection</h2>
                <p className="text-gray-400 text-sm mt-2 font-medium">Kado terbaik untuk momen tak terlupakan</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {products.map(p => (
                    <div key={p.id} className="product-card bg-white p-4 rounded-[32px] border border-[#F2EDE4] hover:shadow-xl transition-all">
                        <img src={p.img || 'https://via.placeholder.com/300'} className="w-full aspect-square object-cover rounded-[24px] mb-4" />
                        <h3 className="font-bold text-xs uppercase text-[#4A3728] truncate">{p.name}</h3>
                        <p className="text-[#C5A059] font-black text-lg my-2">Rp {p.price?.toLocaleString()}</p>
                        <button onClick={() => addToCart(p)} className="w-full py-3 bg-[#F7F2EB] text-[#4A3728] rounded-2xl font-bold text-[10px] uppercase hover:bg-[#4A3728] hover:text-white transition-all">
                            + Keranjang
                        </button>
                    </div>
                ))}
            </div>
        </main>
    );

    const AboutPage = () => (
        <main className="max-w-4xl mx-auto p-10 animate-fadeIn text-center">
            <h2 className="text-4xl font-black text-[#4A3728] mb-6">Cerita Dapur Ghania</h2>
            <div className="bg-white p-10 rounded-[48px] border border-[#F2EDE4] text-gray-600 leading-relaxed shadow-sm">
                <p className="mb-6">Dapur Ghania lahir dari cinta pada kuliner rumahan dan seni memberikan hadiah. Kami percaya bahwa setiap hantaran adalah jembatan kasih sayang.</p>
                <p className="mb-8 font-medium">Dibuat dengan bahan premium, tanpa pengawet, dan dikemas secara estetis untuk memastikan penerimanya merasa sangat spesial.</p>
                <div className="grid grid-cols-3 gap-6 pt-10 border-t border-gray-100">
                    <div><h4 className="text-[#C5A059] text-2xl font-black">100%</h4><p className="text-[10px] font-bold uppercase text-gray-400">Halal & Higienis</p></div>
                    <div><h4 className="text-[#C5A059] text-2xl font-black">Premium</h4><p className="text-[10px] font-bold uppercase text-gray-400">Packaging</p></div>
                    <div><h4 className="text-[#C5A059] text-2xl font-black">Same Day</h4><p className="text-[10px] font-bold uppercase text-gray-400">Delivery</p></div>
                </div>
            </div>
        </main>
    );

    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            <Navbar />
            
            {currentPage === 'home' ? <HomePage /> : <AboutPage />}

            {/* Sidebar Keranjang */}
            {isCartOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
                    <div className="relative w-full max-w-md bg-white h-full p-8 shadow-2xl flex flex-col">
                        <div className="flex justify-between items-center mb-8 border-b pb-4">
                            <h2 className="text-2xl font-black text-[#4A3728]">MY CART</h2>
                            <button onClick={() => setIsCartOpen(false)} className="text-3xl font-light">&times;</button>
                        </div>
                        <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                            {cart.map(item => (
                                <div key={item.id} className="flex gap-4 items-center bg-gray-50 p-4 rounded-3xl border border-gray-100">
                                    <img src={item.img} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                                    <div className="flex-1">
                                        <p className="font-bold text-xs uppercase text-[#4A3728]">{item.name}</p>
                                        <p className="text-[#C5A059] font-black text-sm">Rp {item.price?.toLocaleString()} <span className="text-gray-300 font-normal">x {item.qty}</span></p>
                                    </div>
                                    <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} className="text-red-300 hover:text-red-500">🗑️</button>
                                </div>
                            ))}
                            {cart.length === 0 && <p className="text-center text-gray-400 mt-20 italic">Keranjang masih kosong...</p>}
                        </div>
                        {cart.length > 0 && (
                            <div className="mt-8 border-t pt-6">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="font-bold text-gray-400 uppercase text-xs">Subtotal</span>
                                    <span className="text-2xl font-black text-[#4A3728]">Rp {cartTotal.toLocaleString()}</span>
                                </div>
                                <form onSubmit={handleCheckout} className="space-y-4">
                                    <input required placeholder="Nama Anda" className="w-full p-4 border rounded-2xl bg-gray-50 text-sm focus:ring-2 focus:ring-[#C5A059] outline-none" onChange={e => setOrderForm({...orderForm, name: e.target.value})} />
                                    <textarea required placeholder="Alamat Pengiriman" className="w-full p-4 border rounded-2xl bg-gray-50 text-sm h-28 focus:ring-2 focus:ring-[#C5A059] outline-none" onChange={e => setOrderForm({...orderForm, address: e.target.value})} />
                                    <button type="submit" className="w-full bg-[#4A3728] text-white py-5 rounded-2xl font-black uppercase shadow-lg hover:shadow-xl transition-all active:scale-95">Checkout via WhatsApp</button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Render ke elemen root
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
