export function BibleDisplay({ passage = 'John 3:16', verses = [], highlights = [] }) {
  
    // check if a word is highlighted
    const isHighlighted = (text) => {
      return highlights.some(h => h.text.includes(text))
    }
  
    return (
      <div className="bible-display">
        <div className="passage-header">
          <h2>{passage}</h2>
        </div>
  
        <div className="verses-container">
          {verses.length > 0 ? (
            verses.map((verse, idx) => (
              <div key={idx} className="verse">
                <span className="verse-number">{verse.number}</span>
                <span className="verse-text">{verse.text}</span>
              </div>
            ))
          ) : (
            <p className="placeholder">Search for a Bible passage to get started</p>
          )}
        </div>
      </div>
    )
  }