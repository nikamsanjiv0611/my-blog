import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, MessageSquare, Trash2, Send, User } from 'lucide-react';

const API = 'http://localhost:5000/api';

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [posts, setPosts] = useState([]);
  const [isAuthMode, setIsAuthMode] = useState('login');
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [activeComments, setActiveComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API}/posts`);
      setPosts(res.data);
    } catch (err) { console.error(err); }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isAuthMode === 'register') {
        await axios.post(`${API}/auth/register`, { username, email, password });
        alert('Registered! Please log in.');
        setIsAuthMode('login');
      } else {
        const res = await axios.post(`${API}/auth/login`, { email, password });
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('token', res.data.token);
      }
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleLogout = () => { setUser(null); setToken(''); localStorage.clear(); };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    try {
      await axios.post(`${API}/posts`, { title, content }, { headers: { Authorization: `Bearer ${token}` } });
      setTitle(''); setContent(''); fetchPosts();
    } catch (err) { alert('Error creating post'); }
  };

  const handleDeletePost = async (id) => {
    try {
      await axios.delete(`${API}/posts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchPosts();
    } catch (err) { alert('Error deleting post'); }
  };

  const toggleComments = async (postId) => {
    if (activeComments[postId]) {
      setActiveComments(prev => ({ ...prev, [postId]: null }));
    } else {
      try {
        const res = await axios.get(`${API}/comments/${postId}`);
        setActiveComments(prev => ({ ...prev, [postId]: res.data }));
      } catch (err) { console.error(err); }
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text) return;
    try {
      const res = await axios.post(`${API}/comments/${postId}`, { text }, { headers: { Authorization: `Bearer ${token}` } });
      setActiveComments(prev => ({ ...prev, [postId]: [res.data, ...(prev[postId] || [])] }));
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } catch (err) { alert('Error adding comment'); }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            DevBlog Platform
          </h1>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600 flex items-center gap-1">
                <User size={16} /> {user.username}
              </span>
              <button onClick={handleLogout} className="text-sm bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition">
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          {!user ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold mb-4">{isAuthMode === 'login' ? 'Login' : 'Create Account'}</h2>
              <form onSubmit={handleAuth} className="space-y-4">
                {isAuthMode === 'register' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Username</label>
                    <input type="text" value={username} onChange={e=>setUsername(e.target.value)} required className="w-full mt-1 p-2 border rounded-lg text-sm" />
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Email</label>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full mt-1 p-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Password</label>
                  <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full mt-1 p-2 border rounded-lg text-sm" />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium">
                  {isAuthMode === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              </form>
              <p className="text-xs text-center mt-4 text-slate-500">
                <button onClick={()=>setIsAuthMode(isAuthMode==='login'?'register':'login')} className="text-blue-600 font-semibold underline">
                  {isAuthMode === 'login' ? 'Register' : 'Login'}
                </button>
              </p>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><PlusCircle size={20} className="text-blue-600"/> Create Post</h2>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <input type="text" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} required className="w-full p-2 border rounded-lg text-sm font-semibold" />
                <textarea placeholder="Write content..." value={content} onChange={e=>setContent(e.target.value)} required rows={5} className="w-full p-2 border rounded-lg text-sm"></textarea>
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium">Publish Post</button>
              </form>
            </div>
          )}
        </div>

        <div className="md:col-span-2 space-y-6">
          <h2 className="text-xl font-bold">Recent Posts</h2>
          {posts.map(post => (
            <div key={post._id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold">{post.title}</h3>
                {user && user.id === post.author?._id && (
                  <button onClick={() => handleDeletePost(post._id)} className="text-slate-400 hover:text-red-600"><Trash2 size={18} /></button>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-4">By {post.author?.username || 'Unknown'}</p>
              <p className="text-slate-700 text-sm mb-4">{post.content}</p>
              <button onClick={() => toggleComments(post._id)} className="flex items-center gap-2 text-xs font-semibold text-blue-600">
                <MessageSquare size={16} /> Comments
              </button>

              {activeComments[post._id] && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  {user && (
                    <div className="flex gap-2">
                      <input type="text" placeholder="Add comment..." value={commentInputs[post._id] || ''} onChange={e => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })} className="flex-1 p-2 border rounded-lg text-xs" />
                      <button onClick={() => handleAddComment(post._id)} className="bg-blue-600 text-white p-2 rounded-lg"><Send size={14} /></button>
                    </div>
                  )}
                  {activeComments[post._id].map(c => (
                    <div key={c._id} className="bg-slate-50 p-2 rounded text-xs">
                      <strong>{c.author?.username}: </strong>{c.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
