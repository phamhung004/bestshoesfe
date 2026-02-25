import React, { useState } from 'react';
import { CATEGORIES, countByCategory } from '../mockCatalogData';

const CategoryTree = ({ selectedCategory, onSelect }) => {
    const [expandedIds, setExpandedIds] = useState([]);

    // Find root categories (parent_id === null)
    const rootCategories = CATEGORIES.filter(c => c.parent_id === null && c.status === 1);

    const toggleExpand = (catId) => {
        setExpandedIds(prev =>
            prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
        );
    };

    const getChildren = (parentId) => {
        return CATEGORIES.filter(c => c.parent_id === parentId && c.status === 1);
    };

    const renderCategory = (cat, level = 0) => {
        const children = getChildren(cat.category_id);
        const hasChildren = children.length > 0;
        const isExpanded = expandedIds.includes(cat.category_id);
        const isActive = selectedCategory === cat.category_id;
        const count = countByCategory(cat.category_id);

        return (
            <li key={cat.category_id} className="catalog-cat-item">
                <button
                    className={`catalog-cat-btn ${isActive ? 'active' : ''}`}
                    onClick={() => {
                        onSelect(cat.category_id);
                        if (hasChildren) toggleExpand(cat.category_id);
                    }}
                    style={{ paddingLeft: `${8 + level * 16}px` }}
                >
                    {hasChildren && (
                        <span className={`catalog-cat-arrow ${isExpanded ? 'expanded' : ''}`}>▸</span>
                    )}
                    <span>{cat.name}</span>
                    <span className="catalog-cat-count">{count}</span>
                </button>
                {hasChildren && isExpanded && (
                    <ul className="catalog-cat-children">
                        {children.map(child => renderCategory(child, level + 1))}
                    </ul>
                )}
            </li>
        );
    };

    return (
        <ul className="catalog-cat-tree">
            {rootCategories.map(cat => renderCategory(cat))}
        </ul>
    );
};

export default CategoryTree;
