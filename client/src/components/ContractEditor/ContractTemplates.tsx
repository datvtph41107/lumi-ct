import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileAlt, 
  faDownload, 
  faEye,
  faCheck
} from '@fortawesome/free-solid-svg-icons';

import { ContractType, ContractTemplate } from '../../types/contract';
import './ContractTemplates.scss';

interface ContractTemplatesProps {
  contractType: ContractType;
  onTemplateSelect: (template: ContractTemplate) => void;
  selectedTemplate: ContractTemplate | null;
}

const ContractTemplates: React.FC<ContractTemplatesProps> = ({
  contractType,
  onTemplateSelect,
  selectedTemplate
}) => {
  const templates: ContractTemplate[] = [
    {
      id: 'employment-standard',
      name: 'Standard Employment Contract',
      description: 'Basic employment contract with standard terms and conditions',
      category: 'employment',
      content: `
        <h1>EMPLOYMENT CONTRACT</h1>
        <p><strong>This Employment Contract</strong> (the "Contract") is entered into on [DATE] between:</p>
        
        <h2>EMPLOYER:</h2>
        <p>[COMPANY NAME]<br>
        [ADDRESS]<br>
        [CITY, STATE, ZIP]</p>
        
        <h2>EMPLOYEE:</h2>
        <p>[EMPLOYEE NAME]<br>
        [ADDRESS]<br>
        [CITY, STATE, ZIP]</p>
        
        <h2>1. POSITION AND DUTIES</h2>
        <p>The Employee shall serve as [JOB TITLE] and shall perform all duties and responsibilities associated with this position.</p>
        
        <h2>2. TERM OF EMPLOYMENT</h2>
        <p>This Contract shall commence on [START DATE] and shall continue until terminated by either party in accordance with the terms herein.</p>
        
        <h2>3. COMPENSATION</h2>
        <p>The Employee shall receive a salary of [SALARY AMOUNT] per [PAYMENT PERIOD], payable in accordance with the Company's standard payroll practices.</p>
        
        <h2>4. WORK SCHEDULE</h2>
        <p>The Employee shall work [NUMBER] hours per week, typically from [START TIME] to [END TIME], Monday through Friday.</p>
        
        <h2>5. BENEFITS</h2>
        <p>The Employee shall be eligible for all benefits provided to full-time employees, including health insurance, paid time off, and retirement benefits.</p>
        
        <h2>6. TERMINATION</h2>
        <p>Either party may terminate this Contract with [NOTICE PERIOD] written notice to the other party.</p>
        
        <p><strong>IN WITNESS WHEREOF</strong>, the parties have executed this Contract as of the date first above written.</p>
        
        <p><strong>EMPLOYER:</strong><br>
        [SIGNATURE]<br>
        [NAME]<br>
        [TITLE]<br>
        [DATE]</p>
        
        <p><strong>EMPLOYEE:</strong><br>
        [SIGNATURE]<br>
        [NAME]<br>
        [DATE]</p>
      `,
      tags: ['employment', 'standard', 'full-time'],
      createdAt: '2024-01-01'
    },
    {
      id: 'employment-executive',
      name: 'Executive Employment Contract',
      description: 'Executive-level employment contract with advanced benefits and terms',
      category: 'employment',
      content: `
        <h1>EXECUTIVE EMPLOYMENT CONTRACT</h1>
        <p><strong>This Executive Employment Contract</strong> (the "Contract") is entered into on [DATE] between:</p>
        
        <h2>COMPANY:</h2>
        <p>[COMPANY NAME]<br>
        [ADDRESS]<br>
        [CITY, STATE, ZIP]</p>
        
        <h2>EXECUTIVE:</h2>
        <p>[EXECUTIVE NAME]<br>
        [ADDRESS]<br>
        [CITY, STATE, ZIP]</p>
        
        <h2>1. EXECUTIVE POSITION</h2>
        <p>The Executive shall serve as [EXECUTIVE TITLE] and shall have full authority and responsibility for [DEPARTMENT/AREA].</p>
        
        <h2>2. TERM AND RENEWAL</h2>
        <p>This Contract shall have an initial term of [NUMBER] years, automatically renewable for successive [NUMBER]-year terms unless terminated by either party.</p>
        
        <h2>3. COMPENSATION PACKAGE</h2>
        <p><strong>Base Salary:</strong> [AMOUNT] per year<br>
        <strong>Annual Bonus:</strong> Up to [PERCENTAGE]% of base salary based on performance<br>
        <strong>Equity:</strong> [NUMBER] shares of company stock<br>
        <strong>Benefits:</strong> Comprehensive health, dental, vision, and life insurance</p>
        
        <h2>4. DUTIES AND RESPONSIBILITIES</h2>
        <p>The Executive shall devote full business time and attention to the Company and shall not engage in any other business activities without prior written consent.</p>
        
        <h2>5. TERMINATION AND SEVERANCE</h2>
        <p>Upon termination without cause, the Executive shall receive [NUMBER] months of base salary and benefits as severance.</p>
        
        <p><strong>IN WITNESS WHEREOF</strong>, the parties have executed this Contract as of the date first above written.</p>
        
        <p><strong>COMPANY:</strong><br>
        [SIGNATURE]<br>
        [NAME]<br>
        [TITLE]<br>
        [DATE]</p>
        
        <p><strong>EXECUTIVE:</strong><br>
        [SIGNATURE]<br>
        [NAME]<br>
        [DATE]</p>
      `,
      tags: ['employment', 'executive', 'senior'],
      createdAt: '2024-01-01'
    },
    {
      id: 'service-agreement',
      name: 'Service Agreement Contract',
      description: 'Contract for service providers and contractors',
      category: 'service',
      content: `
        <h1>SERVICE AGREEMENT</h1>
        <p><strong>This Service Agreement</strong> (the "Agreement") is entered into on [DATE] between:</p>
        
        <h2>CLIENT:</h2>
        <p>[CLIENT NAME]<br>
        [ADDRESS]<br>
        [CITY, STATE, ZIP]</p>
        
        <h2>SERVICE PROVIDER:</h2>
        <p>[PROVIDER NAME]<br>
        [ADDRESS]<br>
        [CITY, STATE, ZIP]</p>
        
        <h2>1. SERVICES</h2>
        <p>The Service Provider shall provide the following services: [DESCRIPTION OF SERVICES]</p>
        
        <h2>2. TERM</h2>
        <p>This Agreement shall commence on [START DATE] and shall continue until [END DATE] or until terminated by either party.</p>
        
        <h2>3. COMPENSATION</h2>
        <p>The Client shall pay the Service Provider [AMOUNT] for the services rendered, payable [PAYMENT TERMS].</p>
        
        <h2>4. DELIVERABLES</h2>
        <p>The Service Provider shall deliver the following: [LIST OF DELIVERABLES]</p>
        
        <h2>5. TERMINATION</h2>
        <p>Either party may terminate this Agreement with [NOTICE PERIOD] written notice to the other party.</p>
        
        <p><strong>IN WITNESS WHEREOF</strong>, the parties have executed this Agreement as of the date first above written.</p>
        
        <p><strong>CLIENT:</strong><br>
        [SIGNATURE]<br>
        [NAME]<br>
        [TITLE]<br>
        [DATE]</p>
        
        <p><strong>SERVICE PROVIDER:</strong><br>
        [SIGNATURE]<br>
        [NAME]<br>
        [TITLE]<br>
        [DATE]</p>
      `,
      tags: ['service', 'agreement', 'contractor'],
      createdAt: '2024-01-01'
    },
    {
      id: 'lease-agreement',
      name: 'Lease Agreement Contract',
      description: 'Standard lease agreement for rental properties',
      category: 'lease',
      content: `
        <h1>LEASE AGREEMENT</h1>
        <p><strong>This Lease Agreement</strong> (the "Lease") is entered into on [DATE] between:</p>
        
        <h2>LANDLORD:</h2>
        <p>[LANDLORD NAME]<br>
        [ADDRESS]<br>
        [CITY, STATE, ZIP]</p>
        
        <h2>TENANT:</h2>
        <p>[TENANT NAME]<br>
        [ADDRESS]<br>
        [CITY, STATE, ZIP]</p>
        
        <h2>1. PREMISES</h2>
        <p>The Landlord hereby leases to the Tenant the premises located at: [PROPERTY ADDRESS]</p>
        
        <h2>2. TERM</h2>
        <p>This Lease shall commence on [START DATE] and shall continue for a term of [NUMBER] months, ending on [END DATE].</p>
        
        <h2>3. RENT</h2>
        <p>The Tenant shall pay monthly rent of [AMOUNT] due on the [DAY] of each month.</p>
        
        <h2>4. SECURITY DEPOSIT</h2>
        <p>The Tenant shall pay a security deposit of [AMOUNT] upon execution of this Lease.</p>
        
        <h2>5. USE OF PREMISES</h2>
        <p>The premises shall be used solely for residential purposes and shall not be used for any illegal or commercial activities.</p>
        
        <h2>6. MAINTENANCE</h2>
        <p>The Landlord shall be responsible for [LANDLORD RESPONSIBILITIES]. The Tenant shall be responsible for [TENANT RESPONSIBILITIES].</p>
        
        <p><strong>IN WITNESS WHEREOF</strong>, the parties have executed this Lease as of the date first above written.</p>
        
        <p><strong>LANDLORD:</strong><br>
        [SIGNATURE]<br>
        [NAME]<br>
        [DATE]</p>
        
        <p><strong>TENANT:</strong><br>
        [SIGNATURE]<br>
        [NAME]<br>
        [DATE]</p>
      `,
      tags: ['lease', 'rental', 'property'],
      createdAt: '2024-01-01'
    }
  ];

  const filteredTemplates = templates.filter(template => 
    template.category === contractType || contractType === 'all'
  );

  return (
    <div className="contract-templates">
      <div className="templates-header">
        <h4>Available Templates</h4>
        <p>Select a template to get started with your contract</p>
      </div>

      <div className="templates-list">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className={`template-item ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
            onClick={() => onTemplateSelect(template)}
          >
            <div className="template-header">
              <div className="template-icon">
                <FontAwesomeIcon icon={faFileAlt} />
              </div>
              <div className="template-info">
                <h5 className="template-name">{template.name}</h5>
                <p className="template-description">{template.description}</p>
              </div>
              {selectedTemplate?.id === template.id && (
                <div className="template-selected">
                  <FontAwesomeIcon icon={faCheck} />
                </div>
              )}
            </div>
            
            <div className="template-tags">
              {template.tags.map((tag) => (
                <span key={tag} className="template-tag">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="template-actions">
              <button
                className="template-action-btn preview-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle preview
                }}
                title="Preview Template"
              >
                <FontAwesomeIcon icon={faEye} />
                Preview
              </button>
              
              <button
                className="template-action-btn download-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle download
                }}
                title="Download Template"
              >
                <FontAwesomeIcon icon={faDownload} />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="no-templates">
          <p>No templates available for {contractType} contracts.</p>
        </div>
      )}
    </div>
  );
};

export default ContractTemplates;