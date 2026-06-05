import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shuffle, ThumbsUp, ThumbsDown, Settings } from 'lucide-react';
import './App.css';

interface StumbleAsset {
  id: string;
  url: string;
  title: string;
  interest: string;
}

function App() {
  const [currentAsset, setCurrentAsset] = useState<StumbleAsset | null>(null);
  const [interests, setInterests] = useState<string[]>(['Space', 'Art', 'Travel']);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Space', 'Art', 'Travel']);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/v1/interests');
        setInterests(response.data);
      } catch (error) {
        console.error('Failed to fetch interests:', error);
      }
    };
    fetchInterests();
  }, []);

  const handleStumble = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/v1/stumble', {
        params: {
          interests: selectedInterests.join(','),
          history: history.slice(-50).join(',')
        }
      });
      
      const asset = response.data;
      setCurrentAsset(asset);
      setHistory(prev => [...prev, asset.id]);

      // Extension vs Web Mode
      if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: 'NAVIGATE', url: asset.url });
      } else {
        window.open(asset.url, '_blank');
      }
      
    } catch (error) {
      console.error('Stumble failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (isPositive: boolean) => {
    if (!currentAsset) return;
    try {
      await axios.post('http://localhost:3000/api/v1/rate', {
        assetId: currentAsset.id,
        isPositive
      });
      // Immediately stumble again after rating
      handleStumble();
    } catch (error) {
      console.error('Rating failed:', error);
    }
  };

  return (
    <div className="stumble-container">
      <header>
        <h1>StumbleClone</h1>
        <button className="icon-btn"><Settings size={20} /></button>
      </header>

      <main>
        {currentAsset ? (
          <div className="current-info">
            <h2>{currentAsset.title}</h2>
            <p className="interest-tag">{currentAsset.interest}</p>
          </div>
        ) : (
          <div className="welcome">
            <p>Ready to discover something new?</p>
          </div>
        )}

        <button 
          className={`stumble-btn ${loading ? 'loading' : ''}`} 
          onClick={handleStumble}
          disabled={loading}
        >
          {loading ? '...' : <Shuffle size={48} />}
          <span>STUMBLE</span>
        </button>

        <div className="action-bar">
          <button className="rate-btn up" onClick={() => handleRate(true)} disabled={!currentAsset}>
            <ThumbsUp size={24} />
          </button>
          <button className="rate-btn down" onClick={() => handleRate(false)} disabled={!currentAsset}>
            <ThumbsDown size={24} />
          </button>
        </div>
      </main>

      <section className="interests-section">
        <h3>My Interests</h3>
        <div className="interests-grid">
          {interests.map(interest => (
            <label key={interest} className="interest-chip">
              <input 
                type="checkbox" 
                checked={selectedInterests.includes(interest)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedInterests([...selectedInterests, interest]);
                  } else {
                    setSelectedInterests(selectedInterests.filter(i => i !== interest));
                  }
                }}
              />
              <span>{interest}</span>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
