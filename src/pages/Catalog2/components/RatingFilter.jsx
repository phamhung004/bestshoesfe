import React from 'react';

const RatingFilter = ({ selectedRating, onSelect }) => {
    const ratings = [5, 4, 3];

    const renderStars = (count) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={`catalog-star ${i < count ? 'filled' : 'empty'}`}>
                {i < count ? '★' : '☆'}
            </span>
        ));
    };

    return (
        <div className="catalog-rating-list">
            {ratings.map(rating => {
                const isSelected = selectedRating === rating;

                return (
                    <div
                        key={rating}
                        className={`catalog-rating-row ${isSelected ? 'selected' : ''}`}
                        onClick={() => onSelect(isSelected ? null : rating)}
                    >
                        <div className="catalog-rating-radio">
                            <div className="catalog-rating-radio-inner" />
                        </div>
                        <div className="catalog-stars">
                            {renderStars(rating)}
                        </div>
                        <span className="catalog-rating-label">trở lên</span>
                    </div>
                );
            })}
        </div>
    );
};

export default RatingFilter;
