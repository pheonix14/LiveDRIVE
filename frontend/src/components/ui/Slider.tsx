import React from 'react';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min = 0,
  max = 100,
  step = 0.1,
  onChange,
  className = '',
  ...props
}) => {
  const percentage = max > min ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : 0;

  return (
    <div className={`relative flex items-center w-full group cursor-pointer ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer outline-none focus:outline-none 
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(242,193,46,0.8)]
          group-hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
        style={{
          background: `linear-gradient(to right, #F2C12E ${percentage}%, rgba(255,255,255,0.1) ${percentage}%)`,
        }}
        {...props}
      />
    </div>
  );
};
