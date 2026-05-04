import assert from 'node:assert/strict';
import { getTimelineStepState } from './orderTimelineState.js';

const formatDate = (value) => value ? value.slice(0, 10) : '';

const deliveredStep = getTimelineStepState({
    stepIndex: 5,
    activeStep: 5,
    orderStatus: 'Đã giao',
    updatedAt: '2026-05-04T10:15:00',
    createdAt: '2026-05-04T09:00:00',
    formatDate,
});

assert.equal(deliveredStep.isCompleted, true);
assert.equal(deliveredStep.isCurrent, false);
assert.equal(deliveredStep.isPending, false);
assert.equal(deliveredStep.timeLabel, '2026-05-04');

const shippingStep = getTimelineStepState({
    stepIndex: 4,
    activeStep: 4,
    orderStatus: 'Đang giao',
    updatedAt: '2026-05-04T10:15:00',
    createdAt: '2026-05-04T09:00:00',
    formatDate,
});

assert.equal(shippingStep.isCompleted, false);
assert.equal(shippingStep.isCurrent, true);
assert.equal(shippingStep.isPending, false);
assert.equal(shippingStep.timeLabel, '2026-05-04');
