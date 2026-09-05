import React from 'react';
import { CheckCircle2, Heart, Info } from 'lucide-react';

export default function Toast({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast">
          {toast.type === 'cart' && <CheckCircle2 size={18} color="#4ADE80" />}
          {toast.type === 'wishlist' && <Heart size={18} fill="#F87171" color="#F87171" />}
          {toast.type === 'info' && <Info size={18} color="#60A5FA" />}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
