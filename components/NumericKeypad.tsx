
import React from 'react';

interface NumericKeypadProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
}

const NumericKeypad: React.FC<NumericKeypadProps> = ({ onKeyPress, onDelete }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0'];

  return (
    <div className="grid grid-cols-3 gap-1.5 w-full">
      {keys.map((key) => (
        <button
          key={key}
          onClick={() => onKeyPress(key)}
          className="h-11 flex items-center justify-center rounded-xl bg-white text-lg font-black text-black border border-black/5 active:bg-black/10 transition-colors shadow-sm"
        >
          {key}
        </button>
      ))}
      <button
        onClick={onDelete}
        className="h-11 flex items-center justify-center rounded-xl bg-white border border-black/5 active:bg-red-500/10 transition-colors shadow-sm"
      >
        <span className="material-symbols-outlined text-red-600 font-black text-xl">backspace</span>
      </button>
    </div>
  );
};

export default NumericKeypad;
