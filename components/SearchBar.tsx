import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChangeText, placeholder = "Search inventory..." }: SearchBarProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: 'var(--background)',
      border: '1px solid var(--border)',
      borderRadius: '24px',
      padding: '0 16px',
      height: '48px',
      flex: 1
    }}>
      <Search size={20} color="var(--text-muted)" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1,
          background: 'none',
          border: 'none',
          outline: 'none',
          color: 'var(--text)',
          fontSize: '15px',
          marginLeft: '12px',
          height: '100%'
        }}
      />
      {value.length > 0 && (
        <button onClick={() => onChangeText('')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={18} color="var(--text-muted)" />
        </button>
      )}
    </div>
  );
}
