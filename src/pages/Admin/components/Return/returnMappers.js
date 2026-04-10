/**
 * Return module data normalizers.
 * Converts camelCase backend responses to snake_case frontend fields,
 * following the same pattern as orderMappers.js.
 */

export const normalizeReturnItem = (item) => {
    if (!item) return item;
    return {
        order_item_id: item.orderItemId ?? item.order_item_id,
        return_item_id: item.returnItemId ?? item.return_item_id,
        variant_id: item.variantId ?? item.variant_id,
        quantity: item.quantity,
        restocked_qty: item.restockedQty ?? item.restocked_qty ?? 0,
        scrapped_qty: item.scrappedQty ?? item.scrapped_qty ?? 0,
        inspection_note: item.inspectionNote ?? item.inspection_note ?? '',
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

export const normalizeTimelineStep = (step) => {
    if (!step) return step;
    return {
        key: step.stepKey ?? step.key,
        label: step.label,
        completed: step.completed,
        current: step.current,
        timestamp: step.timestamp,
    };
};

export const normalizeReturnImage = (img) => {
    if (!img) return img;
    return {
        image_id: img.imageId ?? img.image_id,
        image_url: img.imageUrl ?? img.image_url,
        created_at: img.createdAt ?? img.created_at,
    };
};

export const normalizeReturn = (r) => {
    if (!r) return r;
    return {
        return_id: r.returnId ?? r.return_id,
        return_code: r.returnCode ?? r.return_code,
        order_id: r.orderId ?? r.order_id,
        order_number: r.orderNumber ?? r.order_number,
        customer_id: r.customerId ?? r.customer_id,
        customer_name: r.customerName ?? r.customer_name,
        customer_phone: r.customerPhone ?? r.customer_phone,
        order_type: r.orderType ?? r.order_type,
        total_amount: r.totalAmount ?? r.total_amount,
        original_total: r.originalTotal ?? r.original_total,
        shipping_cost_refund: r.shippingCostRefund ?? r.shipping_cost_refund,
        deduction: r.deduction,
        return_status: r.returnStatus ?? r.return_status,
        return_reason: r.returnReason ?? r.return_reason,
        refund_method: r.refundMethod ?? r.refund_method,
        description: r.description,
        reject_reason: r.rejectReason ?? r.reject_reason,
        reject_note: r.rejectNote ?? r.reject_note,
        notes: r.notes,
        is_partial: r.isPartial ?? r.is_partial,
        item_count: r.itemCount ?? r.item_count,
        bank_account: r.bankAccount ?? r.bank_account ?? null,
        bank_name: r.bankName ?? r.bank_name ?? null,
        order_created_at: r.orderCreatedAt ?? r.order_created_at,
        created_at: r.createdAt ?? r.created_at,
        updated_at: r.updatedAt ?? r.updated_at,
        items: r.items ? r.items.map(normalizeReturnItem) : [],
        timeline: r.timeline ? r.timeline.map(normalizeTimelineStep) : [],
        images: r.images ? r.images.map(normalizeReturnImage) : [],
    };
};

export const normalizeDeliverableOrder = (o) => {
    if (!o) return o;
    return {
        order_id: o.orderId ?? o.order_id,
        order_number: o.orderNumber ?? o.order_number,
        customer_id: o.customerId ?? o.customer_id,
        customer_name: o.customerName ?? o.customer_name,
        customer_phone: o.customerPhone ?? o.customer_phone,
        total_amount: o.totalAmount ?? o.total_amount,
        created_at: o.createdAt ?? o.created_at,
        status: o.status,
        items: o.items ? o.items.map(normalizeReturnItem) : [],
    };
};
