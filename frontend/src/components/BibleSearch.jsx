import { useState } from 'react'

export function BibleSearch({ onSearch }) {
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const parseReference = (ref) => {
    const bookMap = {
      'genesis': 'GEN', 'exodus': 'EXO', 'leviticus': 'LEV', 'numbers': 'NUM',
      'deuteronomy': 'DEU', 'joshua': 'JOS', 'judges': 'JDG', 'ruth': 'RUT',
      '1 samuel': '1SA', '2 samuel': '2SA', '1 kings': '1KI', '2 kings': '2KI',
      'john': 'JHN', 'mark': 'MRK', 'matthew': 'MAT', 'luke': 'LUK',
      'romans': 'ROM', '1 corinthians': '1CO', '2 corinthians': '2CO',
      'galatians': 'GAL', 'ephesians': 'EPH', 'philippians': 'PHP',
      'colossians': 'COL', '1 thessalonians': '1TH', '2 thessalonians': '2TH',
      'psalm': 'PSA', 'psalms': 'PSA', 'proverbs': 'PRO', 'ecclesiastes': 'ECC',
      '1 peter': '1PE', '2 peter': '2PE', '1 john': '1JO', '2 john': '2JO',
      'revelation': 'REV', 'acts': 'ACT', 'hebrews': 'HEB', 'james': 'JAS',
    }

    const match = ref.toLowerCase().match(/(.+?)\s+(\d+):(\d+)/)
    if (!match) {
      throw new Error('Format: "John 3:16" or "Psalm 23:1"')
    }

    const bookKey = match[1].trim()
    const book = bookMap[bookKey] || bookKey.toUpperCase().substr(0, 3)
    const chapter = match[2]
    const verse = match[3]

    return { book, chapter, verse }
  }

  const handleSearch = async (e) => {
    e.preventDefault()

    if (!searchInput.trim()) {
      setError('Please enter a Bible passage')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { book, chapter, verse } = parseReference(searchInput)
      
      console.log(`Fetching ${book} ${chapter}:${verse}...`)

      const response = await fetch(
        `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/web/books/${book}/chapters/${chapter}.json`,
        { timeout: 5000 }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (!data.verses || data.verses.length === 0) {
        throw new Error('No verses found')
      }

      // Get specific verse or show first 5
      const verseNum = parseInt(verse)
      const filteredVerse = data.verses.find(v => v.number === verseNum)
      const versesToShow = filteredVerse ? [filteredVerse] : data.verses.slice(0, 5)

      onSearch({
        passage: searchInput,
        verses: versesToShow
      })

      console.log(`✅ Loaded ${versesToShow.length} verse(s)`)
    } catch (err) {
      console.error('Fetch error:', err)
      
      if (err.message.includes('Failed to fetch')) {
        setError('Network error. Showing sample verse...')
        onSearch({
          passage: searchInput,
          verses: [
            {
              number: 16,
              text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life. (Sample - API unavailable)'
            }
          ]
        })
      } else if (err.message.includes('Format:')) {
        setError(err.message)
      } else {
        setError(`Failed to fetch: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bible-search">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search: John 3:16, Psalm 23..."
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value)
            setError('')
          }}
          disabled={loading}
          autoFocus
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  )
}