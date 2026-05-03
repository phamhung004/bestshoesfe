import test from 'node:test';
import assert from 'node:assert/strict';

import {
    normalizeCouponCode,
    validateCouponForm,
    buildCouponPayload,
} from './couponFormUtils.js';

test('normalizes coupon codes before validating uppercase format', () => {
    assert.equal(normalizeCouponCode(' summer2024 '), 'SUMMER2024');

    const errors = validateCouponForm({
        code: ' summer2024 ',
        name: 'Summer sale',
        description: '',
        type: 'Percentage',
        value: '10',
        minimumAmount: '',
        maximumDiscount: '',
        usageLimit: '',
        startDate: '2026-05-03T10:00',
        endDate: '2026-05-04T10:00',
    });

    assert.equal(errors.code, undefined);
});

test('coupon payload always uses the fixed one-use-per-customer limit', () => {
    const payload = buildCouponPayload({
        code: 'summer2024',
        name: 'Summer sale',
        description: '',
        type: 'Percentage',
        value: '10',
        minimumAmount: '',
        maximumDiscount: '',
        usageLimit: '',
        startDate: '2026-05-03T10:00',
        endDate: '2026-05-04T10:00',
        status: true,
    }, 7);

    assert.equal(payload.code, 'SUMMER2024');
    assert.equal(payload.perCustomerLimit, 1);
    assert.equal(payload.createdBy, 7);
});
