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
    discountMode: 'percentage',
    discountPercentage: '10',
    discountAmount: '',
    startDate: '2026-05-05T10:00',
    endDate: '2026-05-06T10:00',
    isActive: true,
};

test('new promotion defaults to percentage discount mode', () => {
    const formData = getInitialPromotionFormData();

    assert.equal(formData.discountMode, 'percentage');
    assert.equal(formData.discountPercentage, '');
    assert.equal(formData.discountAmount, '');
});

test('existing fixed amount promotion opens amount mode and preserves value', () => {
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

    assert.equal(formData.discountMode, 'amount');
    assert.equal(formData.discountAmount, 10000000);
    assert.equal(formData.discountPercentage, '');
});

test('validates only the selected discount mode', () => {
    const percentageErrors = validatePromotionForm({
        ...validBaseForm,
        discountMode: 'percentage',
        discountPercentage: '',
        discountAmount: '10000000',
    });
    assert.equal(percentageErrors.discountPercentage, 'Vui lòng nhập phần trăm giảm giá');
    assert.equal(percentageErrors.discountAmount, undefined);

    const amountErrors = validatePromotionForm({
        ...validBaseForm,
        discountMode: 'amount',
        discountPercentage: '10',
        discountAmount: '',
    });
    assert.equal(amountErrors.discountAmount, 'Vui lòng nhập số tiền giảm');
    assert.equal(amountErrors.discountPercentage, undefined);
});

test('build payload keeps unchanged fixed amount when editing old amount promotion', () => {
    const payload = buildPromotionPayload({
        ...validBaseForm,
        discountMode: 'amount',
        discountPercentage: '',
        discountAmount: 10000000,
    });

    assert.equal(payload.discountPercentage, null);
    assert.equal(payload.discountAmount, 10000000);
});

test('build payload clears unselected amount when percentage mode is chosen', () => {
    const payload = buildPromotionPayload({
        ...validBaseForm,
        discountMode: 'percentage',
        discountPercentage: '15',
        discountAmount: '10000000',
    });

    assert.equal(payload.discountPercentage, 15);
    assert.equal(payload.discountAmount, null);
});
