import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const ASSETS = [
  { id: 'bitcoin', label: 'Bitcoin (BTC)' },
  { id: 'ethereum', label: 'Ethereum (ETH)' },
  { id: 'solana', label: 'Solana (SOL)' },
  { id: 'cardano', label: 'Cardano (ADA)' },
  { id: 'dogecoin', label: 'Dogecoin (DOGE)' },
  { id: 'ripple', label: 'XRP' },
];
const INVESTOR_TYPES = ['HODLer', 'Day Trader', 'NFT Collector'];
const CONTENT_TYPES = ['Market News', 'Charts', 'Social', 'Fun'];

function toggle(list, value) {
  return list.includes(value) ? list.filter(v => v !== value) : [...list, value];
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [assets, setAssets] = useState([]);
  const [investorType, setInvestorType] = useState('');
  const [contentTypes, setContentTypes] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canContinue =
    (step === 0 && assets.length > 0) ||
    (step === 1 && investorType) ||
    (step === 2 && contentTypes.length > 0);

  async function finish() {
    setError('');
    setSubmitting(true);
    try {
      await api.post('/preferences', { assets, investorType, contentTypes });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save preferences');
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="muted">Step {step + 1} of 3</p>

        {step === 0 && (
          <>
            <h1>Which crypto assets interest you?</h1>
            <div className="options">
              {ASSETS.map(a => (
                <button
                  type="button"
                  key={a.id}
                  className={assets.includes(a.id) ? 'option selected' : 'option'}
                  onClick={() => setAssets(toggle(assets, a.id))}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1>What type of investor are you?</h1>
            <div className="options">
              {INVESTOR_TYPES.map(t => (
                <button
                  type="button"
                  key={t}
                  className={investorType === t ? 'option selected' : 'option'}
                  onClick={() => setInvestorType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1>What content do you want to see?</h1>
            <div className="options">
              {CONTENT_TYPES.map(c => (
                <button
                  type="button"
                  key={c}
                  className={contentTypes.includes(c) ? 'option selected' : 'option'}
                  onClick={() => setContentTypes(toggle(contentTypes, c))}
                >
                  {c}
                </button>
              ))}
            </div>
          </>
        )}

        {error && <p className="error">{error}</p>}

        <div className="nav-buttons">
          {step > 0 && (
            <button type="button" className="secondary" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          {step < 2 ? (
            <button type="button" disabled={!canContinue} onClick={() => setStep(step + 1)}>
              Next
            </button>
          ) : (
            <button type="button" disabled={!canContinue || submitting} onClick={finish}>
              {submitting ? 'Saving...' : 'Finish'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
