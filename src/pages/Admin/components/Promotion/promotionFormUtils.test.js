import test from 'node:test';
import assert from 'node:assert/strict';

import {
    getInitialPromotionFormData,
    validatePromotionForm,
    buildPromotionPayload,
} from './promotionFormUtils.js';

const validBaseForm = {
    name: 'Summer sale',
    description: '',
    type: 'seasonal',
    discountPercentage: '10',
    discountAmount: '',
    startDate: '2026-05-05T10:00',
    endDate: '2026-05-06T10:00',
    isActive: true,
};

test('new promotion only uses percentage discount fields', () => {
    const formData = getInitialPromotionFormData();

    assert.equal(formData.discountPercentage, '');
    assert.equal(formData.discountAmount, '');
    assert.equal(Object.hasOwn(formData, 'discountMode'), false);
});

test('existing fixed amount promotion does not reopen fixed amount editing', () => {
    const formData = getInitialPromotionFormData({
        name: 'Fixed campaign',
        description: '',
        type: 'special',
        discountPercentage: null,
        discountAmount: 10000000,
        startDate: '2026-05-05T10:00:00',
        endDate: '2026-05-06T10:00:00',
        isActive: true,
    });

    assert.equal(formData.discountPercentage, '');
    assert.equal(formData.discountAmount, '');
    assert.equal(Object.hasOwn(formData, 'discountMode'), false);
});

test('validates percentage and ignores fixed amount fields', () => {
    const errors = validatePromotionForm({
        ...validBaseForm,
        discountPercentage: '',
        discountAmount: '10000000',
    });

    assert.equal(errors.discountPercentage, 'Vui lòng nhập phần trăm giảm giá');
    assert.equal(errors.discountAmount, undefined);
});

test('build payload always clears fixed amount discounts', () => {
    const payload = buildPromotionPayload({
        ...validBaseForm,
        discountAmount: 10000000,
    });

    assert.equal(payload.discountPercentage, 10);
    assert.equal(payload.discountAmount, null);
    assert.equal(Object.hasOwn(payload, 'discountMode'), false);
});
