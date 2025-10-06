"use client";
import React, { useState } from "react";

const pages = [
  { key: "charusat", label: "Charusat"},
  { key: "depstar", label: "Depstar" },
  { key: "cse", label: "CSE" },
  { key: "fswd", label: "FSWD" },
];

const App = () => {
  const [activePage, setActivePage] = useState("charusat");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const pageContents = {
    charusat: {
      heading: "Charotar University of Science and Technology",
      subtitle: "Excellence in Education & Research",
      content: (
        <div className="grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div 
              onClick={() => setActivePage("depstar")}
              className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:border-blue-300 transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">D</div>
                <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">DEPSTAR</h3>
              </div>
              <p className="text-gray-600 text-sm">Department of Computer Science & IT</p>
            </div>
            
            {["RPCP", "MTIN", "PDPAIS", "CSPIT", "ARIP", "IIIM"].map((dept, idx) => (
              <div key={dept} className="group p-6 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-100 hover:border-gray-300 transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center text-white font-bold">{dept[0]}</div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-gray-600 transition-colors">{dept}</h3>
                </div>
                <p className="text-gray-600 text-sm">Department Details</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    depstar: {
      heading: "DEPSTAR",
      subtitle: "Department of Computer Science & Information Technology",
      content: (
        <div className="grid md:grid-cols-2 gap-6">
          <div 
            onClick={() => setActivePage("cse")}
            className="group relative p-8 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-2xl text-white cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Computer Science and Engineering</h3>
            </div>
          </div>
          
          <div className="group relative p-8 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-2xl text-white cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Computer Engineering (CE)</h3>
            </div>
          </div>
          
          <div className="group relative p-8 bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-2xl text-white cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl overflow-hidden md:col-span-2">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Information Technology (IT)</h3>
            </div>
          </div>
        </div>
      ),
    },
    cse: {
      heading: "Computer Science and Engineering",
      content: (
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: "FSWD", color: "from-blue-500 to-purple-600"},
            { name: "MAD", color: "from-green-500 to-teal-600" },
            { name: "CP", color: "from-yellow-500 to-orange-600" },
            { name: "TOC", color: "from-red-500 to-pink-600"},
            { name: "SE", color: "from-indigo-500 to-blue-600" },
            { name: "ML", color: "from-purple-500 to-indigo-600"},
            { name: "RAM", color: "from-gray-500 to-slate-600" },
            { name: "HS", color: "from-teal-500 to-cyan-600" },
            { name: "SGP", color: "from-emerald-500 to-green-600" },
          ].map((sub) => (
            <div
              key={sub.name}
              onClick={sub.name === "FSWD" ? () => setActivePage("fswd") : undefined}
              className={`group p-6 bg-gradient-to-br ${sub.color} rounded-xl text-white cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-xl relative overflow-hidden ${sub.name === "FSWD" ? "ring-2 ring-white/50" : ""}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="text-2xl mb-3">{sub.emoji}</div>
                <h3 className="font-bold text-lg mb-1">{sub.name}</h3>
                <div className="w-full bg-white/20 rounded-full h-1">
                  <div className="bg-white h-1 rounded-full" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    fswd: {
      heading: "Full Stack Web Development",
      content: (
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 rounded-2xl border border-blue-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              Course Overview
            </h3>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Welcome to Full Stack Web Development (FSWD). This comprehensive course covers both frontend and backend technologies, preparing you for modern web development challenges.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
              <h4 className="font-bold text-green-800 mb-4 flex items-center">
                Frontend Technologies
              </h4>
              <div className="space-y-3">
                {["HTML", "CSS & Tailwind", "JavaScript ", "React.js"].map((tech) => (
                  <div key={tech} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-700">{tech}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-100">
              <h4 className="font-bold text-purple-800 mb-4 flex items-center">
                Backend Technologies
              </h4>
              <div className="space-y-3">
                {["Node.js", "Express.js", "MongoDB / SQL", "RESTful APIs"].map((tech) => (
                  <div key={tech} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-purple-700">{tech}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ),
    },
  };

  const content = pageContents[activePage] || {
    heading: "Page Not Found",
    subtitle: "Content not available",
    content: <p className="text-gray-600">The content you are looking for does not exist.</p>,
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <div
        className={`bg-gradient-to-b from-gray-900 via-slate-800 to-gray-900 backdrop-blur-xl text-white shadow-2xl transition-all duration-500 ease-in-out relative ${
          isMenuOpen ? "w-72" : "w-20"
        }`}
      >
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
        
        <div className="flex flex-col h-full relative z-10">
          <div className="p-6">
            <button
              onClick={toggleMenu}
              className="group p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/10 hover:scale-105"
              title="Toggle menu"
            >
              <svg
                className={`h-6 w-6 fill-current transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMenuOpen ? (
                  <path d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z" />
                ) : (
                  <path d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z" />
                )}
              </svg>
            </button>
          </div>

          <div className={`transition-all duration-500 ${isMenuOpen ? "opacity-100" : "opacity-0"}`}>
            {isMenuOpen && (
              <div className="px-4 space-y-3">
                {pages.map((page, index) => (
                  <button
                    key={page.key}
                    onClick={() => setActivePage(page.key)}
                    className={`group w-full text-left p-4 rounded-xl transition-all duration-300 hover:scale-105 transform relative overflow-hidden ${
                      activePage === page.key
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
                        : "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20"
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">{page.icon}</span>
                      <span className="font-medium text-sm">{page.label}</span>
                    </div>
                    {activePage === page.key && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow overflow-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 relative">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
                <div className="relative z-10">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">
                    {content.heading}
                  </h1>
                  <p className="text-gray-600 text-lg">{content.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
              <div className="relative z-10">
                {content.content}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;