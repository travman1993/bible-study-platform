import { useState } from 'react'

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
    
    if (socket) {
      socket.emit('highlight-text', {
        studyId: 'test-study',
        text: text,
        color: selectedColor,
        timestamp: new Date()
      })
      console.log(`📌 Highlighted: "${text}" in ${selectedColor}`)
    }

    onHighlight({
      text: text,
      color: selectedColor,
      timestamp: new Date()
    })
  }

  return (
    <div className="highlight-tool">
      <h3>✨ Highlight Colors</h3>
      <div className="color-palette">
        {colors.map(color => (
          <button
            key={color.name}
            className={`color-button ${selectedColor === color.name ? 'active' : ''}`}
            style={{ backgroundColor: color.hex }}
            onClick={() => setSelectedColor(color.name)}
            title={color.label}
            aria-label={`Select ${color.label}`}
          />
        ))}
      </div>
      
      {selectedText && (
        <div className="highlight-preview">
          <span>
            Selected: <strong>"{selectedText}"</strong>
          </span>
        </div>
      )}
    </div>
  )
}