import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faFileAlt,
  faUsers,
  faCalendarAlt,
  faDollarSign,
  faShieldAlt,
  faGavel,
  faHandshake
} from '@fortawesome/free-solid-svg-icons';

import { ContractType } from '../../types/contract';
import './ContractStructure.scss';

interface ContractStructureProps {
  contractType: ContractType;
  onStructureInsert: (structure: string) => void;
}

const ContractStructure: React.FC<ContractStructureProps> = ({
  contractType,
  onStructureInsert
}) => {
  const commonStructures = [
    {
      id: 'header',
      name: 'Document Header',
      description: 'Standard contract header with title and date',
      icon: faFileAlt,
      content: `
        <h1 style="text-align: center; margin-bottom: 20px;">[CONTRACT TITLE]</h1>
        <p style="text-align: center; margin-bottom: 30px;">
          <strong>This [CONTRACT TYPE]</strong> (the "[DOCUMENT NAME]") is entered into on [DATE] between:
        </p>
      `
    },
    {
      id: 'parties',
      name: 'Parties Section',
      description: 'Section identifying all parties to the contract',
      icon: faUsers,
      content: `
        <h2 style="margin-top: 30px; margin-bottom: 15px;">PARTIES</h2>
        <div style="margin-bottom: 20px;">
          <h3 style="margin-bottom: 10px;">[PARTY TYPE 1]:</h3>
          <p>[PARTY NAME]<br>
          [ADDRESS]<br>
          [CITY, STATE, ZIP]</p>
        </div>
        <div style="margin-bottom: 20px;">
          <h3 style="margin-bottom: 10px;">[PARTY TYPE 2]:</h3>
          <p>[PARTY NAME]<br>
          [ADDRESS]<br>
          [CITY, STATE, ZIP]</p>
        </div>
      `
    },
    {
      id: 'recitals',
      name: 'Recitals',
      description: 'Background information and purpose of the contract',
      icon: faFileAlt,
      content: `
        <h2 style="margin-top: 30px; margin-bottom: 15px;">RECITALS</h2>
        <p><strong>WHEREAS</strong>, [BACKGROUND INFORMATION];</p>
        <p><strong>WHEREAS</strong>, [PURPOSE OF AGREEMENT];</p>
        <p><strong>NOW, THEREFORE</strong>, in consideration of the mutual promises and covenants contained herein, the parties agree as follows:</p>
      `
    },
    {
      id: 'definitions',
      name: 'Definitions',
      description: 'Key terms and definitions used in the contract',
      icon: faFileAlt,
      content: `
        <h2 style="margin-top: 30px; margin-bottom: 15px;">DEFINITIONS</h2>
        <p><strong>"[TERM]"</strong> means [DEFINITION].</p>
        <p><strong>"[TERM]"</strong> means [DEFINITION].</p>
        <p><strong>"[TERM]"</strong> means [DEFINITION].</p>
      `
    },
    {
      id: 'term',
      name: 'Term and Duration',
      description: 'Contract duration and renewal terms',
      icon: faCalendarAlt,
      content: `
        <h2 style="margin-top: 30px; margin-bottom: 15px;">TERM</h2>
        <p>This [CONTRACT TYPE] shall commence on [START DATE] and shall continue for a period of [DURATION] unless earlier terminated in accordance with the terms herein.</p>
        <p>This [CONTRACT TYPE] may be renewed for additional terms of [RENEWAL DURATION] upon mutual written agreement of the parties.</p>
      `
    },
    {
      id: 'compensation',
      name: 'Compensation',
      description: 'Payment terms and compensation structure',
      icon: faDollarSign,
      content: `
        <h2 style="margin-top: 30px; margin-bottom: 15px;">COMPENSATION</h2>
        <p>In consideration for the services provided, [PARTY] shall pay [OTHER PARTY] the following compensation:</p>
        <ul>
          <li><strong>Base Amount:</strong> [AMOUNT] per [PERIOD]</li>
          <li><strong>Additional Compensation:</strong> [DESCRIPTION]</li>
          <li><strong>Payment Terms:</strong> [PAYMENT SCHEDULE]</li>
        </ul>
      `
    },
    {
      id: 'obligations',
      name: 'Obligations',
      description: 'Duties and responsibilities of each party',
      icon: faHandshake,
      content: `
        <h2 style="margin-top: 30px; margin-bottom: 15px;">OBLIGATIONS</h2>
        <h3 style="margin-bottom: 10px;">[PARTY] Obligations:</h3>
        <ul>
          <li>[OBLIGATION 1]</li>
          <li>[OBLIGATION 2]</li>
          <li>[OBLIGATION 3]</li>
        </ul>
        <h3 style="margin-bottom: 10px;">[OTHER PARTY] Obligations:</h3>
        <ul>
          <li>[OBLIGATION 1]</li>
          <li>[OBLIGATION 2]</li>
          <li>[OBLIGATION 3]</li>
        </ul>
      `
    },
    {
      id: 'confidentiality',
      name: 'Confidentiality',
      description: 'Confidentiality and non-disclosure provisions',
      icon: faShieldAlt,
      content: `
        <h2 style="margin-top: 30px; margin-bottom: 15px;">CONFIDENTIALITY</h2>
        <p>Each party acknowledges that it may have access to confidential information of the other party. Each party agrees to:</p>
        <ul>
          <li>Maintain the confidentiality of such information</li>
          <li>Use such information solely for the purpose of performing its obligations under this agreement</li>
          <li>Not disclose such information to any third party without prior written consent</li>
        </ul>
        <p>This confidentiality obligation shall survive the termination of this agreement for a period of [DURATION] years.</p>
      `
    },
    {
      id: 'termination',
      name: 'Termination',
      description: 'Conditions and procedures for contract termination',
      icon: faGavel,
      content: `
        <h2 style="margin-top: 30px; margin-bottom: 15px;">TERMINATION</h2>
        <p>This [CONTRACT TYPE] may be terminated under the following circumstances:</p>
        <ul>
          <li><strong>By Mutual Agreement:</strong> Both parties may terminate this agreement by mutual written consent</li>
          <li><strong>For Cause:</strong> Either party may terminate this agreement immediately upon written notice if the other party breaches a material term</li>
          <li><strong>Without Cause:</strong> Either party may terminate this agreement with [NOTICE PERIOD] written notice</li>
        </ul>
      `
    },
    {
      id: 'signatures',
      name: 'Signatures',
      description: 'Signature block for all parties',
      icon: faHandshake,
      content: `
        <h2 style="margin-top: 30px; margin-bottom: 15px;">SIGNATURES</h2>
        <p style="margin-bottom: 30px;"><strong>IN WITNESS WHEREOF</strong>, the parties have executed this [CONTRACT TYPE] as of the date first above written.</p>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div style="flex: 1;">
            <p><strong>[PARTY 1]:</strong></p>
            <p>_________________________</p>
            <p>[NAME]<br>
            [TITLE]<br>
            [DATE]</p>
          </div>
          <div style="flex: 1;">
            <p><strong>[PARTY 2]:</strong></p>
            <p>_________________________</p>
            <p>[NAME]<br>
            [TITLE]<br>
            [DATE]</p>
          </div>
        </div>
      `
    }
  ];

  const employmentSpecificStructures = [
    {
      id: 'job-description',
      name: 'Job Description',
      description: 'Detailed job duties and responsibilities',
      icon: faUsers,
      content: `
        <h2 style="margin-top: 30px; margin-bottom: 15px;">JOB DESCRIPTION</h2>
        <p>The Employee shall serve as [JOB TITLE] and shall perform the following duties and responsibilities:</p>
        <ul>
          <li>[DUTY 1]</li>
          <li>[DUTY 2]</li>
          <li>[DUTY 3]</li>
          <li>[DUTY 4]</li>
        </ul>
        <p>The Employee shall report directly to [SUPERVISOR] and shall perform such other duties as may be assigned from time to time.</p>
      `
    },
    {
      id: 'work-schedule',
      name: 'Work Schedule',
      description: 'Working hours and schedule requirements',
      icon: faCalendarAlt,
      content: `
        <h2 style="margin-top: 30px; margin-bottom: 15px;">WORK SCHEDULE</h2>
        <p>The Employee shall work [NUMBER] hours per week, typically from [START TIME] to [END TIME], Monday through Friday.</p>
        <p>The Employee acknowledges that the nature of the position may require occasional work outside of normal business hours, including evenings and weekends.</p>
        <p>Overtime compensation shall be provided in accordance with applicable labor laws.</p>
      `
    },
    {
      id: 'benefits',
      name: 'Employee Benefits',
      description: 'Benefits package and eligibility',
      icon: faDollarSign,
      content: `
        <h2 style="margin-top: 30px; margin-bottom: 15px;">BENEFITS</h2>
        <p>The Employee shall be eligible for the following benefits:</p>
        <ul>
          <li><strong>Health Insurance:</strong> [DESCRIPTION]</li>
          <li><strong>Dental Insurance:</strong> [DESCRIPTION]</li>
          <li><strong>Vision Insurance:</strong> [DESCRIPTION]</li>
          <li><strong>Paid Time Off:</strong> [NUMBER] days per year</li>
          <li><strong>Retirement Plan:</strong> [DESCRIPTION]</li>
          <li><strong>Other Benefits:</strong> [DESCRIPTION]</li>
        </ul>
        <p>Benefits shall commence on [START DATE] and shall be subject to the terms and conditions of the applicable benefit plans.</p>
      `
    }
  ];

  const serviceSpecificStructures = [
    {
      id: 'services-scope',
      name: 'Services Scope',
      description: 'Detailed description of services to be provided',
      icon: faFileAlt,
      content: `
        <h2 style="margin-top: 30px; margin-bottom: 15px;">SERVICES</h2>
        <p>The Service Provider shall provide the following services:</p>
        <h3 style="margin-bottom: 10px;">[SERVICE CATEGORY 1]:</h3>
        <ul>
          <li>[SERVICE 1]</li>
          <li>[SERVICE 2]</li>
          <li>[SERVICE 3]</li>
        </ul>
        <h3 style="margin-bottom: 10px;">[SERVICE CATEGORY 2]:</h3>
        <ul>
          <li>[SERVICE 1]</li>
          <li>[SERVICE 2]</li>
          <li>[SERVICE 3]</li>
        </ul>
      `
    },
    {
      id: 'deliverables',
      name: 'Deliverables',
      description: 'Specific deliverables and milestones',
      icon: faFileAlt,
      content: `
        <h2 style="margin-top: 30px; margin-bottom: 15px;">DELIVERABLES</h2>
        <p>The Service Provider shall deliver the following:</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Deliverable</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Description</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Due Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">[DELIVERABLE 1]</td>
              <td style="border: 1px solid #ddd; padding: 8px;">[DESCRIPTION]</td>
              <td style="border: 1px solid #ddd; padding: 8px;">[DATE]</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">[DELIVERABLE 2]</td>
              <td style="border: 1px solid #ddd; padding: 8px;">[DESCRIPTION]</td>
              <td style="border: 1px solid #ddd; padding: 8px;">[DATE]</td>
            </tr>
          </tbody>
        </table>
      `
    }
  ];

  const leaseSpecificStructures = [
    {
      id: 'premises',
      name: 'Premises Description',
      description: 'Detailed description of leased property',
      icon: faFileAlt,
      content: `
        <h2 style="margin-top: 30px; margin-bottom: 15px;">PREMISES</h2>
        <p>The Landlord hereby leases to the Tenant the premises located at:</p>
        <p><strong>Address:</strong> [PROPERTY ADDRESS]<br>
        <strong>Property Type:</strong> [RESIDENTIAL/COMMERCIAL]<br>
        <strong>Square Footage:</strong> [AREA]<br>
        <strong>Unit Number:</strong> [UNIT]</p>
        <p>The premises include the following amenities: [LIST OF AMENITIES]</p>
      `
    },
    {
      id: 'rent-terms',
      name: 'Rent and Payment Terms',
      description: 'Rent amount and payment schedule',
      icon: faDollarSign,
      content: `
        <h2 style="margin-top: 30px; margin-bottom: 15px;">RENT AND PAYMENT TERMS</h2>
        <p><strong>Monthly Rent:</strong> [AMOUNT] per month</p>
        <p><strong>Due Date:</strong> Rent is due on the [DAY] of each month</p>
        <p><strong>Late Fee:</strong> A late fee of [AMOUNT] will be charged if rent is not received within [NUMBER] days of the due date</p>
        <p><strong>Payment Method:</strong> [PAYMENT METHODS ACCEPTED]</p>
        <p><strong>Security Deposit:</strong> [AMOUNT] due upon execution of this lease</p>
      `
    }
  ];

  const getStructures = () => {
    let structures = [...commonStructures];
    
    switch (contractType) {
      case 'employment':
        structures = [...structures, ...employmentSpecificStructures];
        break;
      case 'service':
        structures = [...structures, ...serviceSpecificStructures];
        break;
      case 'lease':
        structures = [...structures, ...leaseSpecificStructures];
        break;
      default:
        break;
    }
    
    return structures;
  };

  const structures = getStructures();

  return (
    <div className="contract-structure">
      <div className="structure-header">
        <h4>Contract Structure</h4>
        <p>Insert standard contract sections and clauses</p>
      </div>

      <div className="structure-list">
        {structures.map((structure) => (
          <div
            key={structure.id}
            className="structure-item"
            onClick={() => onStructureInsert(structure.content)}
          >
            <div className="structure-icon">
              <FontAwesomeIcon icon={structure.icon} />
            </div>
            <div className="structure-info">
              <h5 className="structure-name">{structure.name}</h5>
              <p className="structure-description">{structure.description}</p>
            </div>
            <div className="structure-action">
              <button
                className="insert-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onStructureInsert(structure.content);
                }}
                title="Insert Structure"
              >
                <FontAwesomeIcon icon={faPlus} />
                Insert
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="structure-tips">
        <h5>Tips for Contract Structure:</h5>
        <ul>
          <li>Always start with clear identification of parties</li>
          <li>Include specific terms and conditions</li>
          <li>Define key terms and definitions</li>
          <li>Specify payment terms clearly</li>
          <li>Include termination and dispute resolution clauses</li>
          <li>End with proper signature blocks</li>
        </ul>
      </div>
    </div>
  );
};

export default ContractStructure;