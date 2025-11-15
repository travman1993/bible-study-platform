import { useState } from 'react'

// This is the search box where teacher types "John 3:16"
export function BibleSearch({ onSearch }) {
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!searchInput.trim()) {
      setError('Please enter a Bible passage')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Call the free Bible API
      const response = await fetch(
        `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/web/books/JHN/chapters/3.json`
      )
      const data = await response.json()
      
      // send back the chapter
      // Later parse the specific verse
      onSearch({
        passage: searchInput,
        verses: data.verses
      })
    } catch (err) {
      setError('Failed to fetch Bible passage. Try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bible-search">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search: John 3:16, Psalm 23, etc."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  )
}