import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function SearchableSelect({ options, value, onChange, placeholder = "Select...", disabled = false }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(query.toLowerCase()));

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: 'var(--background)', border: '1px solid var(--border)', 
          borderRadius: '12px', padding: '14px 16px', cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.7 : 1, height: '48px'
        }}
      >
        <span style={{ color: value ? 'var(--text)' : 'var(--text-muted)', fontSize: '15px' }}>
          {value || placeholder}
        </span>
        <ChevronDown size={18} color="var(--text-muted)" />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
          backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '16px', zIndex: 100, boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          maxHeight: '300px', display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
          <div style={{ padding: '12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input 
              autoFocus
              type="text" 
              placeholder="Search options..." 
              value={query} 
              onChange={e => setQuery(e.target.value)}
              style={{ flex: 1, border: 'none', outline: 'none', background: 'none', fontSize: '14px', color: 'var(--text)' }}
            />
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            <div 
              onClick={() => { onChange(''); setIsOpen(false); setQuery(''); }}
              style={{ padding: '14px 16px', borderBottom: '1px solid var(--background)', cursor: 'pointer', fontStyle: 'italic', color: 'var(--text-muted)' }}
            >
              Clear Selection
            </div>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>No matches found</div>
            ) : (
              filteredOptions.map(opt => (
                <div 
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setQuery('');
                  }}
                  style={{
                    padding: '14px 16px', borderBottom: '1px solid var(--background)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer', backgroundColor: value === opt ? 'rgba(0,0,0,0.03)' : 'transparent'
                  }}
                >
                  <span style={{ fontSize: '15px', fontWeight: value === opt ? 600 : 400 }}>{opt}</span>
                  {value === opt && <Check size={18} color="var(--text)" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
