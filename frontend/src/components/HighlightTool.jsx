import { useState } from 'react'

// This lets teacher highlight text in different colors
export function HighlightTool({ onHighlight, socket }) {
  const [selectedColor, setSelectedColor] = useState('yellow')
  const [selectedText, setSelectedText] = useState('')

  const colors = [
    { name: 'yellow', hex: '#FFEB3B', label: 'Yellow' },
    { name: 'green', hex: '#4CAF50', label: 'Green' },
    { name: 'blue', hex: '#2196F3', label: 'Blue' },
    { name: 'red', hex: '#F44336', label: 'Red' }
  ]

  const handleHighlight = (text) => {
    setSelectedText(text)
    
    // Emit to backend via WebSocket
    if (socket) {
      socket.emit('highlight-text', {
        studyId: 'test-study', // Later: get from URL
        text: text,
        color: selectedColor
      })
    }

    // call parent component callback
    onHighlight({
      text: text,
      color: selectedColor
    })
  }

  return (
    <div className="highlight-tool">
      <h3>Highlight Colors</h3>
      <div className="color-palette">
        {colors.map(color => (
          <button
            key={color.name}
            className={`color-button ${selectedColor === color.name ? 'active' : ''}`}
            style={{ backgroundColor: color.hex }}
            onClick={() => setSelectedColor(color.name)}
            title={color.label}
          />
        ))}
      </div>
      
      {selectedText && (
        <div className="highlight-preview">
          <p>Selected: <span style={{ backgroundColor: colors.find(c => c.name === selectedColor)?.hex }}>
            {selectedText}
          </span></p>
        </div>
      )}
    </div>
  )
}