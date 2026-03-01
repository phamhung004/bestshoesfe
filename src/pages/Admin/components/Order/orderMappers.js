export const normalizeOrderItem = (item) => {
    if (!item) return item;
    return {
        order_item_id: item.orderItemId ?? item.order_item_id,
        variant_id: item.variantId ?? item.variant_id,
        quantity: item.quantity,
        unit_price: item.unitPrice ?? item.unit_price,
        total_price: item.totalPrice ?? item.total_price,
        product: item.product ? {
            product_id: item.product.productId ?? item.product.product_id,
            name: item.product.name,
            image_url: item.product.imageUrl ?? item.product.image_url,
        } : null,
        size: item.size ? {
            size_id: item.size.sizeId ?? item.size.size_id,
            size_name: item.size.sizeName ?? item.size.size_name,
        } : null,
        color: item.color ? {
            color_id: item.color.colorId ?? item.color.color_id,
            color_name: item.color.colorName ?? item.color.color_name,
            color_code: item.color.colorCode ?? item.color.color_code,
        } : null,
    };
};

export const normalizeOrder = (o) => {
    if (!o) return o;
    return {
        order_id: o.orderId ?? o.order_id,
        order_number: o.orderNumber ?? o.order_number,
        customer_id: o.customerId ?? o.customer_id,
        coupon_id: o.couponId ?? o.coupon_id,
        customer_name: o.customerName ?? o.customer_name,
        customer_phone: o.customerPhone ?? o.customer_phone,
        shipping_province: o.shippingProvince ?? o.shipping_province,
        shipping_district: o.shippingDistrict ?? o.shipping_district,
        shipping_ward: o.shippingWard ?? o.shipping_ward,
        shipping_address: o.shippingAddress ?? o.shipping_address,
        order_type: o.orderType ?? o.order_type,
        subtotal: o.subtotal,
        shipping_cost: o.shippingCost ?? o.shipping_cost,
        coupon_discount_amount: o.couponDiscountAmount ?? o.coupon_discount_amount,
        total_amount: o.totalAmount ?? o.total_amount,
        status: o.status,
        payment_status: o.paymentStatus ?? o.payment_status,
        created_at: o.createdAt ?? o.created_at,
        updated_at: o.updatedAt ?? o.updated_at,
        item_count: o.itemCount ?? o.item_count,
        items: o.items ? o.items.map(normalizeOrderItem) : undefined,
    };
};
