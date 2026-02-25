import React from 'react';
import { MATERIALS } from '../mockCatalogData';

const MaterialFilter = ({ selectedMaterials, onToggle }) => {
    return (
        <div className="catalog-material-list">
            {MATERIALS.map(mat => {
                const isChecked = selectedMaterials.includes(mat.material_id);

                return (
                    <div
                        key={mat.material_id}
                        className="catalog-brand-item"
                        onClick={() => onToggle(mat.material_id)}
                    >
                        <div className={`catalog-checkbox ${isChecked ? 'checked' : ''}`}>
                            {isChecked && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                        <span className="catalog-brand-name">{mat.material_name}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default MaterialFilter;
