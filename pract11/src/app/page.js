'use client'

import React, { useEffect, useMemo, useRef, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit,
} from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC-T6Ri0IsPe8Hc5KtzFyeF0PwzQr9AlJE",
  authDomain: "pract11-d9879.firebaseapp.com",
  projectId: "pract11-d9879",
  storageBucket: "pract11-d9879.firebasestorage.app",
  messagingSenderId: "696974798428",
  appId: "1:696974798428:web:b5a426bf7e07d6d0720099",
  measurementId: "G-39KYSVXC7X"
};

// Initialize Firebase once per app session
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Utility: build deterministic chat id from 2 UIDs (sorted)
const chatIdFor = (a, b) => [a, b].sort().join("_");

// Utility: format timestamp
const fmtTime = (date) => {
  try {
    const d = typeof date === "number" ? new Date(date) : date?.toDate?.() || date;
    if (!d) return "";
    const now = new Date();
    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    return sameDay
      ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString();
  } catch (e) {
    return "";
  }
};

// Auth Gate wraps the whole app
function AuthGate({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        try {
          // Ensure user profile exists in Firestore
          const uref = doc(db, "users", u.uid);
          const snap = await getDoc(uref);
          if (!snap.exists()) {
            await setDoc(uref, {
              uid: u.uid,
              displayName: u.displayName || u.email?.split("@")[0] || "User",
              email: u.email,
              photoURL: u.photoURL || null,
              createdAt: serverTimestamp(),
              lastSeen: serverTimestamp(),
            });
          } else {
            await updateDoc(uref, { lastSeen: serverTimestamp() });
          }
          setUser(u);
        } catch (error) {
          console.error("Error setting up user:", error);
          setUser(u); // Still set user even if Firestore fails
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-700 text-lg">Loading…</div>
        </div>
      </div>
    );
  }

  return user ? children(user) : <LoginSignup />;
}

function LoginSignup() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const toggle = () => setMode((m) => (m === "login" ? "signup" : "login"));

  const doEmailAuth = async () => {
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (name) await updateProfile(cred.user, { displayName: name });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const doGoogle = async () => {
    setError("");
    setBusy(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-white/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="text-white text-2xl font-bold">💬</div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Insta Chat </h1>
          <p className="text-gray-600">{mode === "login" ? "Welcome back!" : "Create your account"}</p>
        </div>

        <div className="space-y-5">
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display name</label>
              <input
                className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Samad"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>}
          <button
            onClick={doEmailAuth}
            disabled={busy}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            {busy ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </div>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-sm text-gray-500 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        <button
          onClick={doGoogle}
          disabled={busy}
          className="w-full rounded-2xl border-2 border-gray-200 py-3 font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {busy ? "Please wait…" : "Continue with Google"}
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          {mode === "login" ? "New here?" : "Already have an account?"} {" "}
          <button className="text-blue-600 hover:text-blue-700 font-semibold underline transition-colors" onClick={toggle}>
            {mode === "login" ? "Create account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

function Sidebar({ user, onSelectChat, activeChatId }) {
  const [chats, setChats] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!user?.uid) return;
    
    // Use a simpler query that doesn't require a composite index
    // First get chats where user is participant, then sort in memory
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid)
    );
    
    const unsub = onSnapshot(q, 
      async (snap) => {
        try {
          const rows = [];
          for (const d of snap.docs) {
            const chat = { id: d.id, ...d.data() };
            // derive the other participant
            const otherId = chat.participants?.find((p) => p !== user.uid);
            let other = null;
            if (otherId) {
              try {
                const us = await getDoc(doc(db, "users", otherId));
                other = us.exists() ? us.data() : { uid: otherId, displayName: "Unknown" };
              } catch (userError) {
                console.error("Error fetching user:", userError);
                other = { uid: otherId, displayName: "Unknown" };
              }
            }
            rows.push({ ...chat, other });
          }
          
          // Sort by updatedAt in memory (most recent first)
          rows.sort((a, b) => {
            const aTime = a.updatedAt?.toDate?.() || new Date(0);
            const bTime = b.updatedAt?.toDate?.() || new Date(0);
            return bTime - aTime;
          });
          
          setChats(rows.slice(0, 50)); // Limit to 50 most recent
        } catch (error) {
          console.error("Error processing chats:", error);
        }
      },
      (error) => {
        console.error("Error listening to chats:", error);
        setErr("Failed to load chats. Please refresh the page.");
      }
    );
    
    return () => unsub();
  }, [user.uid]);

  const startChatWithEmail = async () => {
    setErr("");
    if (!searchEmail.trim()) {
      setErr("Please enter an email address.");
      return;
    }
    setBusy(true);
    try {
      const uq = query(collection(db, "users"), where("email", "==", searchEmail.trim()));
      const res = await getDocs(uq);
      if (res.empty) {
        setErr("No user found with that email.");
        setBusy(false);
        return;
      }
      const other = res.docs[0].data();
      if (other.uid === user.uid) {
        setErr("That's your own email! Enter someone else's.");
        setBusy(false);
        return;
      }
      const cid = chatIdFor(user.uid, other.uid);
      const cref = doc(db, "chats", cid);
      const existing = await getDoc(cref);
      if (!existing.exists()) {
        await setDoc(cref, {
          id: cid,
          participants: [user.uid, other.uid],
          updatedAt: serverTimestamp(),
          lastMessage: "",
          createdAt: serverTimestamp(),
        });
      } else {
        await updateDoc(cref, { updatedAt: serverTimestamp() });
      }
      onSelectChat(cid);
      setSearchEmail("");
    } catch (e) {
      console.error("Error starting chat:", e);
      setErr("Failed to start chat. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside className="w-80 border-r border-gray-200 h-full flex flex-col bg-white/50 backdrop-blur-sm">
      <div className="p-6 border-b border-gray-200 bg-white/80">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white grid place-items-center text-xl font-bold shadow-lg">
            {user.displayName?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-800 truncate">{user.displayName || user.email}</div>
            <div className="text-sm text-gray-500 truncate">{user.email}</div>
          </div>
          <button
            onClick={() => signOut(auth)}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-all"
          >
            Sign out
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="text-sm font-semibold text-gray-700">Start New Chat</div>
          <div className="flex gap-2">
            <input
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !busy && startChatWithEmail()}
              placeholder="Enter email address…"
              className="flex-1 rounded-xl border-2 border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
            />
            <button
              onClick={startChatWithEmail}
              disabled={busy || !searchEmail.trim()}
              className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 text-sm font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {busy ? "..." : "Start"}
            </button>
          </div>
          {err && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{err}</div>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <div className="text-gray-400 text-2xl">💬</div>
            </div>
            <div className="text-sm text-gray-500 font-medium">No chats yet</div>
            <div className="text-xs text-gray-400 mt-1">Start a conversation above</div>
          </div>
        ) : (
          <div className="p-2">
            {chats.map((c, idx) => (
              <div
                key={c.id}
                onClick={() => onSelectChat(c.id)}
                className={`mx-2 mb-2 p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] ${
                  activeChatId === c.id 
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                    : "bg-white/60 hover:bg-white/80 text-gray-800 shadow-sm hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl grid place-items-center text-lg font-bold ${
                    activeChatId === c.id 
                      ? "bg-white/20 text-white" 
                      : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600"
                  }`}>
                    {c.other?.displayName?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold truncate ${activeChatId === c.id ? "text-white" : "text-gray-800"}`}>
                      {c.other?.displayName || c.other?.email || "Unknown User"}
                    </div>
                    <div className={`text-sm truncate ${
                      activeChatId === c.id ? "text-white/80" : "text-gray-500"
                    }`}>
                      {c.lastMessage || "No messages yet"}
                    </div>
                  </div>
                  <div className={`text-xs ${activeChatId === c.id ? "text-white/60" : "text-gray-400"}`}>
                    {fmtTime(c.updatedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function ChatWindow({ user, chatId }) {
  const [other, setOther] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sendError, setSendError] = useState("");
  const listRef = useRef(null);

  // Load other participant & messages
  useEffect(() => {
    if (!chatId) return;
    
    const parts = chatId.split("_");
    const otherId = parts[0] === user.uid ? parts[1] : parts[0];

    (async () => {
      try {
        const us = await getDoc(doc(db, "users", otherId));
        setOther(us.exists() ? us.data() : { uid: otherId, displayName: "Unknown" });
      } catch (error) {
        console.error("Error fetching other user:", error);
        setOther({ uid: otherId, displayName: "Unknown" });
      }
    })();

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc"),
      limit(500)
    );
    
    const unsub = onSnapshot(q, 
      (snap) => {
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMessages(arr);
        // scroll to bottom after a tick
        setTimeout(() => {
          listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
        }, 50);
      },
      (error) => {
        console.error("Error listening to messages:", error);
      }
    );
    
    return () => unsub();
  }, [chatId, user.uid]);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    
    setSendError("");
    try {
      const mref = collection(db, "chats", chatId, "messages");
      await addDoc(mref, {
        text: trimmed,
        senderId: user.uid,
        createdAt: serverTimestamp(),
      });
      
      // update chat preview
      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: trimmed,
        updatedAt: serverTimestamp(),
      });
      
      setText("");
    } catch (error) {
      console.error("Error sending message:", error);
      setSendError("Failed to send message. Please try again.");
    }
  };

  if (!chatId) {
    return (
      <div className="flex-1 grid place-items-center text-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="space-y-4">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto">
            <div className="text-4xl">💬</div>
          </div>
          <div>
            <div className="text-xl font-semibold text-gray-700 mb-2">Welcome to InstaChat </div>
            <div className="text-gray-500">Select a chat from the sidebar or start a new conversation</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-white to-gray-50">
      <header className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white/80 backdrop-blur-sm">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white grid place-items-center text-lg font-bold shadow-lg">
          {other?.displayName?.[0]?.toUpperCase() || "?"}
        </div>
        <div>
          <div className="font-bold text-gray-800">{other?.displayName || other?.email || "Unknown User"}</div>
          <div className="text-sm text-gray-500">Online</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={listRef}>
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <div className="text-gray-400 text-2xl">👋</div>
            </div>
            <div className="text-gray-500 font-medium">Start the conversation!</div>
            <div className="text-sm text-gray-400 mt-1">Send your first message below</div>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.senderId === user.uid ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                  m.senderId === user.uid
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    : "bg-white border border-gray-200 text-gray-800"
                }`}
                title={m.createdAt ? fmtTime(m.createdAt) : ""}
              >
                <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">{m.text}</div>
                <div className={`text-xs mt-2 ${
                  m.senderId === user.uid ? "text-white/70" : "text-gray-400"
                }`}>
                  {fmtTime(m.createdAt)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        {sendError && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{sendError}</div>
        )}
        <div className="flex gap-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Type your message…"
            className="flex-1 rounded-2xl border-2 border-gray-200 px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
          />
          <button 
            onClick={send} 
            disabled={!text.trim()}
            className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeChatId, setActiveChatId] = useState(null);

  return (
    <AuthGate>
      {(user) => (
        <div className="h-screen flex bg-gradient-to-br from-blue-50 to-purple-50">
          <Sidebar user={user} onSelectChat={setActiveChatId} activeChatId={activeChatId} />
          <ChatWindow user={user} chatId={activeChatId} />
        </div>
      )}
    </AuthGate>
  );
}