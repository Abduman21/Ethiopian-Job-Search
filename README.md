# 🇪🇹 Ethiopian Job Search

A modern job-search platform designed to connect Ethiopian job seekers with employers and employment opportunities.

The platform provides separate experiences for **job seekers** and **employers**, including authentication, job discovery, job management, saved jobs, applications, and notifications.

---

## 🚀 Features

### 👤 Job Seekers

* Create a job seeker account
* Sign in securely
* Browse available job opportunities
* Search jobs by title, company, or description
* View job information such as:

  * Location
  * Job type
  * Salary range
  * Required skills
  * Experience requirements
* Save interesting jobs
* View application information
* Receive notifications

### 🏢 Employers

* Create an employer account
* Secure employer authentication
* Post new job opportunities
* Manage existing job listings
* View submitted applications
* Monitor job-related activity
* Receive notifications

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Lucide React

### Backend & Services

* Firebase Authentication
* Cloud Firestore

### Development Tools

* ESLint
* PostCSS
* npm
* Git & GitHub

---

## 🔐 Authentication

The application uses **Firebase Authentication** for account registration, login, and logout.

Users are assigned different roles:

* `job_seeker`
* `employer`

The interface and available features change depending on the authenticated user's role.

---

## 🔎 Job Search

Job seekers can search available jobs using keywords related to:

* Job title
* Company name
* Job description

Available job cards can display information including location, employment type, salary range, required skills, posting date, and company information.

---

## 💾 Saved Jobs

Authenticated job seekers can save jobs they are interested in and remove them from their saved list later.

Saved-job information is stored in Cloud Firestore.

---

## 🏢 Employer Dashboard

Employers have access to dedicated functionality for managing recruitment activities.

Employers can:

* Post jobs
* Manage job listings
* Review applications
* Access notifications

---

## 📂 Project Structure

```text
Ethiopian-Job-Search/
│
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignUpForm.tsx
│   │   │
│   │   ├── Employer/
│   │   │   ├── ManageJobs.tsx
│   │   │   ├── PostJob.tsx
│   │   │   └── ViewApplications.tsx
│   │   │
│   │   ├── JobSeeker/
│   │   │   ├── JobSearch.tsx
│   │   │   └── MyApplications.tsx
│   │   │
│   │   └── Notifications.tsx
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx
│   │
│   ├── lib/
│   │   └── firebase.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/Abduman21/Ethiopian-Job-Search.git
```

Enter the project directory:

```bash
cd Ethiopian-Job-Search
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

---

## 🧪 Available Scripts

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run lint
```

Checks the project with ESLint.

```bash
npm run typecheck
```

Runs TypeScript type checking.

```bash
npm run preview
```

Previews the production build locally.

---

## 📸 Screenshots

Screenshots of the application will be added here to demonstrate:

* Login and registration
* Job seeker dashboard
* Job search
* Employer dashboard
* Job posting
* Job management
* Applications
* Notifications

---

## 🎯 Project Goal

The goal of Ethiopian Job Search is to provide a simple and accessible digital platform that helps connect job seekers in Ethiopia with employers and available opportunities.

The project also demonstrates the implementation of role-based interfaces, authentication, cloud database integration, responsive UI development, and modern React application architecture.

---

## 🔮 Future Improvements

Planned improvements include:

* Complete job application submission workflow
* Advanced job filters
* Job categories
* CV/resume upload
* Employer profiles
* Job seeker profiles
* Improved notification system
* Application status tracking
* Email notifications
* Better mobile responsiveness
* Production deployment

---

## 👨‍💻 Developer

**Abdulmalik Muze**

Full-Stack Developer & AI Engineer

GitHub: [@Abduman21](https://github.com/Abduman21)

LinkedIn: [Abdulmalik Muze](https://www.linkedin.com/in/abdulmalik-muze-819951319)

---

## 📄 License

This project is currently maintained as a portfolio and development project.

---

<p align="center">
  <strong>Connecting Ethiopian talent with opportunities 🇪🇹</strong>
</p>
