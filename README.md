# Finance_Operations_Management_System

## System Description

The Finance Operations Management System (FOMS) is a logistics-focused financial management system designed to help accounting and finance personnel manage billing records, payment transactions, receivables, shipment pricing, transportation expenses, and other logistics-related financial activities. The system supports billing and invoice management, payment monitoring, digital payment processing through SpeedPay, cash flow monitoring, finance reporting, and secure access management to improve financial monitoring, accountability, documentation, operational coordination, and decision-making.

---

## Technologies and Deployment

### Frontend

The frontend is responsible for the user interface and user experience of the system.

Technologies Used:

- React – Builds responsive and interactive user interfaces
- Figma – Used for UI/UX design, wireframing, and prototyping

### Backend

The backend manages system logic, API services, authentication, financial processing, and communication between the frontend and database.

Technologies Used:

- ASP.NET Web API – Handles business logic and API development
- Swagger – API testing and documentation
- YARP (Yet Another Reverse Proxy) – API gateway and request routing between services

### Docker

The system uses Docker for containerization to simplify deployment, maintain environment consistency, and improve system portability.

#### Requirements

For Windows users, install the following:

- Windows Subsystem for Linux (WSL)
- Docker Desktop

Official Resources:

- WSL: https://learn.microsoft.com/windows/wsl/install
- Docker Desktop: https://www.docker.com/products/docker-desktop/

#### Run Docker

```bash
docker compose up
```

or

```bash
docker-compose up
```

This command starts the required containers for the system.

---

### Cloud Deployment

The system may be deployed to a cloud-based server for accessibility and operational use.

#### Suggested Setup

- Cloud Server / VPS
- Configured Domain Name

Example:

```txt
www.foms-system.com
```

A configured domain enables easier system access and deployment management.

---

### Microsoft SQL Server (MSSQL)

The system uses Microsoft SQL Server (MSSQL) to manage both structured and unstructured data.

#### Structured Data Examples

- Billing records
- Payment transactions
- Receivables
- Shipment pricing details
- Transportation expenses
- User and financial records

#### Unstructured Data Examples

- Uploaded images
- Attachments
- Supporting files

Unstructured files such as images may be stored using:

- BLOB (Binary Large Object)
- Base64 conversion (if applicable)

#### Security

Sensitive information such as passwords should not be stored in plain text.

The system implements:

```txt
SHA-256 Hashing
```

to improve password and data security.

---

### AWS Hosting Consideration

If the system is deployed using AWS:

> AWS services generate costs while resources are active or running.

Important Notes:

- Costs continue while services are running
- Monitor usage regularly
- Stop inactive resources to reduce unnecessary expenses

---

### File Upload Limitation

To improve storage optimization, security, and system performance, upload limits are implemented.

#### Maximum File Upload Size

```txt
3 MB per file
```

Examples include:

- Images
- Supporting documents
- Attachments

---

## Notes

Before deployment, ensure the following are properly configured:

- Docker Desktop installed
- WSL enabled (Windows environment)
- MSSQL database configured
- Cloud deployment environment prepared
- File upload validation implemented
- Security mechanisms (SHA-256 hashing) enabled
