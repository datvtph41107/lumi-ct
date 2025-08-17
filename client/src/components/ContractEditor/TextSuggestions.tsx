import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLightbulb, 
  faPlus,
  faSearch,
  faFilter,
  faStar
} from '@fortawesome/free-solid-svg-icons';

import { ContractType } from '../../types/contract';
import './TextSuggestions.scss';

interface TextSuggestionsProps {
  contractType: ContractType;
  onSuggestionInsert: (suggestion: string) => void;
}

interface Suggestion {
  id: string;
  text: string;
  category: string;
  tags: string[];
  usage: number;
  isFavorite: boolean;
}

const TextSuggestions: React.FC<TextSuggestionsProps> = ({
  contractType,
  onSuggestionInsert
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFavorites, setShowFavorites] = useState(false);

  const suggestions: Suggestion[] = [
    // Common Legal Phrases
    {
      id: 'whereas',
      text: 'WHEREAS, the parties desire to enter into this agreement for their mutual benefit;',
      category: 'legal-phrases',
      tags: ['whereas', 'recitals', 'preamble'],
      usage: 150,
      isFavorite: true
    },
    {
      id: 'now-therefore',
      text: 'NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the parties agree as follows:',
      category: 'legal-phrases',
      tags: ['agreement', 'consideration', 'covenants'],
      usage: 120,
      isFavorite: true
    },
    {
      id: 'in-witness-whereof',
      text: 'IN WITNESS WHEREOF, the parties have executed this agreement as of the date first above written.',
      category: 'legal-phrases',
      tags: ['signature', 'execution', 'closing'],
      usage: 200,
      isFavorite: true
    },
    {
      id: 'subject-to',
      text: 'Subject to the terms and conditions set forth herein, [PARTY] agrees to [ACTION].',
      category: 'legal-phrases',
      tags: ['conditions', 'terms', 'agreement'],
      usage: 80,
      isFavorite: false
    },

    // Employment Specific
    {
      id: 'employment-duties',
      text: 'The Employee shall perform all duties and responsibilities associated with the position of [JOB TITLE] and such other duties as may be assigned from time to time by the Employer.',
      category: 'employment',
      tags: ['duties', 'responsibilities', 'job description'],
      usage: 95,
      isFavorite: false
    },
    {
      id: 'employment-termination',
      text: 'Either party may terminate this employment relationship with [NUMBER] days written notice to the other party.',
      category: 'employment',
      tags: ['termination', 'notice', 'employment'],
      usage: 110,
      isFavorite: false
    },
    {
      id: 'employment-benefits',
      text: 'The Employee shall be eligible for all benefits provided to full-time employees, including health insurance, paid time off, and retirement benefits, subject to the terms and conditions of the applicable benefit plans.',
      category: 'employment',
      tags: ['benefits', 'health insurance', 'paid time off'],
      usage: 75,
      isFavorite: false
    },
    {
      id: 'employment-schedule',
      text: 'The Employee shall work [NUMBER] hours per week, typically from [START TIME] to [END TIME], Monday through Friday, with such additional hours as may be required to fulfill the Employee\'s duties.',
      category: 'employment',
      tags: ['work schedule', 'hours', 'duties'],
      usage: 60,
      isFavorite: false
    },

    // Service Agreement Specific
    {
      id: 'service-scope',
      text: 'The Service Provider shall provide the following services: [DESCRIPTION OF SERVICES]. The scope of services may be modified by mutual written agreement of the parties.',
      category: 'service',
      tags: ['services', 'scope', 'modification'],
      usage: 85,
      isFavorite: false
    },
    {
      id: 'service-deliverables',
      text: 'The Service Provider shall deliver the following deliverables: [LIST OF DELIVERABLES]. All deliverables shall be subject to the Client\'s approval and acceptance.',
      category: 'service',
      tags: ['deliverables', 'approval', 'acceptance'],
      usage: 70,
      isFavorite: false
    },
    {
      id: 'service-payment',
      text: 'The Client shall pay the Service Provider [AMOUNT] for the services rendered, payable [PAYMENT TERMS]. Payment shall be due within [NUMBER] days of receipt of invoice.',
      category: 'service',
      tags: ['payment', 'compensation', 'invoice'],
      usage: 90,
      isFavorite: false
    },

    // Lease Specific
    {
      id: 'lease-premises',
      text: 'The Landlord hereby leases to the Tenant the premises located at [PROPERTY ADDRESS], together with all improvements and appurtenances thereto.',
      category: 'lease',
      tags: ['premises', 'property', 'improvements'],
      usage: 65,
      isFavorite: false
    },
    {
      id: 'lease-term',
      text: 'This lease shall commence on [START DATE] and shall continue for a term of [NUMBER] months, ending on [END DATE], unless earlier terminated in accordance with the terms herein.',
      category: 'lease',
      tags: ['term', 'duration', 'termination'],
      usage: 55,
      isFavorite: false
    },
    {
      id: 'lease-rent',
      text: 'The Tenant shall pay monthly rent of [AMOUNT] due on the [DAY] of each month. Rent shall be paid in advance without demand, deduction, or offset.',
      category: 'lease',
      tags: ['rent', 'payment', 'monthly'],
      usage: 80,
      isFavorite: false
    },

    // General Contract Clauses
    {
      id: 'confidentiality',
      text: 'Each party acknowledges that it may have access to confidential information of the other party and agrees to maintain the confidentiality of such information and not to disclose it to any third party without prior written consent.',
      category: 'general',
      tags: ['confidentiality', 'non-disclosure', 'privacy'],
      usage: 100,
      isFavorite: false
    },
    {
      id: 'force-majeure',
      text: 'Neither party shall be liable for any delay or failure to perform its obligations under this agreement due to circumstances beyond its reasonable control, including but not limited to acts of God, natural disasters, or government actions.',
      category: 'general',
      tags: ['force majeure', 'delay', 'performance'],
      usage: 45,
      isFavorite: false
    },
    {
      id: 'governing-law',
      text: 'This agreement shall be governed by and construed in accordance with the laws of the State of [STATE], without regard to its conflict of laws principles.',
      category: 'general',
      tags: ['governing law', 'jurisdiction', 'state law'],
      usage: 70,
      isFavorite: false
    },
    {
      id: 'dispute-resolution',
      text: 'Any disputes arising out of or relating to this agreement shall be resolved through binding arbitration in accordance with the rules of [ARBITRATION ORGANIZATION], with the venue being [CITY, STATE].',
      category: 'general',
      tags: ['dispute resolution', 'arbitration', 'venue'],
      usage: 55,
      isFavorite: false
    },
    {
      id: 'amendment',
      text: 'This agreement may be amended only by a written instrument signed by both parties. No oral modifications or waivers shall be binding.',
      category: 'general',
      tags: ['amendment', 'modification', 'written'],
      usage: 65,
      isFavorite: false
    },
    {
      id: 'severability',
      text: 'If any provision of this agreement is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.',
      category: 'general',
      tags: ['severability', 'validity', 'enforceability'],
      usage: 50,
      isFavorite: false
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories', count: suggestions.length },
    { id: 'legal-phrases', name: 'Legal Phrases', count: suggestions.filter(s => s.category === 'legal-phrases').length },
    { id: 'employment', name: 'Employment', count: suggestions.filter(s => s.category === 'employment').length },
    { id: 'service', name: 'Service', count: suggestions.filter(s => s.category === 'service').length },
    { id: 'lease', name: 'Lease', count: suggestions.filter(s => s.category === 'lease').length },
    { id: 'general', name: 'General', count: suggestions.filter(s => s.category === 'general').length }
  ];

  const filteredSuggestions = suggestions.filter(suggestion => {
    const matchesSearch = suggestion.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suggestion.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || suggestion.category === selectedCategory;
    const matchesFavorites = !showFavorites || suggestion.isFavorite;
    
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  const toggleFavorite = (suggestionId: string) => {
    // In a real app, this would update the suggestion in the database
    console.log('Toggle favorite for:', suggestionId);
  };

  const sortedSuggestions = [...filteredSuggestions].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return b.usage - a.usage;
  });

  return (
    <div className="text-suggestions">
      <div className="suggestions-header">
        <h4>Text Suggestions</h4>
        <p>Common legal phrases and contract language</p>
      </div>

      <div className="suggestions-controls">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search suggestions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="controls-right">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>

          <button
            className={`favorites-toggle ${showFavorites ? 'active' : ''}`}
            onClick={() => setShowFavorites(!showFavorites)}
            title="Show Favorites Only"
          >
            <FontAwesomeIcon icon={faStar} />
          </button>
        </div>
      </div>

      <div className="suggestions-list">
        {sortedSuggestions.map((suggestion) => (
          <div key={suggestion.id} className="suggestion-item">
            <div className="suggestion-header">
              <div className="suggestion-category">
                {categories.find(c => c.id === suggestion.category)?.name}
              </div>
              <div className="suggestion-actions">
                <button
                  className={`favorite-btn ${suggestion.isFavorite ? 'active' : ''}`}
                  onClick={() => toggleFavorite(suggestion.id)}
                  title={suggestion.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <FontAwesomeIcon icon={faStar} />
                </button>
                <button
                  className="insert-btn"
                  onClick={() => onSuggestionInsert(suggestion.text)}
                  title="Insert Suggestion"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Insert
                </button>
              </div>
            </div>
            
            <div className="suggestion-text">
              {suggestion.text}
            </div>
            
            <div className="suggestion-footer">
              <div className="suggestion-tags">
                {suggestion.tags.map((tag) => (
                  <span key={tag} className="suggestion-tag">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="suggestion-usage">
                Used {suggestion.usage} times
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedSuggestions.length === 0 && (
        <div className="no-suggestions">
          <FontAwesomeIcon icon={faLightbulb} className="no-suggestions-icon" />
          <p>No suggestions found matching your criteria.</p>
          <p>Try adjusting your search terms or category filter.</p>
        </div>
      )}

      <div className="suggestions-tips">
        <h5>Tips for Using Suggestions:</h5>
        <ul>
          <li>Click the star icon to mark frequently used suggestions as favorites</li>
          <li>Use the search to find specific legal phrases or terms</li>
          <li>Filter by category to focus on relevant suggestions</li>
          <li>Customize inserted text to match your specific contract needs</li>
          <li>Combine multiple suggestions to build comprehensive contract sections</li>
        </ul>
      </div>
    </div>
  );
};

export default TextSuggestions;