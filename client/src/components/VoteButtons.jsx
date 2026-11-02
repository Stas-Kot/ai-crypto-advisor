export default function VoteButtons({ value, onVote }) {
  return (
    <div className="votes">
      <button
        type="button"
        className={value === 1 ? 'vote active-up' : 'vote'}
        onClick={() => onVote(1)}
        aria-label="Thumbs up"
      >
        👍
      </button>
      <button
        type="button"
        className={value === -1 ? 'vote active-down' : 'vote'}
        onClick={() => onVote(-1)}
        aria-label="Thumbs down"
      >
        👎
      </button>
    </div>
  );
}
