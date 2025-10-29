Construction Project Management Web Application
Product Requirements Document (PRD) & Scope of Work

1. PROJECT OVERVIEW
   Client: Uniglaze (Glasswork & Construction Services)
   Project Type: Web Application Development
   Timeline: 3 weeks
   1.1 Business Context
   Uniglaze specializes in glasswork and construction services for construction sites. They require a comprehensive project management platform to track project progress, manage workflows, integrate team communication, and generate automated reports for both internal teams and clients.
   1.2 Project Objectives
   Streamline project tracking and reporting processes

Implement role-based access control for different user levels

Automate report generation and distribution

Provide real-time project visibility to stakeholders

Centralize project data and progress photos

Integrate with Microsoft Teams for project communication

Use AWS S3 for storing images and documents

Maintain a full project archive with historical reports, data, and changes

2. USER ROLES & ACCESS LEVELS
   2.1 Managing Director (MD) – Aditya
   Access Level: Full administrative access

Capabilities: All HOP capabilities + system administration

Count: Single user

2.2 Head Of Planning (HOP) – Mr. Vamsi
Access Level: Operations management

Capabilities:

Create new projects

Manage project details and configurations

Create and modify Sheet 1 & Sheet 2

Assign Project Managers

Approve/reject PM reports

Send final reports to clients and internal teams

Count: Single user

2.3 Project Manager (PM)
Access Level: Project execution

Capabilities:

View assigned projects

Submit daily progress reports

Upload progress photos

Manage project blockages

Update supply and installation data

Count: Multiple users (project-dependent)

3. CORE FEATURES & FUNCTIONALITY
   3.1 Authentication & Authorization
   Multi-level login system with role-based access control

User creation, role assignment, and password reset

Session management and secure authentication protocols

3.2 Project Management Module
3.2.1 Project Creation (HOP/MD Only)
Project creation form to include:
Client name

Project start date

Project description

Contact information

Client-facing email addresses

Internal team email addresses

Additional metadata as per work order

Extended Fields:
Microsoft Teams Integration Setup

Teams Channel ID (optional)

Enable Teams report notifications (toggle)

AWS S3 Configuration for Image Storage

Region, Bucket Name, Access Key, Secret Key

Enable Project Archive

Toggle to activate archive history of all updates and submissions

3.2.2 Sheet 1 – Master Project Data
A table capturing key project metrics:
Serial Number
Item
Unit of Measurement
Total
Cumulative Supplied
Cumulative Installed
Yet to Supply
Yet to Install
% Supplied
% Installed

Rules:
"Yet to Supply" and "Yet to Install" are auto-calculated

Percentages calculated in real-time

Editable interface for supply/installation updates

3.2.3 Sheet 2 – Detailed Work Breakdown
A more granular version of Sheet 1:
| Item | Sub-task Description | UOM | Total | Supplied Till Date | Installed Till Date | Progress Photos | Client Visibility | Hindrance Photos |
Auto-inherits item list from Sheet 1

Allows photo uploads for each main item

Visibility toggle for each row (client/internal)

AWS S3 used to store photos securely

3.3 Project Manager Workflow
3.3.1 Daily Report Submission
A PM-facing interface split into two panels:
Left Panel: Items and sub-tasks

Right Panel:

Fields for supply & installation updates

Progress photo upload (1+ required per main item)

Blockage management with:

Photo

Location

Description

Open date (auto)

Close date (optional)

3.3.2 Report Preview & Submission
Preview of:

Sheet 1 with updated values

Sheet 2 with sub-tasks

Photo gallery

Blockages list (open & closed)

New Field: Notify team via Microsoft Teams (toggle)

Submit sends report for HOP review and stores in archive

3.4 Approval Workflow
HOP Review Panel Includes:
Report approval or rejection

Comment section for feedback

Audit trail of all changes made

Rejected reports return to PM for revision

3.5 Report Generation & Distribution
3.5.1 Report Types
Client Report: Client-viewable blockages + photos

Internal Report: All blockages + full data

3.5.2 Distribution System
PDF generation of final report

Email delivery:

Clients → Client report

Internal team → Internal report

Teams Notification: If enabled, send preview link to Teams

Archive System:

All reports stored with timestamp

Full project history browsable by MD and HOP

4. TECHNICAL REQUIREMENTS
   4.1 Technology Stack
   Frontend: React (preferred)

Backend: Node.js or Python (REST APIs)

File Storage: AWS S3 (for all photo/PDF assets)

Email: SMTP-based mail service

Communication: Microsoft Teams via webhook integration

4.2 Data Management
User Management: CRUD for MD, HOP, PM

Project Data: Structured relational tables

Image Management:

Uploaded to S3 with secure path and metadata

Archive Management:

Auto-generated entries for every submission/change

Stored against project ID with time history

4.3 Security Requirements
Secure login with session handling

Role-based authorization

Encrypted data in transit and at rest

Secure AWS S3 uploads with signed URLs

Controlled Teams integration via whitelisted webhook URLs

5. USER INTERFACE REQUIREMENTS
   5.1 Design Principles
   Responsive for desktop/tablet

Role-specific dashboard UI

Error-handling and real-time validations

Clean data visualizations

5.2 Key UI Components
Role-based dashboards

Sheet 1 and Sheet 2 views

Forms with expandable sub-sections

Photo upload gallery

WYSIWYG report preview

Archive browsing interface

6. SCOPE OF WORK
   6.1 Phase 1 – Foundation & Authentication and Core Project Management (Week 1)
   Authentication + Authorization

Role creation (MD, HOP, PM)

Setup AWS S3 and Teams placeholder integrations

Project creation form (with Teams & AWS S3)

Sheet 1 and Sheet 2 with calculation logic

Dashboard views

Archive setup for project-level tracking

6.2 Phase 2 – PM Workflow & Reporting (Weeks 2–3)
PM reporting interface

Photo uploads to S3

Blockage tracking

Report preview and submission flow

Teams notification on submission

Archive entry generation

PDF report generation

Email and Teams dispatch

6.3 Phase 3 – Reviews, Final Integration & Deployment (Week 3)
Final archive system

QA testing

Production deployment

Admin & user training

7. DELIVERABLES
   7.1 Technical Deliverables
   Source code (version-controlled)

API documentation

AWS S3 & Teams integration setup

Archive access logs

Admin manuals

7.2 Project Deliverables
Role-based project dashboard

Reporting & notification system

Photo archive system on AWS

Teams-linked communication workflow

UAT-ready deployment

Maintenance documentation

8. ASSUMPTIONS & CONSTRAINTS
   8.1 Assumptions
   AWS and Teams credentials will be shared by client

Email SMTP details will be provided

Archive space and bucket pre-configured

Project test data will be available

8.2 Constraints
AWS S3

No native mobile app (web-only)

Teams used only for outbound notifications

GDPR/data protection compliance required

9. SUCCESS CRITERIA
   9.1 Functional Success Metrics
   All users can perform assigned tasks error-free

Photo uploads function reliably on S3

Archive retains historical reports and actions

Teams messages sent successfully

9.2 Business Success Metrics
80% reduction in manual reporting effort

Improved transparency via Teams notifications

Historical data readily accessible

Improved client communication with faster reports

10. NEXT STEPS
    Client Review & Approval of PRD

Finalize architecture and integrations

Timeline confirmation and kickoff

Assign engineering and QA team

Begin Phase 1 implementation

Suggestion : error handling, error detection, ( sentry ), s3 , aws / vercel deployment, docker image, deployment infra cost
