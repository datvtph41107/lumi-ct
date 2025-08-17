import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileAlt, 
  faSitemap, 
  faLightbulb,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';

import './EditorSidebar.scss';

interface EditorSidebarProps {
  activeTab: 'templates' | 'structure' | 'suggestions';
  onTabChange: (tab: 'templates' | 'structure' | 'suggestions') => void;
  contractType: string;
  children: React.ReactNode;
}

const EditorSidebar: React.FC<EditorSidebarProps> = ({
  activeTab,
  onTabChange,
  contractType,
  children
}) => {
  const tabs = [
    {
      id: 'templates',
      label: 'Templates',
      icon: faFileAlt,
      description: 'Contract templates'
    },
    {
      id: 'structure',
      label: 'Structure',
      icon: faSitemap,
      description: 'Contract structure'
    },
    {
      id: 'suggestions',
      label: 'Suggestions',
      icon: faLightbulb,
      description: 'Text suggestions'
    }
  ];

  return (
    <div className="editor-sidebar">
      <div className="sidebar-header">
        <h3>Contract Tools</h3>
        <div className="contract-type-badge">
          {contractType.charAt(0).toUpperCase() + contractType.slice(1)} Contract
        </div>
      </div>

      <div className="sidebar-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id as 'templates' | 'structure' | 'suggestions')}
          >
            <div className="tab-icon">
              <FontAwesomeIcon icon={tab.icon} />
            </div>
            <div className="tab-content">
              <div className="tab-label">{tab.label}</div>
              <div className="tab-description">{tab.description}</div>
            </div>
            <div className="tab-arrow">
              <FontAwesomeIcon icon={faChevronRight} />
            </div>
          </button>
        ))}
      </div>

      <div className="sidebar-content">
        {children}
      </div>
    </div>
  );
};

export default EditorSidebar;