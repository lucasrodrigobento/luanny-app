import React, { useState } from 'react';
import { KeyIcon } from './icons/KeyIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  isLoading: boolean;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password && !isLoading) {
      onSubmit(password);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-sm border border-gray-700 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-xl font-bold text-sky-300 flex items-center gap-2">
              <KeyIcon className="w-6 h-6" />
              Certificate Password
            </h3>
            <p className="text-sm text-gray-400 mt-1">Please enter the password for your A1 certificate.</p>
          </div>
          <div className="p-6">
            <label htmlFor="certificate-password" className="sr-only">Password</label>
            <input
              id="certificate-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="p-4 flex justify-end gap-3 bg-gray-900/50 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !password}
              className="px-4 py-2 w-28 flex justify-center bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? <SpinnerIcon /> : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add keyframes for animation
const style = document.createElement('style');
style.innerHTML = `
@keyframes fade-in {
    0% { opacity: 0; }
    100% { opacity: 1; }
}
@keyframes fade-in-up {
    0% {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
.animate-fade-in {
    animation: fade-in 0.3s ease-out forwards;
}
.animate-fade-in-up {
    animation: fade-in-up 0.3s ease-out forwards;
}
`;
document.head.appendChild(style);
