import { useState } from 'react';

type Field = {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'select';
  required?: boolean;
};

export function FieldsDesigner({
  value,
  onChange,
}: {
  value: Field[];
  onChange: (fields: Field[]) => void;
}) {
  const [draft, setDraft] = useState<Field[]>(value || []);

  const add = () => {
    setDraft((prev) => [...prev, { key: '', label: '', type: 'text' }]);
  };
  const save = () => onChange(draft);

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={add}>+ Thêm field</button>
        <button onClick={save}>Lưu</button>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {draft.map((f, idx) => (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 160px 100px 80px', gap: 8 }}>
            <input placeholder="key (partyA.name)" value={f.key} onChange={(e) => {
              const v = [...draft]; v[idx] = { ...v[idx], key: e.target.value }; setDraft(v);
            }} />
            <input placeholder="label" value={f.label} onChange={(e) => {
              const v = [...draft]; v[idx] = { ...v[idx], label: e.target.value }; setDraft(v);
            }} />
            <select value={f.type} onChange={(e) => {
              const v = [...draft]; v[idx] = { ...v[idx], type: e.target.value as Field['type'] }; setDraft(v);
            }}>
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="currency">Currency</option>
              <option value="select">Select</option>
            </select>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={!!f.required} onChange={(e) => {
                const v = [...draft]; v[idx] = { ...v[idx], required: e.target.checked }; setDraft(v);
              }} />
              Required
            </label>
            <button onClick={() => setDraft((prev) => prev.filter((_, i) => i !== idx))}>Xóa</button>
          </div>
        ))}
      </div>
    </div>
  );
}

