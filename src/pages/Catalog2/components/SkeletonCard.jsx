import React from 'react';

const SkeletonCard = () => {
    return (
        <div className="catalog-skeleton-card">
            <div className="catalog-skeleton-img catalog-skeleton-pulse" />
            <div className="catalog-skeleton-body">
                <div className="catalog-skeleton-line short catalog-skeleton-pulse" />
                <div className="catalog-skeleton-line medium catalog-skeleton-pulse" />
                <div className="catalog-skeleton-line catalog-skeleton-pulse" />
                <div className="catalog-skeleton-btn catalog-skeleton-pulse" />
            </div>
        </div>
    );
};

export default SkeletonCard;
