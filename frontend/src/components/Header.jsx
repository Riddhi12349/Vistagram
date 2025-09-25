import React, { useState } from "react";
import { Camera, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Header = ({ onCaptureClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-zinc-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-600 to-fuchsia-400 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <h1
              className="text-xl font-bold text-zinc-800"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Vistagram
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {/* <a
              href="#timeline"
              className="text-zinc-600 hover:text-rose-600 transition-colors font-medium"
            >
              Timeline
            </a> */}
            <motion.button
              onClick={onCaptureClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-rose-600 to-fuchsia-400 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
            >
              <Camera className="w-4 h-4" />
              <span>Capture</span>
            </motion.button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-zinc-400 transition-colors"
            aria-label="mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-zinc-200 py-4 space-y-4"
            >
              {/* <a
                href="#timeline"
                className="block text-zinc-600 hover:text-rose-600 transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Timeline
              </a> */}
              <motion.button
                onClick={() => {
                  onCaptureClick();
                  setIsMobileMenuOpen(false);
                }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-rose-600 to-fuchsia-400 text-white px-6 py-3 rounded-full font-medium flex items-center justify-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>Capture</span>
              </motion.button>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
