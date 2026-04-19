# Project Context: Labor Management ERP System

**Hey Antigravity!** If you are reading this in a new conversation, use this document to instantly catch up on the strict architectural rules, design goals, and execution methodology for this project.

## 🏢 Project Overview
This is a robust, enterprise-grade Labor Management ERP System designed for a building contractor. It must be highly scalable to manage 3,000+ laborers, handle high-performance searches, and eventually include an AI-powered physical form scanner for fast data intake.

## 🏗️ Architecture & Technology Stack
This project follows a **Monorepo Strategy**.

**1. Backend (`/erp-backend`)**
* **Tech:** Java 21, Spring Boot (v3.2.4), Maven.
* **Architecture Style:** We have transitioned from a traditional layered architecture to a **Feature-Based Modular Architecture** (e.g., `src/.../modules/labor/`). Code must be highly cohesive.
* **Current State:** We are employing a UI-First prototyping approach. The backend is currently using **Mock Data Services** to power the frontend API calls before we build the actual PostgreSQL persistence layer. Do not implement real database repositories until told otherwise.

**2. Frontend (`/erp-frontend`)**
* **Tech:** React, Vite, TypeScript.
* **Architecture Style:** Also modularized by feature (e.g., `src/modules/labor/`).

## 🚀 Execution & Launch
* **Local Run:** Do not use independent terminals manually if avoidable. The root folder contains a `Start_ERP.bat` script which spins up both the Java backend (port 8080) and the React frontend (port 5173/5174) in separate native Windows command prompts automatically.
* **Maven Wrapper:** The backend uses `mvnw` (Maven Wrapper), ensuring consistent builds without relying on a global Maven installation. 

## 🎨 Design Rules (CRITICAL)
* **Visual Excellence:** The UI MUST "wow" the user and feel distinctly **premium**. Simple, generic MVPs are unacceptable.
* **Dynamic Design:** Implement sleek modern typography, deep and visually distinct tailwind-style dark mode/light mode themes, and glassmorphism where appropriate.
* **Interactivity:** Elements must feel responsive and alive. Rely on hover states, micro-animations, and fluid transitions to enhance the UX.
* **Forms:** Data entry forms must be robust, allowing for local photo selections for laborers, utilizing type-safe enums for tracking status (e.g., `LaborerStatus`), and managing audit trails.

> **AI Note:** Start every new session by acknowledging you have read `PROJECT_CONTEXT.md` and are ready to abide by these guidelines.
