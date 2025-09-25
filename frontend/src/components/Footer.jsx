import React from "react";
import { Heart, Instagram, Twitter, Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-zinc-900 text-zinc-300 py-12 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3
              className="text-xl font-bold text-white"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Vistagram
            </h3>
            <p className="text-zinc-400 leading-relaxed">
              Capture and share your favorite moments. Connect with others
              through visual storytelling.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Quick Links</h4>
            <nav className="space-y-2">
              <a
                href="#timeline"
                className="block hover:text-rose-400 transition-colors"
              >
                Timeline
              </a>
              <a
                href="#about"
                className="block hover:text-rose-400 transition-colors"
              >
                About
              </a>
              <a
                href="#privacy"
                className="block hover:text-rose-400 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#terms"
                className="block hover:text-rose-400 transition-colors"
              >
                Terms of Service
              </a>
            </nav>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Connect</h4>
            <div className="flex space-x-4">
              <a
                href="#"
                className="p-2 bg-zinc-800 rounded-full hover:bg-rose-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-zinc-800 rounded-full hover:bg-teal-500 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-zinc-800 rounded-full hover:bg-fuchsia-400 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <p className="text-zinc-400 text-sm">
            © 2025 Vistagram. All rights reserved.
          </p>
          <p className="text-zinc-400 text-sm flex items-center space-x-1">
            <span>Built with</span>
            <Heart className="w-4 h-4 text-rose-400 fill-current" />
            <span>by</span>
            <a
              href="https://meku.dev"
              target="_blank"
              rel="nofollow"
              className="text-rose-400 hover:text-rose-300 transition-colors"
            >
              Meku.dev
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
