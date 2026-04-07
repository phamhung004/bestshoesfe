import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Loader } from 'lucide-react';
import { wishlistApi } from '../../../api/wishlistApi';
import { useWishlist } from '../../../context/WishlistContext';
import CatalogProductCard from '../../Catalog2/components/CatalogProductCard';

const WishlistTab = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toggleWishlist, wishlistIds } = useWishlist();

    const fetchWishlist = useCallback(async () => {
        try {
            setLoading(true);
            const res = await wishlistApi.getWishlist();
            setProducts(res.data || []);
        } catch {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const handleToggle = useCallback(async (productId) => {
        await toggleWishlist(productId);
        // Remove from local list if it was unwished
        if (wishlistIds.has(Number(productId))) {
            setProducts(prev => prev.filter(p => p.productId !== productId));
        }
    }, [toggleWishlist, wishlistIds]);

    return (
        <div className="acc-tab-content">
            <div className="acc-tab-header">
                <div>
                    <h2 className="acc-tab-title">Sản phẩm yêu thích</h2>
                    <p className="acc-tab-sub">Những sản phẩm bạn đã đánh dấu yêu thích</p>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
                    <Loader size={28} style={{ animation: 'spin 1s linear infinite', color: '#4f46e5' }} />
                </div>
            ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 24px', color: '#6b7280' }}>
                    <Heart size={48} style={{ margin: '0 auto 16px', color: '#d1d5db' }} />
                    <p style={{ fontSize: 16, fontWeight: 500 }}>Chưa có sản phẩm yêu thích nào</p>
                    <p style={{ fontSize: 14, marginTop: 8 }}>Nhấn ♡ trên sản phẩm để thêm vào danh sách</p>
                    <a
                        href="/catalog"
                        style={{
                            display: 'inline-block', marginTop: 20,
                            padding: '10px 24px', background: '#4f46e5', color: '#fff',
                            borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600,
                        }}
                    >
                        Khám phá sản phẩm
                    </a>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20, marginTop: 20 }}>
                    {products.map(product => (
                        <CatalogProductCard
                            key={product.productId}
                            product={product}
                            viewMode="grid-4"
                            wishlist={Array.from(wishlistIds)}
                            onToggleWishlist={handleToggle}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistTab;
