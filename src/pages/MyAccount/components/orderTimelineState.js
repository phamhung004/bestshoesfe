export const TERMINAL_ORDER_STATUSES = new Set(['Đã giao', 'Đã hủy', 'Trả hàng/Hoàn tiền']);

export const getTimelineStepState = ({ stepIndex, activeStep, orderStatus, updatedAt, createdAt, formatDate }) => {
    const isCompleted = stepIndex < activeStep || (stepIndex === activeStep && TERMINAL_ORDER_STATUSES.has(orderStatus));
    const isCurrent = stepIndex === activeStep && !isCompleted;
    const isPending = stepIndex > activeStep;

    let timeLabel = '';
    if (!isPending) {
        timeLabel = stepIndex === 0 ? formatDate(createdAt) : formatDate(updatedAt);
    }

    return { isCompleted, isCurrent, isPending, timeLabel };
};
