import React from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  const baseClasses = "fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white flex items-center z-50 animate-fade-in-up";
  const typeClasses = {
    success: "bg-green-600",
    error: "bg-red-600",
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <span className="flex-grow">{message}</span>
      <button onClick={onClose} className="ml-4 text-xl font-bold leading-none">&times;</button>
    </div>
  );
};

// Add keyframes for animation in a style tag if not using a CSS file, or add to tailwind config
// This is a workaround since we can't add a global CSS file.
const style = document.createElement('style');
style.innerHTML = `
@keyframes fade-in-up {
    0% {
        opacity: 0;
        transform: translateY(20px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}
.animate-fade-in-up {
    animation: fade-in-up 0.5s ease-out forwards;
}
`;
document.head.appendChild(style);
