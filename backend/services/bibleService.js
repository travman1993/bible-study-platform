// backend/services/bibleService.js
const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 3600 });

class BibleService {
  async getPassage(reference) {
    // Check cache first
    const cached = cache.get(reference);
    if (cached) return cached;
    
    try {
      const [book, chapter, verse] = parseReference(reference);
      const response = await axios.get(
        `https://api.scripture.api/verses/${book}/${chapter}/${verse}`
      );
      
      const data = response.data;
      cache.set(reference, data);
      return data;
    } catch (err) {
      throw new Error(`Failed to fetch ${reference}: ${err.message}`);
    }
  }
  
  async searchPassage(query) {
    try {
      const response = await axios.get(
        'https://api.scripture.api/search',
        { params: { q: query } }
      );
      return response.data;
    } catch (err) {
      throw new Error(`Search failed: ${err.message}`);
    }
  }
}

function parseReference(ref) {
  // "John 3:16" -> ["JHN", "3", "16"]
  const match = ref.match(/(\w+)\s+(\d+):(\d+)/);
  if (!match) throw new Error('Invalid reference format');
  
  const bookMap = {
    'john': 'JHN',
    'mark': 'MRK',
    'matthew': 'MAT',
    'luke': 'LUK',
    // ... add all books
  };
  
  return [
    bookMap[match[1].toLowerCase()],
    match[2],
    match[3]
  ];
}

module.exports = new BibleService();