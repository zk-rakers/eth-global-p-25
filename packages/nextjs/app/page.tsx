"use client";

import React from "react";
import {
  FaCheckCircle,
  FaCode,
  FaDiscord,
  FaGithub,
  FaMedium,
  FaShieldAlt,
  FaStar,
  FaStarHalfAlt,
  FaTelegram,
  FaTwitter,
  FaUser,
  FaWallet,
} from "react-icons/fa";

// import ServiceForm from "../components/ServiceForm";

export default function CryptoMarketplace() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 bg-white z-50 shadow-sm py-4">
        <div className="container mx-auto px-4 max-w-7xl">
          <nav className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gray-900 text-white rounded-lg flex items-center justify-center">C</div>
              <span className="text-xl font-bold">CryptoMarket</span>
            </div>

            <ul className="hidden md:flex gap-8">
              <li>
                <a
                  href="#"
                  className="font-medium hover:text-gray-700 transition relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gray-900 hover:after:w-full after:transition-all"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="font-medium hover:text-gray-700 transition relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gray-900 hover:after:w-full after:transition-all"
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="font-medium hover:text-gray-700 transition relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gray-900 hover:after:w-full after:transition-all"
                >
                  Providers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="font-medium hover:text-gray-700 transition relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gray-900 hover:after:w-full after:transition-all"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="font-medium hover:text-gray-700 transition relative after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-gray-900 hover:after:w-full after:transition-all"
                >
                  About
                </a>
              </li>
            </ul>

            <div className="flex gap-3">
              <button className="px-4 py-2 rounded-lg border border-gray-900 font-semibold hover:bg-gray-50 transition hover:-translate-y-0.5 hover:shadow-sm">
                Log In
              </button>
              <button className="px-4 py-2 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition hover:-translate-y-0.5 hover:shadow-md">
                Sign Up
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Find Trusted Crypto Services in Minutes
              </h1>
              <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto md:mx-0">
                Connect with blockchain experts, developers, and service providers for all your cryptocurrency and
                blockchain needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mb-10">
                <button className="px-6 py-3 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition hover:-translate-y-0.5 hover:shadow-md">
                  Find a Provider
                </button>
                <button className="px-6 py-3 rounded-lg border border-gray-900 font-semibold hover:bg-gray-50 transition hover:-translate-y-0.5 hover:shadow-sm">
                  Become a Provider
                </button>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-8">
                <div>
                  <h3 className="text-3xl font-bold">5,000+</h3>
                  <p className="text-gray-600">Service Providers</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold">120+</h3>
                  <p className="text-gray-600">Blockchain Services</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold">98%</h3>
                  <p className="text-gray-600">Client Satisfaction</p>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-xl">
                <img src="/Thumb.jpg" alt="Thumbnail Picture" className="w-full h-auto object-cover rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our most in-demand blockchain and cryptocurrency services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service Card 1 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg transition-transform hover:-translate-y-2">
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                <FaCode className="text-5xl text-gray-800" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">Smart Contract Development</h3>
                <p className="text-gray-600 mb-4">
                  Create secure and efficient smart contracts for your blockchain projects by top developers.
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex items-center text-yellow-400">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStarHalfAlt />
                    <span className="ml-2 text-gray-900">4.7</span>
                  </div>
                  <div className="font-bold">0.5 ETH</div>
                </div>
              </div>
            </div>

            {/* Service Card 2 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg transition-transform hover:-translate-y-2">
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                <FaShieldAlt className="text-5xl text-gray-800" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">Blockchain Security Audit</h3>
                <p className="text-gray-600 mb-4">
                  Comprehensive security audits for your blockchain projects to identify vulnerabilities.
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex items-center text-yellow-400">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <span className="ml-2 text-gray-900">5.0</span>
                  </div>
                  <div className="font-bold">1.2 ETH</div>
                </div>
              </div>
            </div>

            {/* Service Card 3 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg transition-transform hover:-translate-y-2">
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                <FaWallet className="text-5xl text-gray-800" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">Crypto Wallet Development</h3>
                <p className="text-gray-600 mb-4">
                  Custom cryptocurrency wallet development for all platforms with top security standards.
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex items-center text-yellow-400">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar className="text-gray-300" />
                    <span className="ml-2 text-gray-900">4.2</span>
                  </div>
                  <div className="font-bold">2.0 ETH</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Providers Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Top Providers</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Meet our most trusted and experienced service providers</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Provider Card 1 */}
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg transition-transform hover:-translate-y-1">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-6">
                <FaUser className="text-3xl text-gray-800" />
              </div>
              <h3 className="text-xl font-bold mb-1">Alex Johnson</h3>
              <p className="text-gray-600 mb-4">Blockchain Developer</p>
              <div className="flex flex-wrap justify-center gap-2 mb-5">
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Solidity</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Ethereum</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">DeFi</span>
              </div>
              <p className="text-green-500 flex items-center justify-center">
                <FaCheckCircle className="mr-2" />
                320+ Projects
              </p>
            </div>

            {/* Provider Card 2 */}
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg transition-transform hover:-translate-y-1">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-6">
                <FaUser className="text-3xl text-gray-800" />
              </div>
              <h3 className="text-xl font-bold mb-1">Sarah Chen</h3>
              <p className="text-gray-600 mb-4">Security Expert</p>
              <div className="flex flex-wrap justify-center gap-2 mb-5">
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Security</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Auditing</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Pen Testing</span>
              </div>
              <p className="text-green-500 flex items-center justify-center">
                <FaCheckCircle className="mr-2" />
                180+ Projects
              </p>
            </div>

            {/* Provider Card 3 */}
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg transition-transform hover:-translate-y-1">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-6">
                <FaUser className="text-3xl text-gray-800" />
              </div>
              <h3 className="text-xl font-bold mb-1">Michael Rodriguez</h3>
              <p className="text-gray-600 mb-4">NFT Specialist</p>
              <div className="flex flex-wrap justify-center gap-2 mb-5">
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">NFTs</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">ERC-721</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Marketplaces</span>
              </div>
              <p className="text-green-500 flex items-center justify-center">
                <FaCheckCircle className="mr-2" />
                450+ Projects
              </p>
            </div>

            {/* Provider Card 4 */}
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg transition-transform hover:-translate-y-1">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-6">
                <FaUser className="text-3xl text-gray-800" />
              </div>
              <h3 className="text-xl font-bold mb-1">Emma Williams</h3>
              <p className="text-gray-600 mb-4">Tokenomics Expert</p>
              <div className="flex flex-wrap justify-center gap-2 mb-5">
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Token Design</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Economics</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Whitepapers</span>
              </div>
              <p className="text-green-500 flex items-center justify-center">
                <FaCheckCircle className="mr-2" />
                210+ Projects
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-lg font-bold mb-4">CryptoMarket</h3>
              <p className="text-gray-400">The leading marketplace for blockchain and cryptocurrency services.</p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    Services
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    Providers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    About
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Services</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    Smart Contracts
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    DApp Development
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    Security Audits
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    Token Creation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    NFT Development
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Connect With Us</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition flex items-center gap-2">
                    <FaTwitter /> Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition flex items-center gap-2">
                    <FaTelegram /> Telegram
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition flex items-center gap-2">
                    <FaDiscord /> Discord
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition flex items-center gap-2">
                    <FaGithub /> GitHub
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition flex items-center gap-2">
                    <FaMedium /> Blog
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 text-center text-gray-500">
            <p>&copy; 2023 CryptoMarket. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
