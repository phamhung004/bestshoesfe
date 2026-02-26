import React, { useState } from 'react';

/**
 * CategoryTree — accepts `categories` prop from real API (CategoryDTO[]).
 * Each category: { categoryId, name, parentId, productCount }
 */
const CategoryTree = ({ selectedCategory, onSelect, categories = [] }) => {
    const [expandedIds, setExpandedIds] = useState([]);

    const toggleExpand = (catId) => {
        setExpandedIds(prev =>
            prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
        );
    };

    const getChildren = (parentId) =>
        categories.filter(c => String(c.parentId) === String(parentId));

    const rootCategories = categories.filter(c => c.parentId == null);

    const renderCategory = (cat, level = 0) => {
        const children = getChildren(cat.categoryId);
        const hasChildren = children.length > 0;
        const isExpanded = expandedIds.includes(cat.categoryId);
        const isActive = selectedCategory === cat.categoryId;

        return (
            <li key={cat.categoryId} className="catalog-cat-item">
                <button
                    className={`catalog-cat-btn ${isActive ? 'active' : ''}`}
                    onClick={() => {
                        onSelect(cat.categoryId);
                        if (hasChildren) toggleExpand(cat.categoryId);
                    }}
                    style={{ paddingLeft: `${8 + level * 16}px` }}
                >
                    {hasChildren && (
                        <span className={`catalog-cat-arrow ${isExpanded ? 'expanded' : ''}`}>▸</span>
                    )}
                    <span>{cat.name}</span>
                    {cat.productCount != null && (
                        <span className="catalog-cat-count">{cat.productCount}</span>
                    )}
                </button>
                {hasChildren && isExpanded && (
                    <ul className="catalog-cat-children">
                        {children.map(child => renderCategory(child, level + 1))}
                    </ul>
                )}
            </li>
        );
    };

    if (categories.length === 0) return null;

    return (
        <ul className="catalog-cat-tree">
            {rootCategories.map(cat => renderCategory(cat))}
        </ul>
    );
};

export default CategoryTree;
