import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [imageUrl, setImageUrl] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await api.get('/community/posts');
      setPosts(res.data);
    };
    fetchPosts();
  }, []);

  const handleCreate = async () => {
    if (!newPost.title || !newPost.content) return alert('Title and content required');
    await api.post('/community/posts', { ...newPost, image: imageUrl });
    setNewPost({ title: '', content: '' });
    setImageUrl('');
    const res = await api.get('/community/posts');
    setPosts(res.data);
  };

  const handleLike = async (postId) => {
    await api.post(`/community/posts/${postId}/like`);
    const res = await api.get('/community/posts');
    setPosts(res.data);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem' }}>
      <h2 style={{ textAlign: 'center' }}>♻️ Sustainable Fashion Community</h2>
      <p style={{ textAlign: 'center', color: '#555' }}>Share swap stories, tips, and inspire others to reduce waste.</p>

      {token && (
        <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Title"
            value={newPost.title}
            onChange={e => setNewPost({ ...newPost, title: e.target.value })}
            style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
          />
          <textarea
            placeholder="Write your swap story or eco tip..."
            value={newPost.content}
            onChange={e => setNewPost({ ...newPost, content: e.target.value })}
            rows="3"
            style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
          />
          <input
            type="text"
            placeholder="Image URL (optional)"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #ccc' }}
          />
          <button onClick={handleCreate} style={{ backgroundColor: '#2d6a4f', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '30px', cursor: 'pointer' }}>Share Post</button>
        </div>
      )}

      {posts.length === 0 && <p>No posts yet. Be the first to share!</p>}

      {posts.map(post => (
        <div key={post.id} style={{ borderBottom: '1px solid #ddd', padding: '1rem 0', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>{post.title}</h3>
          <p style={{ color: '#666', fontSize: '0.8rem' }}>by {post.username} • {new Date(post.createdAt).toLocaleDateString()}</p>
          <p>{post.content}</p>
          {post.image && <img src={post.image} alt="post visual" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', marginTop: '0.5rem' }} />}
          <button onClick={() => handleLike(post.id)} style={{ background: 'none', border: 'none', color: '#1d3557', cursor: 'pointer', marginTop: '0.5rem' }}>❤️ {post.likes} likes</button>
        </div>
      ))}
    </div>
  );
};

export default Community;