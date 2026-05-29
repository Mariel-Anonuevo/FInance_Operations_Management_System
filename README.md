# Finance Operations Management System (FOMS)
Capstone Project — Logistics & Transportation (Finance & Analytics)

FOMS is a complete, modern Accounts Receivable (AR) & Collection Monitoring System tailored for freight, logistics, and transportation operators. It replaces manual spreadsheets and ledger books with a robust, enterprise-grade digital pipeline.

---

## 🏗️ Architecture Overview

The system is designed with a highly decoupled, modern architecture:

1. **Frontend (React + Vite + TS)**: A responsive, premium dashboard loaded with real-time analytics, interactive charts (Recharts), client/invoice management, billing collections, official receipt (OR) generation, and multi-tier role-based access control.
2. **Backend (Clean Architecture - C# .NET 10)**: Engineered with Clean Architecture using CQRS (MediatR), Repository pattern, and Entity Framework Core to process transactions, validations, audit logs, and analytics.
3. **Gateway (YARP Reverse Proxy)**: A high-performance reverse proxy using Microsoft's **YARP (Yet Another Reverse Proxy)** that routes incoming traffic smoothly between the frontend dev server and the backend API, preventing CORS issues.
4. **Database (SQL Server LocalDB)**: Local database engine using Entity Framework Core to automatically seed mock clients, invoices, payments, logs, and driver COD validations.

---

## ⚡ Quick Start (Development Mode)

We have created two one-click startup scripts in the root directory to instantly run all three services (Frontend, Backend, and YARP Proxy) in parallel.

### Method 1: Using Windows Command Prompt (Recommended)
Double-click the **`run-dev.bat`** file in the root folder, or run it in your terminal:
```cmd
run-dev.bat
```
This will launch:
*   A console window for the **Backend C# API** (listening on `http://localhost:5007` & seeded database)
*   A console window for the **YARP Proxy Gateway** (listening on `http://localhost:5275`)
*   The **React/Vite Dev Server** in the current window (listening on `http://localhost:5173`)

### Method 2: Using PowerShell
Run the **`run-dev.ps1`** script:
```powershell
.\run-dev.ps1
```

---

## 👤 Sample Credentials
To sign in, use any of the credentials below (the password for all accounts is **`password123`**):

| Username | Employee Name | Role / Department | Access Level |
| :--- | :--- | :--- | :--- |
| **`EMP-002`** | Crystalyn Joyce C. Fajardo | ADMIN | AR & Billing |
| **`EMP-003`** | Conag, Reca M. | OP. TEAM | AR & Billing |
| **`EMP-004`** | David Jr. M. Gabriel | OP. TEAM | AR & Billing |

---

## 📂 Project Structure

```bash
├── Finance_Capstone-main/     # React + TypeScript frontend
├── Finance_Capstone-backend/  # Clean Architecture .NET backend
│   ├── FOMS.Domain/           # Domain models & entities
│   ├── FOMS.Application/      # CQRS commands, queries & interfaces
│   ├── FOMS.Infrastructure/   # DBContext, LocalDB configuration & seeds
│   └── FOMS.Api/              # ASP.NET Core controllers
├── Finance_Capstone-proxy/    # YARP Reverse Proxy project
├── run-dev.bat                # Dev launcher (Batch script)
├── run-dev.ps1                # Dev launcher (PowerShell script)
└── foms.code-workspace        # VS Code Workspace file
```
