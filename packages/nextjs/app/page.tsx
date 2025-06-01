"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaChevronLeft,
  FaChevronRight,
  FaEthereum,
  FaEye,
  FaHandshake,
  FaLock,
  FaPlusCircle,
  FaUserSecret,
  FaWallet,
} from "react-icons/fa";

interface ServiceData {
  location: string;
  description: string;
  timestamp: string;
}

interface Service extends ServiceData {
  id: number;
  title: string;
  price: string;
}

interface Request {
  id: number;
  title: string;
  price: string;
}

export default function CryptoMarketplace() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [currentRequestIndex, setCurrentRequestIndex] = useState(0);
  const [isServicesHovering, setIsServicesHovering] = useState(false);
  const [isRequestsHovering, setIsRequestsHovering] = useState(false);
  const itemsPerPage = 5;

  // Sample data
  const services: Service[] = [
    {
      id: 1,
      title: "Anonymous Coding Tutor",
      price: "0.05 ETH",
      location: "Remote",
      description: "Expert in Solidity & React. Learn to build dApps without revealing your identity.",
      timestamp: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Ghost Writer",
      price: "0.12 ETH",
      location: "Remote",
      description: "Technical content creation for blockchain projects. Complete anonymity guaranteed.",
      timestamp: new Date().toISOString(),
    },
    {
      id: 3,
      title: "Encrypted Data Analysis",
      price: "0.08 ETH",
      location: "Remote",
      description: "Secure data processing with zero-knowledge proofs. Your data never leaves your device.",
      timestamp: new Date().toISOString(),
    },
    {
      id: 4,
      title: "Private Investigator",
      price: "0.25 ETH",
      location: "Remote",
      description: "Discreet information gathering with blockchain-based reporting.",
      timestamp: new Date().toISOString(),
    },
    {
      id: 5,
      title: "Security Auditor",
      price: "0.30 ETH",
      location: "Remote",
      description: "Smart contract and system security review from anonymous experts.",
      timestamp: new Date().toISOString(),
    },
    {
      id: 6,
      title: "Cryptographic Consultant",
      price: "0.18 ETH",
      location: "Remote",
      description: "Privacy-focused cryptographic solutions for your projects.",
      timestamp: new Date().toISOString(),
    },
  ];

  const requests: Request[] = [
    { id: 101, title: "Walk with a dog in Paris", price: "0.03 ETH" },
    { id: 102, title: "Anonymous UI Designer Needed", price: "0.15 ETH" },
    { id: 103, title: "Off-grid Security Audit", price: "0.25 ETH" },
    { id: 104, title: "Private French Lessons", price: "0.07 ETH" },
    { id: 105, title: "Secure Document Delivery", price: "0.10 ETH" },
    { id: 106, title: "Crypto Wallet Recovery Help", price: "0.20 ETH" },
    { id: 107, title: "Anonymous Market Research", price: "0.12 ETH" },
    { id: 108, title: "Tor Network Setup Assistance", price: "0.09 ETH" },
  ];

  const getVisibleServices = () => {
    const items = [];
    for (let i = 0; i < itemsPerPage; i++) {
      const index = (currentServiceIndex + i) % services.length;
      items.push(services[index]);
    }
    return items;
  };

  const getVisibleRequests = () => {
    const items = [];
    for (let i = 0; i < itemsPerPage; i++) {
      const index = (currentRequestIndex + i) % requests.length;
      items.push(requests[index]);
    }
    return items;
  };

  const nextServices = () => {
    setCurrentServiceIndex(prev => (prev + 1) % services.length);
  };

  const prevServices = () => {
    setCurrentServiceIndex(prev => (prev - 1 + services.length) % services.length);
  };

  const nextRequests = () => {
    setCurrentRequestIndex(prev => (prev + 1) % requests.length);
  };

  const prevRequests = () => {
    setCurrentRequestIndex(prev => (prev - 1 + requests.length) % requests.length);
  };

  // Auto-scroll effect with independent pause on hover
  useEffect(() => {
    let serviceInterval: NodeJS.Timeout;
    let requestInterval: NodeJS.Timeout;

    if (!isServicesHovering) {
      serviceInterval = setInterval(nextServices, 6555);
    }
    if (!isRequestsHovering) {
      requestInterval = setInterval(nextRequests, 6555);
    }

    return () => {
      if (serviceInterval) clearInterval(serviceInterval);
      if (requestInterval) clearInterval(requestInterval);
    };
  }, [isServicesHovering, isRequestsHovering, nextServices, nextRequests]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Increased from 0.1 to 0.2
        delayChildren: 0.3, // Added delay before starting animations
      },
    },
  };

  const cardVariants = {
    initial: {
      scale: 1,
      y: 0,
      rotateX: 0,
      boxShadow: "0 0 0 rgba(0,0,0,0)",
    },
    hover: {
      scale: 1.03,
      y: -5,
      rotateX: 2,
      boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 17,
        mass: 1,
      },
    },
    tap: {
      scale: 0.98,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 17,
        mass: 1,
      },
    },
  };

  const buttonVariants = {
    initial: {
      scale: 1,
      backgroundColor: "#000000",
    },
    hover: {
      scale: 1.05,
      backgroundColor: "#1a1a1a",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
    tap: {
      scale: 0.95,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
  };

  const contentVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <header className="navbar bg-base-200 border-b border-base-300">
        <div className="navbar-start">
          <div className="flex items-center gap-2">
            <FaUserSecret className="text-2xl text-accent" />
            <span className="text-xl font-bold text-accent">A-proof</span>
          </div>
        </div>

        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal gap-2">
            <li>
              <button className="btn btn-ghost">Home</button>
            </li>
            <li>
              <button className="btn btn-ghost">Personal Space</button>
            </li>
            <li>
              <button className="btn btn-ghost">FAQ</button>
            </li>
          </ul>
        </div>

        <div className="navbar-end gap-2">
          <Link href="/post" className="btn btn-accent">
            <FaPlusCircle className="mr-2" />
            Post
          </Link>
          <button
            className={`btn ${walletConnected ? "btn-success" : "btn-primary"}`}
            onClick={() => setWalletConnected(!walletConnected)}
          >
            <FaWallet className="mr-2" />
            {walletConnected ? "Wallet Connected" : "Connect Wallet"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        {/* Hero Section */}
        <div className="text-center py-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-accent">Anonymous Services Marketplace</h1>
          <p className="text-base-content/60 text-lg max-w-2xl mx-auto">
            Marketplace where privacy is a first class citizen. Revealing yourself is an opt-in powered by privacy
            preserving account-abstraction.
          </p>
        </div>

        {/* Listings Container */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Services Section */}
          <div
            className="card bg-base-200"
            onMouseEnter={() => setIsServicesHovering(true)}
            onMouseLeave={() => setIsServicesHovering(false)}
          >
            <div className="card-body">
              <div className="flex justify-between items-center mb-6">
                <h2 className="card-title text-2xl">
                  <FaLock className="text-accent" />
                  Available Services
                </h2>
                <div className="flex gap-2">
                  <button onClick={prevServices} className="btn btn-circle btn-ghost btn-sm">
                    <FaChevronLeft />
                  </button>
                  <button onClick={nextServices} className="btn btn-circle btn-ghost btn-sm">
                    <FaChevronRight />
                  </button>
                </div>
              </div>
              <div className="relative overflow-hidden">
                <motion.div
                  className="grid gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  key={currentServiceIndex}
                >
                  {getVisibleServices().map(service => (
                    <motion.div
                      key={`${service.id}-${currentServiceIndex}`}
                      className="card bg-base-300"
                      layout
                      initial="initial"
                      animate="animate"
                      whileHover="hover"
                      whileTap="tap"
                      variants={cardVariants}
                    >
                      <motion.div className="card-body" variants={contentVariants}>
                        <motion.div className="flex justify-between items-start" variants={itemVariants}>
                          <h3 className="card-title">{service.title}</h3>
                          <motion.div
                            className="badge badge-primary gap-2"
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            <FaEthereum />
                            {service.price}
                          </motion.div>
                        </motion.div>
                        <motion.p className="text-base-content/60" variants={itemVariants}>
                          {service.description}
                        </motion.p>
                        <motion.div className="card-actions justify-end mt-4" variants={itemVariants}>
                          <motion.button
                            className="btn btn-primary"
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            <FaEye className="mr-2" />
                            View Anonymously
                          </motion.button>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Requests Section */}
          <div
            className="card bg-base-200"
            onMouseEnter={() => setIsRequestsHovering(true)}
            onMouseLeave={() => setIsRequestsHovering(false)}
          >
            <div className="card-body">
              <div className="flex justify-between items-center mb-6">
                <h2 className="card-title text-2xl">
                  <FaHandshake className="text-accent" />
                  Service Requests
                </h2>
                <div className="flex gap-2">
                  <button onClick={prevRequests} className="btn btn-circle btn-ghost btn-sm">
                    <FaChevronLeft />
                  </button>
                  <button onClick={nextRequests} className="btn btn-circle btn-ghost btn-sm">
                    <FaChevronRight />
                  </button>
                </div>
              </div>
              <div className="relative overflow-hidden">
                <motion.div
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  key={currentRequestIndex}
                >
                  {getVisibleRequests().map(request => (
                    <motion.div
                      key={`${request.id}-${currentRequestIndex}`}
                      className="card bg-base-300"
                      layout
                      initial="initial"
                      animate="animate"
                      whileHover="hover"
                      whileTap="tap"
                      variants={cardVariants}
                    >
                      <motion.div className="card-body" variants={contentVariants}>
                        <motion.div className="flex justify-between items-center" variants={itemVariants}>
                          <div>
                            <motion.h3 className="font-bold" variants={itemVariants}>
                              {request.title}
                            </motion.h3>
                            <motion.div
                              className="text-accent font-semibold flex items-center gap-2"
                              variants={itemVariants}
                            >
                              <FaEthereum />
                              {request.price}
                            </motion.div>
                          </div>
                          <motion.button
                            className="btn btn-outline btn-accent"
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            <FaPlusCircle className="mr-2" />
                            Fulfill Request
                          </motion.button>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer footer-center p-10 bg-base-200 text-base-content rounded">
        <div>
          <p className="text-base-content/60">
            AnonServe - The Anonymous Services Marketplace. No tracking. No personal data. Just services.
          </p>
          <div className="flex gap-4 mt-4">
            <a className="link link-accent">Privacy Policy</a>
            <a className="link link-accent">Terms of Service</a>
            <a className="link link-accent">How It Works</a>
            <a className="link link-accent">Contact</a>
          </div>
          <p className="text-base-content/40 mt-4">© 2024 AnonServe. All transactions are anonymous and encrypted.</p>
        </div>
      </footer>
    </div>
  );
}
