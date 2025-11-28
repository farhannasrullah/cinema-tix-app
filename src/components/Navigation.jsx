import React from 'react';

export const NavButton = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-2 text-sm font-medium transition-colors duration-200 ${active ? 'text-red-500' : 'text-neutral-400 hover:text-white'}`}>{icon} {label}</button>
);

export const MobileNavItem = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-red-500' : 'text-neutral-500'}`}>{icon}<span className="text-[10px] font-medium">{label}</span></button>
);