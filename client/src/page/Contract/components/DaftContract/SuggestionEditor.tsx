import React from 'react';

interface SmartSuggestionsProps {
	suggestions: string[];
	onApply: (suggestion: string) => void;
}

const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({ suggestions, onApply }) => {
    if (!suggestions || suggestions.length === 0) return null;
    return (
        <div style={{ position: 'absolute', right: 16, top: 120, background: 'rgba(255,255,255,0.95)', border: '1px solid #eee', borderRadius: 8, padding: 12, width: 280, boxShadow: '0 4px 14px rgba(0,0,0,0.08)', zIndex: 20 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Gợi ý</div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {suggestions.map((s, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ flex: 1, fontSize: 13, color: '#333' }}>{s}</span>
                        <button onClick={() => onApply(s)} style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '1px solid #ddd', background: '#f6f6f6', cursor: 'pointer' }}>Áp dụng</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SmartSuggestions;
