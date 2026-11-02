import { useCallback, useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/useAuth';
import VoteButtons from '../components/VoteButtons';

const key = (section, itemId) => `${section}:${itemId}`;

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [votes, setVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [dash, voteList] = await Promise.all([api.get('/dashboard'), api.get('/votes')]);
      setData(dash.data);
      setVotes(Object.fromEntries(voteList.data.map(v => [key(v.section, v.itemId), v.value])));
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

    useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      load();
    }, [load]);

  async function vote(section, itemId, value) {
    const k = key(section, itemId);
    const previous = votes[k];
    const removing = previous === value;

    setVotes(v => {
      const next = { ...v };
      if (removing) delete next[k];
      else next[k] = value;
      return next;
    });

    try {
      if (removing) {
        await api.delete('/votes', { data: { section, itemId } });
      } else {
        await api.post('/votes', { section, itemId, value });
      }
    } catch {
      setVotes(v => {
        const next = { ...v };
        if (previous === undefined) delete next[k];
        else next[k] = previous;
        return next;
      });
    }
  }

  const unavailable = <p className="muted">This section is temporarily unavailable.</p>;

  return (
    <div className="dashboard">
      <header className="topbar">
        <div>
          <h1>Crypto Advisor</h1>
          <p className="muted">Hi, {user?.name}</p>
        </div>
        <div className="topbar-actions">
          <button type="button" className="secondary" onClick={load} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button type="button" className="secondary" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      {error && <p className="error">{error}</p>}
      {loading && !data && <p className="muted">Loading your dashboard...</p>}

      {data && (
        <div className="grid">
          <section className="card">
            <h2>Market News</h2>
            {data.news ? (
              <ul className="news-list">
                {data.news.map(n => (
                  <li key={n.id}>
                    <a href={n.url} target="_blank" rel="noreferrer">
                      {n.title}
                    </a>
                    <span className="muted"> · {n.source}</span>
                    <VoteButtons
                      value={votes[key('news', n.id)]}
                      onVote={v => vote('news', n.id, v)}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              unavailable
            )}
          </section>

          <section className="card">
            <h2>Coin Prices</h2>
            {data.prices ? (
              <>
                <ul className="price-list">
                  {data.prices.map(p => (
                    <li key={p.id}>
                      <span className="coin">{p.id}</span>
                      <span>${p.price.toLocaleString()}</span>
                      <span className={p.change24h >= 0 ? 'up' : 'down'}>
                        {p.change24h >= 0 ? '+' : ''}
                        {p.change24h.toFixed(2)}%
                      </span>
                    </li>
                  ))}
                </ul>
                <VoteButtons
                  value={votes[key('prices', 'prices')]}
                  onVote={v => vote('prices', 'prices', v)}
                />
              </>
            ) : (
              unavailable
            )}
          </section>

          <section className="card">
            <h2>AI Insight of the Day</h2>
            {data.insight ? (
              <>
                <p>{data.insight.text}</p>
                <VoteButtons
                  value={votes[key('insight', data.insight.id)]}
                  onVote={v => vote('insight', data.insight.id, v)}
                />
              </>
            ) : (
              unavailable
            )}
          </section>

          <section className="card">
            <h2>Fun Crypto Meme</h2>
            {data.meme ? (
              <>
                <img className="meme" src={data.meme.url} alt={data.meme.title} />
                <p className="muted">{data.meme.title}</p>
                <VoteButtons
                  value={votes[key('meme', data.meme.id)]}
                  onVote={v => vote('meme', data.meme.id, v)}
                />
              </>
            ) : (
              unavailable
            )}
          </section>
        </div>
      )}
    </div>
  );
}
