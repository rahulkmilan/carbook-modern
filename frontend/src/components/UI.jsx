export function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl px-5 py-2.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary: 'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500 shadow-md hover:shadow-lg hover:-translate-y-0.5',
    secondary: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-300',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function InputField({ label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function SelectField({ label, error, children, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <select
        className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${error ? 'border-red-400' : 'border-gray-200'}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function StatsCard({ title, value, icon, color = 'sky' }) {
  const colors = {
    sky: 'border-emerald-500 bg-emerald-50 text-emerald-700',
    indigo: 'border-emerald-500 bg-emerald-50 text-indigo-700',
    yellow: 'border-yellow-500 bg-yellow-50 text-yellow-700',
    green: 'border-green-500 bg-green-50 text-green-700',
    red: 'border-red-500 bg-red-50 text-red-700',
  };
  return (
    <div className={`bg-white rounded-2xl p-6 border-l-4 shadow-sm hover:shadow-md transition-all ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {icon && <div className="opacity-60 text-3xl">{icon}</div>}
      </div>
    </div>
  );
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} p-6 relative max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Badge({ children, color = 'gray' }) {
  const colors = {
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
    sky: 'bg-emerald-100 text-emerald-700',
    orange: 'bg-orange-100 text-orange-700',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[color]}`}>
      {children}
    </span>
  );
}
