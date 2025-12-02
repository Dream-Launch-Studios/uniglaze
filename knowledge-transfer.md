Project Context & Background
Client Background
Company: Unique Laser - Construction glass work specialists
Current Pain Points:
Caught up in multiple WhatsApp groups
Lost in mail threads
Need centralized system for project management
Offline project managers dealing with glass installation projects (hotels, buildings)
Organizational Structure
CEO (Aditya) - Top level
Head Of Planning (Vamsi) - Middle management
Project Managers (10+ people) - On-site level
Login System: Microsoft Teams database integration
User Role Definitions & Permissions
CEO & Head Of Planning (Aditya & Vamsi)
Access Level: Full CRUD operations
Capabilities:
Create new projects
Set up initial data
View project history
Approve/reject PM reports
Create new user logins
Create new PM accounts
Project Managers (On-site level)
Access Level: Read + Data entry only
Capabilities:
View assigned projects
Daily data entry (yesterday's work only)
Photo uploads
Blockage reporting
Submit daily reports
System Architecture & Technical Requirements
Preferred Technology Stack
Cloud Platform: AWS-based deployment
Database: DynamoDB (client CTO recommendation)
File Storage: Amazon S3 for images
Authentication: Role-based login system
Deployment: Dockerized containers
PDF Generation: Required for reports
Technical Considerations
Device Support:
Management: Desktop/laptop usage
Field workers: Mobile phones and tablets
Network Considerations: Handle low-quality internet on construction sites
Real-time Updates: Not required - daily updates sufficient
External Services: Discussion needed for third-party database services
Detailed System Workflow
Phase 1: Project Creation (CEO/Head Of Planning)
Step 1: Initial Project Setup
Login with role-based credentials
Create new project
Fill client details
Set up client communication preferences (email/internal)
Add Microsoft Teams meeting link for project coordination
Step 2: UI1 - Main Project Structure
Table Structure:
Serial Number
Item (e.g., UCW, Strip Glazing, Railing)
UOM (UOM) - e.g., "panel" for UCW
Total quantity
Cumulative Supplied (default: 0)
Cumulative Installed (default: 0)
Yet to be Supply
Yet to be Installed
Percentage of Installation
Percentage of Supply
Process:
Fill in all project items and quantities
Text input for item names
Number input for quantities
Preview table before confirmation
Confirm and proceed to detailed breakdown
Step 3: UI2 - Detailed Item Breakdown
Structure:
Each item from UI1 gets expanded into sub-items
Modular breakdown with detailed work descriptions
Same measurement units as main tasks
Detailed work allocation for each sub-component
Example: UCW might have 6 sub-works with individual tracking
Step 4: PM Assignment
Assign specific project managers to projects
Set access permissions for assigned PMs
Phase 2: Daily Operations (Project Managers)
Login & Project Access
Role-based login validation
If no project assigned: Display "not assigned" message
If assigned: Access project dashboard with assigned tasks
Daily Data Entry Process
Timing Restrictions:
Morning entry only (10-11 AM suggested)
Data entry for previous day's work only
Reason: Photo uploads need proper lighting
For Each Project Item:
Yesterday's Progress Entry:
Yesterday Supplied (quantity)
Yesterday Installed (quantity)
Progress Photos:
Up to 4 photos per item (North, South, East, West orientations)
Camera access directly from web app
Gallery upload option
Photo upload form includes:
Location name
Description
Photo attachment
Opening date (auto: today)
Close date (initially undefined)
Blockage Reporting:
Client-side Blockages:
Text description
Photo attachment
Location details
Issue description
Internal/Company-side Blockages:
Text description
Photo attachment
Internal issue details
Blockage Management:
Auto-generated creation date
Mark as resolved/unresolved
Blockage logs tracking
Daily Report Submission
Complete all items for the day
Final preview of all entered data
Submit button appears after all items completed
System generates comprehensive daily report
Phase 3: Approval Workflow
Report Generation
PDF Report Contents:
Sheet 1 data (main project structure)
Sheet 2 data (detailed breakdowns)
Bar graphs showing installation percentages
Progress photos
Blockage reports (filtered by recipient)
Approval Process
Submission: PM submits daily report
Notification: Email sent to CEO & Head Of Planning
Review: Management reviews PDF report on dashboard
Decision: Approve or reject report
Final Distribution: Upon approval, automated emails sent
Email Distribution Logic
Internal Team Email:
Complete report with all blockages
Client-facing AND internal blockages included
Full project status
Client Email:
Client-facing information only
Internal blockages filtered out
Professional presentation
User Interface Requirements
Dashboard Features
Management Dashboard:
Project history view
Current project status
Approval queue
Team management
Microsoft Teams integration button
PM Dashboard:
Assigned project view
Daily task checklist
Progress tracking
Photo upload interface
Blockage reporting
Form Structures
Project Creation Forms: Multi-step with validation
Daily Entry Forms: Item-by-item progression
Photo Upload Forms: Location + description + file
Blockage Forms: Category-specific with rich text
Technical Implementation Considerations
Authentication & Security
Role-based access control
Microsoft Teams integration
Secure file upload handling
Data privacy for client/internal separation
Performance & Scalability
Handle multiple concurrent users
Efficient image storage and retrieval
PDF generation optimization
Mobile responsiveness
Error Handling
Network connectivity issues on construction sites
File upload failures
Data validation
Graceful degradation
Project Management Structure
Development Approach
Sprint Structure: 3 one-week sprints
Communication: Daily standups via internal group
Progress Tracking: Linear ticket system
Quality Assurance: Ticket-based acceptance criteria
Team Responsibilities
Harshil: Client communication, requirement clarification
Ishar: Project management, PRD creation, technical oversight
Sadak: Development implementation
Wasim: Internal management, escalation handling
Communication Protocols
Daily Updates: Morning standup format
Issue Escalation: Direct communication to management
Client Communication: Through Harshil only
Technical Issues: Expected and supported
Performance Standards: 4-hour daily commitment minimum
Deliverables & Timeline
Core Features
User Authentication System
Project Creation Interface
Daily Data Entry System
Photo Upload & Management
Blockage Reporting System
PDF Report Generation
Approval Workflow
Email Distribution System
Dashboard Views
Microsoft Teams Integration
Technical Deliverables
Frontend: Responsive web application
Backend: RESTful API services
Database: Data models and relationships
File Storage: Image management system
Deployment: Dockerized AWS deployment
Documentation: Technical and user documentation
Risk Factors & Mitigation
Technical Risks
AWS Account Setup: Client needs to provide AWS credentials
DynamoDB Learning Curve: Team needs expertise
PDF Generation: Complex reporting requirements
Mobile Responsiveness: Multi-device support needed
Operational Risks
Network Connectivity: Construction site limitations
User Adoption: Non-technical user base
Data Privacy: Client/internal data separation
Performance: Real-time vs. daily update balance
Success Metrics
Functional Success
Successful project creation and management
Daily data entry completion rates
Photo upload success rates
Report generation accuracy
Approval workflow efficiency
Technical Success
System uptime and reliability
Mobile performance optimization
PDF generation speed
Email delivery success rates
User authentication stability
Next Steps
Immediate Actions
PRD Finalization: Ishar to create detailed PRD from meeting notes
Architecture Review: Team to finalize AWS architecture
AWS Setup: Harshil to coordinate client AWS account
Sprint Planning: Create Linear tickets with acceptance criteria
Development Environment: Setup development infrastructure
Communication Plan
Internal Group: Create WhatsApp group for daily updates
Client Updates: Regular progress reports through Harshil
Technical Reviews: Weekly sprint reviews
Issue Tracking: Linear-based ticket management
