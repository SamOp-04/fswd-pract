'use client'
import React, { useState, useEffect } from 'react';
import { User, Clock, Calendar, CheckCircle, Users, LogIn, UserPlus, Eye, EyeOff, Mail, Phone, Lock, MapPin, ListTodo, Moon, Sun, X, Plus, Trash2, Building2, Timer, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = 'http://localhost:5000/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Attendance {
  _id: string;
  startTime: string;
  endTime?: string;
  startLocation: string;
  endLocation?: string;
  tasks?: string[];
  verified: boolean;
  userId?: User;
  date?: string;
}

const AttendanceApp = () => {
  // --- State Management ---
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [token, setToken] = useState<string>("");
  const [darkMode, setDarkMode] = useState(false);
  // --- Auth States ---
  const [authData, setAuthData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    otp: '',
    showPassword: false
  });
  // --- Attendance States ---
  const [location, setLocation] = useState('');
  const [tasks, setTasks] = useState(['']);
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [todaysAttendance, setTodaysAttendance] = useState<Attendance | null>(null);
  // --- Admin States ---
  const [adminData, setAdminData] = useState<{
    todaysAttendance: Attendance[];
    allUsers: User[];
    selectedAttendance: string[];
  }>({
    todaysAttendance: [],
    allUsers: [],
    selectedAttendance: []
  });
  // --- Modal State ---
  const [selectedUser, setSelectedUser] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
    presentDays: number;
    absentDays: number;
    gross: number;
    totalDays: number;
    records: any[];
  } | null>(null);

  // --- Dark/Light Mode Toggle (Fixed) ---
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    } else {
      setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // --- Token Management ---
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      fetchProfile();
    }
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // --- API Functions ---
  const api = async (endpoint: string, options = {}) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      ...options
    };
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Something went wrong');
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  // --- Helper Functions ---
  const showMessage = (msg: string, isError = false) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 5000);
  };

  const fetchLocation = async () => {
    if (!navigator.geolocation) {
      showMessage("Geolocation is not supported by this browser.", true);
      return;
    }
    try {
      setLoading(true);
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          (err) => reject(err),
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 600000
          }
        );
      });
      const { latitude, longitude } = position.coords;
      const address = await reverseGeocode(latitude, longitude);
      setLocation(address);
      showMessage("Location fetched successfully!", false);
    } catch (error) {
      console.error('Location error:', error);
      let errorMessage = "Unable to fetch location. ";
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 1) {
          errorMessage += "Please allow location access and try again.";
        } else if (error.code === 2) {
          errorMessage += "Location information is unavailable.";
        } else if (error.code === 3) {
          errorMessage += "Location request timed out.";
        }
      } else {
        errorMessage += (error instanceof Error ? error.message : "Please try again.");
      }
      showMessage(errorMessage, true);
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'AttendanceApp/1.0'
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          return formatAddress(data.address || {}, data.display_name);
        }
      }
    } catch (error) {
      console.warn('Nominatim geocoding failed:', error);
    }
    return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  };

  const formatAddress = (addressComponents: { house_number: any; road: any; suburb: any; neighbourhood: any; city: any; town: any; village: any; state: any; province: any; }, fullAddress: string) => {
    const parts = [];
    if (addressComponents.house_number && addressComponents.road) {
      parts.push(`${addressComponents.house_number} ${addressComponents.road}`);
    } else if (addressComponents.road) {
      parts.push(addressComponents.road);
    }
    if (addressComponents.suburb || addressComponents.neighbourhood) {
      parts.push(addressComponents.suburb || addressComponents.neighbourhood);
    }
    if (addressComponents.city || addressComponents.town || addressComponents.village) {
      parts.push(addressComponents.city || addressComponents.town || addressComponents.village);
    }
    if (addressComponents.state || addressComponents.province) {
      parts.push(addressComponents.state || addressComponents.province);
    }
    if (parts.length > 0) {
      return parts.join(', ');
    }
    return fullAddress
      .split(',')
      .slice(0, -2)
      .join(',')
      .trim();
  };

  const fetchProfile = async () => {
    try {
      const data = await api('/auth/profile');
      setUser(data);
      setCurrentView(data.role === 'admin' ? 'admin-dashboard' : 'user-dashboard');
    } catch (error) {
      setToken('');
      setCurrentView('login');
    }
  };

  const handleSignup = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: authData.name,
          email: authData.email,
          phone: authData.phone,
          password: authData.password
        })
      });
      showMessage('OTP sent to your email!');
      setCurrentView('verify-otp');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      showMessage(errorMessage, true);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          email: authData.email,
          otp: authData.otp
        })
      });
      setToken(data.token);
      showMessage('Account verified successfully!');
      fetchProfile();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      showMessage(errorMessage, true);
    }
    setLoading(false);
  };

  const handleLogin = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: authData.email,
          password: authData.password
        })
      });
      setToken(data.token);
      setUser(data.user);
      showMessage('Login successful!');
      setCurrentView(data.user.role === 'admin' ? 'admin-dashboard' : 'user-dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      showMessage(errorMessage, true);
    }
    setLoading(false);
  };

  const handleStartAttendance = async () => {
    if (!user?.name || !user?._id) {
      showMessage('User not found', true);
      return;
    }
    if (!location.trim()) {
      showMessage('Please enter your location', true);
      return;
    }
    setLoading(true);
    try {
      await api('/attendance/start', {
        method: 'POST',
        body: JSON.stringify({
          userId: user._id,
          location: location
        })
      });
      showMessage('Attendance started successfully!');
      setLocation('');
      fetchTodaysAttendance();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      showMessage(errorMessage, true);
    }
    setLoading(false);
  };

  const handleCompleteAttendance = async () => {
    const validTasks = tasks.filter(task => task.trim() !== '');
    if (validTasks.length === 0) {
      showMessage('Please add at least one task', true);
      return;
    }
    if (!location.trim()) {
      showMessage('Please enter your end location', true);
      return;
    }
    if (!user?._id) {
      showMessage('User not found. Please log in again.', true);
      return;
    }
    setLoading(true);
    try {
      await api('/attendance/done', {
        method: 'POST',
        body: JSON.stringify({
          userId: user._id,
          location: location.trim(),
          tasks: validTasks,
        }),
      });
      showMessage('Attendance completed successfully!');
      setLocation('');
      setTasks(['']);
      await fetchTodaysAttendance();
      await fetchMonthlyAttendance();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      showMessage(errorMessage, true);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodaysAttendance = async () => {
    if (!user?._id) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await api(`/attendance/details/${user._id}/${today}`);
      setTodaysAttendance(data);
    } catch (error) {
      setTodaysAttendance(null);
    }
  };

  const fetchMonthlyAttendance = async () => {
    if (!user?._id) return;
    try {
      const data = await api(`/attendance/monthly/${user._id}`);
      setMonthlyData(data);
    } catch (error) {
      showMessage('Failed to fetch monthly data', true);
    }
  };

  const fetchAdminTodaysAttendance = async () => {
    try {
      const data = await api('/admin/today-attendance');
      setAdminData(prev => ({ ...prev, todaysAttendance: data }));
    } catch (error) {
      showMessage('Failed to fetch attendance data', true);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const data = await api('/admin/users');
      setAdminData(prev => ({ ...prev, allUsers: data }));
    } catch (error) {
      showMessage('Failed to fetch users', true);
    }
  };

  const handleVerifyAttendance = async () => {
    if (adminData.selectedAttendance.length === 0) {
      showMessage('Please select attendance records to verify', true);
      return;
    }
    setLoading(true);
    try {
      await api('/admin/verify-attendance', {
        method: 'POST',
        body: JSON.stringify({
          verifiedAttendanceIds: adminData.selectedAttendance
        })
      });
      showMessage(`${adminData.selectedAttendance.length} attendance records verified!`);
      setAdminData(prev => ({ ...prev, selectedAttendance: [] }));
      fetchAdminTodaysAttendance();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      showMessage(errorMessage, true);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    setCurrentView('login');
    setAuthData({ name: '', email: '', phone: '', password: '', otp: '', showPassword: false });
    showMessage('Logged out successfully');
  };

  const addTask = () => {
    setTasks([...tasks, '']);
  };

  const updateTask = (index: number, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
  };

  const removeTask = (index: number) => {
    if (tasks.length > 1) {
      const newTasks = tasks.filter((_, i) => i !== index);
      setTasks(newTasks);
    }
  };

  const handleViewUserStats = async (userId: string, userName: string) => {
    try {
      const data = await api(`/admin/user-attendance/${userId}`);
      setSelectedUser({
        isOpen: true,
        userId,
        userName,
        presentDays: data.presentDays,
        absentDays: data.absentDays,
        gross: data.gross,
        totalDays: data.totalDays,
        records: data.records,
      });
    } catch (error) {
      showMessage('Failed to fetch user attendance', true);
    }
  };

  useEffect(() => {
    if (currentView === 'user-dashboard' && user) {
      fetchTodaysAttendance();
      fetchMonthlyAttendance();
    }
    if (currentView === 'admin-dashboard' && user?.role === 'admin') {
      fetchAdminTodaysAttendance();
      fetchAllUsers();
    }
  }, [currentView, user]);

  // --- Enhanced Components ---
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center">
      <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span className="ml-2">Loading...</span>
    </div>
  );

  const UserAttendanceModal = ({
    isOpen,
    onClose,
    userName,
    presentDays,
    absentDays,
    gross,
    totalDays,
    records,
  }: {
    isOpen: boolean;
    onClose: () => void;
    userName: string;
    presentDays: number;
    absentDays: number;
    gross: number;
    totalDays: number;
    records: any[];
  }) => {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl p-6 border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  📊 {userName}'s Monthly Performance
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{presentDays}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Present</p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">{absentDays}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Absent</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalDays}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Working Days</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{gross}%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Attendance Records</h3>
                {records.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">No records found</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {records.map((record, index) => (
                      <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {new Date(record.date).toLocaleDateString()}
                          </p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${record.verified ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>
                            {record.verified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Check In</p>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{new Date(record.startTime).toLocaleTimeString()}</p>
                          </div>
                          {record.endTime && (
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Check Out</p>
                              <p className="font-medium text-gray-800 dark:text-gray-200">{new Date(record.endTime).toLocaleTimeString()}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // --- Render Functions ---
  const renderAuthForm = () => {
    if (currentView === 'signup') {
      return (
        <div className="max-w-md mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-center">
            <UserPlus className="w-12 h-12 text-white mx-auto mb-2" />
            <h2 className="text-2xl font-bold text-white">Create Account</h2>
            <p className="text-blue-100">Join our attendance system</p>
          </div>
          <div className="p-8">
            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={authData.name}
                  onChange={(e) => setAuthData({ ...authData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={authData.email}
                  onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Phone className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={authData.phone}
                  onChange={(e) => setAuthData({ ...authData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter 10-digit phone number"
                  pattern="[0-9]{10}"
                  required
                />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Lock className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={authData.showPassword ? 'text' : 'password'}
                    value={authData.password}
                    onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent pr-12 transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Create a strong password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setAuthData({ ...authData, showPassword: !authData.showPassword })}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition duration-200"
                  >
                    {authData.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-xl transition duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
              >
                {loading ? <LoadingSpinner /> : 'Create Account'}
              </button>
            </form>
            <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <button
                onClick={() => setCurrentView('login')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition duration-200 hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      );
    }
    if (currentView === 'verify-otp') {
      return (
        <div className="max-w-md mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6 text-center">
            <Mail className="w-12 h-12 text-white mx-auto mb-2" />
            <h2 className="text-2xl font-bold text-white">Verify Email</h2>
            <p className="text-green-100">Enter the OTP sent to your email</p>
          </div>
          <div className="p-8">
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
                  Enter 6-digit OTP sent to
                </label>
                <p className="text-center text-blue-600 dark:text-blue-400 font-medium mb-4">{authData.email}</p>
                <input
                  type="text"
                  value={authData.otp}
                  onChange={(e) => setAuthData({ ...authData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent text-center text-2xl tracking-[0.5em] transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white py-3 px-4 rounded-xl transition duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
              >
                {loading ? <LoadingSpinner /> : 'Verify Account'}
              </button>
            </form>
            <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
              Didn't receive the code?{' '}
              <button
                onClick={() => setCurrentView('signup')}
                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium transition duration-200 hover:underline"
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="max-w-md mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-6 text-center">
          <LogIn className="w-12 h-12 text-white mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-indigo-100">Sign in to your account</p>
        </div>
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
                Email Address
              </label>
              <input
                type="email"
                value={authData.email}
                onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Lock className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
                Password
              </label>
              <div className="relative">
                <input
                  type={authData.showPassword ? 'text' : 'password'}
                  value={authData.password}
                  onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent pr-12 transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setAuthData({ ...authData, showPassword: !authData.showPassword })}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition duration-200"
                >
                  {authData.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl transition duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              {loading ? <LoadingSpinner /> : 'Sign In'}
            </button>
          </form>
          <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <button
              onClick={() => setCurrentView('signup')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition duration-200 hover:underline"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    );
  };

  const renderUserDashboard = () => (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-1">Welcome back, {user?.name}! 👋</h1>
            <p className="text-blue-100 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleLogout}
              className="bg-red-500/80 hover:bg-red-500 px-4 py-2 rounded-xl transition-all duration-200 backdrop-blur-sm border border-red-400/50 flex items-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
      {/* Today's Attendance Card */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800 dark:text-gray-200">
          <Timer className="w-6 h-6 mr-3 text-blue-500 dark:text-blue-400" />
          Today's Attendance
        </h2>
        {todaysAttendance ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-5 rounded-xl border border-green-200 dark:border-green-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">Check In</p>
                  <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{new Date(todaysAttendance.startTime).toLocaleTimeString()}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start mt-2">
                  <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                  <span className="break-words">{todaysAttendance.startLocation}</span>
                </p>
              </div>
              {todaysAttendance.endTime && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 p-5 rounded-xl border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Check Out</p>
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{new Date(todaysAttendance.endTime).toLocaleTimeString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start mt-2">
                    <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                    <span className="break-words">{todaysAttendance.endLocation}</span>
                  </p>
                </div>
              )}
            </div>
            {/* Working Hours Display */}
            {todaysAttendance.endTime && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 p-5 rounded-xl border border-yellow-200 dark:border-yellow-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Total Working Hours</p>
                  <Timer className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {Math.floor((new Date(todaysAttendance.endTime).getTime() - new Date(todaysAttendance.startTime).getTime()) / (1000 * 60 * 60))}h{' '}
                  {Math.floor(((new Date(todaysAttendance.endTime).getTime() - new Date(todaysAttendance.startTime).getTime()) % (1000 * 60 * 60)) / (1000 * 60))}m
                </p>
              </div>
            )}
            {todaysAttendance.tasks && todaysAttendance.tasks.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-200 dark:border-gray-600">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                  <ListTodo className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                  Tasks Completed Today
                </h3>
                <div className="space-y-2">
                  {todaysAttendance.tasks.map((task, index) => (
                    <div key={index} className="flex items-start bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300 break-words">{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${todaysAttendance.verified ? 'text-green-500 dark:text-green-400' : 'text-yellow-500 dark:text-yellow-400'}`} />
                <span className={`font-semibold ${todaysAttendance.verified ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                  {todaysAttendance.verified ? 'Attendance Verified ✅' : 'Pending Verification ⏳'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
              <Building2 className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-6">Ready to start your day?</p>
              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-left">
                    <MapPin className="w-4 h-4 inline mr-2 text-blue-500 dark:text-blue-400" />
                    Your Current Location
                  </label>
                  <div className="space-y-3">
                    <button
                      onClick={fetchLocation}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-3 rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 text-sm font-medium flex items-center justify-center"
                    >
                      {loading ? (
                        <LoadingSpinner />
                      ) : (
                        <>
                          <MapPin className="w-4 h-4 mr-2" />
                          Get My Current Location
                        </>
                      )}
                    </button>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Or enter your location manually"
                    />
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleStartAttendance}
              disabled={loading || !location.trim()}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 text-lg font-semibold"
            >
              {loading ? <LoadingSpinner /> : (
                <>
                  <Timer className="w-5 h-5 inline mr-2" />
                  Start Attendance
                </>
              )}
            </button>
          </div>
        )}
        {/* Complete Attendance Section */}
        {todaysAttendance && !todaysAttendance.endTime && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-blue-500" />
              Complete Your Day
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <MapPin className="w-4 h-4 inline mr-2 text-blue-500 dark:text-blue-400" />
                  Checkout Location
                </label>
                <div className="space-y-3">
                  <button
                    onClick={fetchLocation}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 text-sm font-medium flex items-center"
                  >
                    {loading ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        <MapPin className="w-4 h-4 mr-2" />
                        Get My Current Location
                      </>
                    )}
                  </button>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Or enter your checkout location manually"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <ListTodo className="w-4 h-4 inline mr-2 text-blue-500 dark:text-blue-400" />
                  Tasks Completed Today
                </label>
                <div className="space-y-3">
                  {tasks.map((task, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        value={task}
                        onChange={(e) => updateTask(index, e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder={`Task ${index + 1}: What did you accomplish?`}
                      />
                      {tasks.length > 1 && (
                        <button
                          onClick={() => removeTask(index)}
                          className="bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 p-3 rounded-xl transition-all duration-200 border border-red-200 dark:border-red-700 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addTask}
                  className="mt-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Task
                </button>
              </div>
              <button
                onClick={handleCompleteAttendance}
                disabled={loading || !location.trim() || tasks.filter(t => t.trim()).length === 0}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-4 rounded-xl transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] text-lg font-semibold"
              >
                {loading ? <LoadingSpinner /> : (
                  <>
                    <CheckCircle className="w-5 h-5 inline mr-2" />
                    Complete Attendance
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Monthly Summary */}
      {monthlyData && (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800 dark:text-gray-200">
            <Calendar className="w-6 h-6 mr-3 text-blue-500 dark:text-blue-400" />
            Monthly Summary
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border border-green-200 dark:border-green-700">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{monthlyData.presentDays}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Present Days</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 rounded-xl border border-red-200 dark:border-red-700">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <X className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{monthlyData.absentDays}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Absent Days</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200 dark:border-blue-700">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{monthlyData.totalDays}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Working Days</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 rounded-xl border border-purple-200 dark:border-purple-700">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{monthlyData.gross}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Attendance Rate</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Enhanced Admin Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center">
              <Users className="w-8 h-8 mr-3" />
              Admin Dashboard
            </h1>
            <p className="text-purple-100">Manage attendance and monitor team performance</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleLogout}
              className="bg-red-500/80 hover:bg-red-500 px-4 py-2 rounded-xl transition-all duration-200 backdrop-blur-sm border border-red-400/50 flex items-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
      {/* Today's Attendance Management */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center text-gray-800 dark:text-gray-200">
            <Timer className="w-6 h-6 mr-3 text-blue-500 dark:text-blue-400" />
            Today's Attendance
            <span className="ml-3 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
              {adminData.todaysAttendance.length} Records
            </span>
          </h2>
          {adminData.selectedAttendance.length > 0 && (
            <button
              onClick={handleVerifyAttendance}
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 font-semibold"
            >
              {loading ? <LoadingSpinner /> : (
                <>
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  Verify {adminData.selectedAttendance.length} Record{adminData.selectedAttendance.length > 1 ? 's' : ''}
                </>
              )}
            </button>
          )}
        </div>
        {adminData.todaysAttendance.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-xl font-medium text-gray-500 dark:text-gray-400">No attendance records for today</p>
            <p className="text-gray-400 dark:text-gray-500 mt-2">Records will appear here as employees check in</p>
          </div>
        ) : (
          <div className="space-y-4">
            {adminData.todaysAttendance.map((record) => (
              <div key={record._id} className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={adminData.selectedAttendance.includes(record._id)}
                      disabled={record.verified}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAdminData(prev => ({
                            ...prev,
                            selectedAttendance: [...prev.selectedAttendance, record._id]
                          }));
                        } else {
                          setAdminData(prev => ({
                            ...prev,
                            selectedAttendance: prev.selectedAttendance.filter(id => id !== record._id)
                          }));
                        }
                      }}
                      className="mr-4 h-5 w-5 text-blue-600 dark:text-blue-400 rounded focus:ring-blue-500 dark:focus:ring-blue-400 border-2"
                    />
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                        {record.userId?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{record.userId?.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {record.userId?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${record.verified
                        ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                        : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
                      }`}>
                      <CheckCircle className={`w-3 h-3 mr-1 ${record.verified ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`} />
                      {record.verified ? 'Verified' : 'Pending'}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">Check In</span>
                      <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {record.startTime ? new Date(record.startTime).toLocaleTimeString() : 'Not started'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {record.startLocation}
                    </p>
                  </div>
                  {record.endTime && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Check Out</span>
                        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {new Date(record.endTime).toLocaleTimeString()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {record.endLocation}
                      </p>
                    </div>
                  )}
                </div>
                {record.tasks && record.tasks.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                      <ListTodo className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                      Tasks Completed ({record.tasks.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {record.tasks.map((task, index) => (
                        <div key={index} className="flex items-center bg-white dark:bg-gray-800 rounded-lg p-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* All Users Management */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800 dark:text-gray-200">
          <Users className="w-6 h-6 mr-3 text-blue-500 dark:text-blue-400" />
          Team Members
          <span className="ml-3 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
            {adminData.allUsers.length} Users
          </span>
        </h2>
        {adminData.allUsers.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-xl font-medium text-gray-500 dark:text-gray-400">No users found</p>
            <p className="text-gray-400 dark:text-gray-500 mt-2">New user registrations will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminData.allUsers.map((user) => (
              <div key={user._id} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-6 hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{user.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                      ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                      : 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
                    }`}>
                    {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                  </span>
                  <button
                    onClick={() => handleViewUserStats(user._id, user.name)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 transform hover:scale-105 font-medium"
                  >
                    📊 View Stats
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedUser && (
        <UserAttendanceModal
          isOpen={selectedUser.isOpen}
          onClose={() => setSelectedUser(null)}
          userName={selectedUser.userName}
          presentDays={selectedUser.presentDays}
          absentDays={selectedUser.absentDays}
          gross={selectedUser.gross}
          totalDays={selectedUser.totalDays}
          records={selectedUser.records}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 transition-all duration-500">
      {/* Enhanced Message Display */}
      {message && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl transition-all duration-500 transform translate-x-0 backdrop-blur-sm border max-w-sm ${message.includes('error') || message.includes('Failed') || message.includes('Invalid')
            ? 'bg-red-50/90 dark:bg-red-900/90 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700'
            : 'bg-green-50/90 dark:bg-green-900/90 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700'
          }`}>
          <div className="flex items-center">
            {message.includes('error') || message.includes('Failed') || message.includes('Invalid') ? (
              <X className="w-5 h-5 mr-2 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            )}
            <span className="font-medium">{message}</span>
          </div>
        </div>
      )}
      {/* Main Content */}
      <div className="relative">
        {!token && (currentView === 'login' || currentView === 'signup' || currentView === 'verify-otp') && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md">
              {renderAuthForm()}
            </div>
          </div>
        )}
        {token && currentView === 'user-dashboard' && renderUserDashboard()}
        {token && currentView === 'admin-dashboard' && renderAdminDashboard()}
      </div>
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-300 dark:bg-purple-800 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-300 dark:bg-blue-800 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-indigo-300 dark:bg-indigo-800 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-pulse"></div>
      </div>
    </div>
  );
};

export default AttendanceApp;
