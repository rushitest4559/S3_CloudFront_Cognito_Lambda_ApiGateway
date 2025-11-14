import { useState } from "react";

export default function MenuButton({ onClick, isOpen }) {
  return (
    <button
      className="p-2 mr-4 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600 md:hidden"
      onClick={onClick}
      aria-label="Toggle menu"
      aria-expanded={isOpen ? "true" : "false"}
    >
      <div className="w-6 h-0.5 bg-black mb-1 transition-transform duration-300" style={{ transform: isOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }}></div>
      <div className="w-6 h-0.5 bg-black mb-1 transition-opacity duration-300" style={{ opacity: isOpen ? 0 : 1 }}></div>
      <div className="w-6 h-0.5 bg-black transition-transform duration-300" style={{ transform: isOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }}></div>
    </button>
  );
}
