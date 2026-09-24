# 📚 City of Comics

A modern full-stack web platform for reading, managing, and exploring digital comics and graphic novels.

City of Comics provides a complete comic-reading experience with user authentication, HOST-based comic management, cloud image storage, and a responsive comic reader.

---

## 🌐 Live Application

**Frontend:**  
https://city-of-comics.vercel.app

**Backend API:**  
https://city-of-comics.onrender.com

---

## ✨ Features

### 👤 User Features

- User registration
- Email OTP verification
- Secure login and logout
- Session-based authentication
- Browse available comics
- Search comics
- Read comics online
- Multi-page comic reader
- Previous/Next page navigation
- Keyboard navigation
- Fullscreen reading mode
- Responsive interface

### 👑 HOST Features

HOST accounts have additional comic-management capabilities:

- Upload comics
- Upload comic cover
- Upload multiple comic pages
- Edit comic information
- Delete comics
- Manage comic pages
- View uploaded comics

New registrations are created as `USER` accounts by default.

HOST access is assigned through the database.

---

## ⚡ Comic Reader

The comic reader is designed for a smooth reading experience.

Features include:

- Current-page priority loading
- Next-page preloading
- Previous-page preloading
- Page progress indicator
- Page counter
- Fullscreen mode
- Keyboard controls
- Responsive layout
- Dark reading interface

Keyboard shortcuts:

| Key | Action |
|-----|--------|
| `←` | Previous page |
| `→` | Next page |
| `F` | Fullscreen |
| `Esc` | Exit fullscreen |

---

## 🏗️ Technology Stack

### Frontend

- React
- Vite
- JavaScript
- HTML5
- CSS3

### Backend

- Java 17
- Spring Boot
- Spring MVC
- Spring Data JPA
- Hibernate
- Maven

### Database

- PostgreSQL

### Storage

- Supabase Storage

### Email

- Brevo

### Deployment

- Vercel — Frontend
- Render — Backend
- Render PostgreSQL — Database
- Supabase — Comic image storage

---

## 🏛️ Architecture

```text
                    CITY OF COMICS
                          │
                          ▼
                 ┌─────────────────┐
                 │  React + Vite   │
                 │    Frontend     │
                 └────────┬────────┘
                          │
                     REST API
                          │
                          ▼
                 ┌─────────────────┐
                 │   Spring Boot   │
                 │     Backend     │
                 └───────┬─────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
      ┌──────────────┐      ┌────────────────┐
      │ PostgreSQL   │      │ Supabase       │
      │              │      │ Storage        │
      │ Users        │      │                │
      │ Comics       │      │ Covers         │
      │ Comic Pages  │      │ Comic Pages    │
      └──────────────┘      └────────────────┘
                                 │
                           ▼
                    Comic Platform
📂 Project Structure
city-of-comics/
│
├── backend/
│   │
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/
│   │       │       └── comic/
│   │       │           └── comicreader/
│   │       │               │
│   │       │               ├── controller/
│   │       │               │   ├── AuthController.java
│   │       │               │   ├── ComicController.java
│   │       │               │   └── ComicPageController.java
│   │       │               │
│   │       │               ├── dto/
│   │       │               │   ├── ForgotPasswordRequest.java
│   │       │               │   ├── LoginRequest.java
│   │       │               │   ├── RegisterRequest.java
│   │       │               │   └── ResetPasswordRequest.java
│   │       │               │
│   │       │               ├── model/
│   │       │               │   ├── User.java
│   │       │               │   ├── Comic.java
│   │       │               │   ├── ComicPage.java
│   │       │               │   ├── EmailVerificationCode.java
│   │       │               │   └── PasswordResetToken.java
│   │       │               │
│   │       │               ├── repository/
│   │       │               │   ├── UserRepository.java
│   │       │               │   ├── ComicRepository.java
│   │       │               │   ├── ComicPageRepository.java
│   │       │               │   ├── EmailVerificationCodeRepository.java
│   │       │               │   └── PasswordResetTokenRepository.java
│   │       │               │
│   │       │               ├── service/
│   │       │               │   ├── AuthService.java
│   │       │               │   ├── ComicFileService.java
│   │       │               │   ├── EmailService.java
│   │       │               │   └── EmailVerificationService.java
│   │       │               │
│   │       │               ├── ComicreaderApplication.java
│   │       │               └── WebConfig.java
│   │       │
│   │       └── resources/
│   │           └── application.properties
│   │
│   └── pom.xml
│
├── frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── ComicReader.jsx
│   │   ├── ComicReader.css
│   │   └── config.js
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── ...
│
├── .gitignore
└── README.md
🗄️ Database

City of Comics uses PostgreSQL for application data.

Main Tables
users
comics
comic_pages
password_reset_tokens
email_verification_codes
Users

The users table stores account information.

Main information includes:

id
email
password
role
email_verified

Available roles:

USER
HOST
📚 Comics

The comics table stores comic information and metadata.

A comic can contain multiple pages.

Comic
 │
 ├── Page 1
 ├── Page 2
 ├── Page 3
 ├── Page 4
 ├── ...
 └── Page N
📄 Comic Pages

The comic_pages table stores information about individual comic pages.

Each page is associated with a specific comic.

Comic images are stored in Supabase Storage while their corresponding information is maintained in PostgreSQL.

🔐 Authentication Flow
Registration
User
 │
 ▼
Enter Email + Password
 │
 ▼
Backend Validation
 │
 ▼
Generate OTP
 │
 ▼
Send OTP through Email
 │
 ▼
User Enters OTP
 │
 ▼
OTP Verification
 │
 ▼
Create USER Account

New registrations are created with the USER role.

HOST access is assigned separately.

🔢 Email OTP Verification

The registration system uses a six-digit OTP for email verification.

Security features include:

Six-digit OTP
Secure OTP generation
OTP hashing
OTP expiration
Resend cooldown
Maximum verification attempts
Server-side validation

Default configuration:

OTP Expiration     : 10 minutes
Resend Cooldown    : 60 seconds
Maximum Attempts   : 5
🔑 Login Flow
User
 │
 ▼
Enter Email + Password
 │
 ▼
Spring Boot Backend
 │
 ▼
Validate Credentials
 │
 ▼
Create Session
 │
 ▼
Authenticated User

The authenticated session contains information such as:

userId
email
role
🔒 Security

City of Comics uses several security mechanisms to protect user accounts and uploaded content.

Password Security

User passwords are securely hashed before being stored.

OTP Security

Verification OTPs are protected using hashing and expiration.

Session Authentication

The backend maintains an authenticated user session.

Role-Based Access

HOST-only operations are protected from normal USER accounts.

File Validation

Uploaded comic files are validated before being accepted.

Comic Ownership

Comic-related file paths are checked against the appropriate comic ID.

Signed Uploads

Comic files are uploaded to Supabase using signed upload URLs.

☁️ Direct Upload Architecture

Large comic files are uploaded directly from the browser to Supabase Storage.

HOST
 │
 ▼
React Frontend
 │
 ▼
POST /api/comics/upload/init
 │
 ▼
Spring Boot
 │
 ▼
Generate Signed Upload URL
 │
 ▼
React Browser
 │
 ▼
Supabase Storage
 │
 ▼
POST /api/comics/{id}/upload-complete
 │
 ▼
Spring Boot
 │
 ▼
PostgreSQL

This architecture avoids sending the entire comic file through the Spring Boot server.

🔌 API Endpoints
Authentication
POST /register
POST /register/verify-otp
POST /login
POST /logout
GET  /me
Comic Upload
POST /api/comics/upload/init
POST /api/comics/{id}/upload-complete

Additional comic endpoints provide comic browsing, editing, deletion, page management, and other application functionality.

⚙️ Environment Variables

Sensitive information should never be committed to GitHub.

Example backend configuration:

DATABASE_JDBC_URL=jdbc:postgresql://localhost:5432/comicreader
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_database_password

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=comics

OTP_PEPPER=your_secure_random_value

Email configuration should be provided through environment variables required by the Brevo integration.

⚠️ Security Warning

Never commit the following information to GitHub:

.env
.env.local
.env.production
Database passwords
Supabase service-role keys
Brevo API keys
SMTP passwords
Private API keys
Access tokens

The Supabase service-role key must remain on the backend.

It must never be placed in:

React source code
Vite frontend variables
GitHub
Public repositories
💻 Local Development
Requirements

Install:

Java 17+
Maven
Node.js
npm
PostgreSQL
Git
Visual Studio Code
📥 Clone the Repository
git clone https://github.com/ragavsankar0615-hue/city-of-comics.git

Move into the project:

cd city-of-comics
⚙️ Backend Setup

Move into the backend directory:

cd backend

Create the PostgreSQL database:

CREATE DATABASE comicreader;

Configure the required environment variables.

Build the backend:

mvn clean package -DskipTests

Run the backend:

mvn spring-boot:run

The local backend runs at:

http://localhost:8080
🎨 Frontend Setup

Open another terminal.

Move into the frontend directory:

cd frontend

Install dependencies:

npm install

Create a frontend environment file:

VITE_API_URL=http://localhost:8080

Start the development server:

npm run dev

The frontend normally runs at:

http://localhost:5173
🔄 Local Development Architecture
Browser
   │
   ▼
React + Vite
localhost:5173
   │
   │ REST API
   ▼
Spring Boot
localhost:8080
   │
   ├──────────────► PostgreSQL
   │
   └──────────────► Supabase Storage
🧪 Build Commands
Backend
mvn clean package -DskipTests
Frontend
npm run build

The production frontend build is generated in:

frontend/dist
☁️ Production Deployment

City of Comics uses the following deployment architecture:

Frontend       → Vercel
Backend        → Render
Database       → Render PostgreSQL
Image Storage  → Supabase
Email          → Brevo
Source Code    → GitHub
🚀 Vercel Deployment

The React frontend is deployed on Vercel.

Root Directory
frontend
Build Command
npm run build
Output Directory
dist
Environment Variable
VITE_API_URL=https://city-of-comics.onrender.com
🚀 Render Deployment

The Spring Boot backend is deployed on Render.

The backend supports the Render-provided port using:

server.port=${PORT:8080}

This allows:

Local Development → Port 8080

Production → Render PORT
🗃️ Production Database

The production database is PostgreSQL hosted through Render.

Database configuration is supplied through environment variables.

Example:

DATABASE_JDBC_URL=your_database_url
DATABASE_USERNAME=your_database_username
DATABASE_PASSWORD=your_database_password
🪣 Supabase Storage

Comic images are stored in a Supabase Storage bucket.

Bucket name:

comics

Required backend configuration:

SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_STORAGE_BUCKET=comics
🌐 CORS

The backend allows requests from the frontend application.

Local frontend:

http://localhost:5173

Production frontend:

https://city-of-comics.vercel.app

Vercel preview deployments can also be supported through the configured CORS pattern.

📱 Responsive Design

City of Comics is designed to work across:

Desktop
Laptop
Tablet
Mobile

The comic reader adjusts its layout according to the available screen size.

The interface focuses on:

Readability
Simple navigation
Clear controls
Responsive layouts
Comfortable comic viewing
🧑‍💼 HOST Workflow

A HOST can upload comics using the following workflow:

HOST Login
    │
    ▼
Open Upload Page
    │
    ▼
Enter Comic Information
    │
    ▼
Select Comic Cover
    │
    ▼
Select Comic Pages
    │
    ▼
Start Upload
    │
    ▼
Supabase Storage
    │
    ▼
Save Comic Information
    │
    ▼
Comic Library
👤 USER Workflow

A normal user follows:

Register
   │
   ▼
Verify Email
   │
   ▼
Login
   │
   ▼
Browse Comics
   │
   ▼
Search Comic
   │
   ▼
Select Comic
   │
   ▼
Read Comic
🖼️ Supported Image Formats

Comic uploads support:

.jpg
.jpeg
.png
.gif
.webp

Unsupported image formats are rejected by the backend.

⚡ Performance

City of Comics uses several techniques to improve comic reading performance.

Page Preloading

The reader loads nearby pages before the user navigates to them.

Current Page Priority

The currently selected page is loaded first.

Browser Caching

Previously loaded images can be reused by the browser.

Direct Cloud Upload

Large files are uploaded directly to Supabase rather than passing through the backend.

🐛 Troubleshooting
Backend Does Not Start

Check Java:

java -version

Check Maven:

mvn -version

Also verify:

PostgreSQL is running
Database exists
Environment variables are configured
Required port is available
PostgreSQL Connection Error

Check:

DATABASE_JDBC_URL
DATABASE_USERNAME
DATABASE_PASSWORD

Make sure the database exists:

CREATE DATABASE comicreader;
Frontend Cannot Connect to Backend

For local development:

VITE_API_URL=http://localhost:8080

For production:

VITE_API_URL=https://city-of-comics.onrender.com

After changing Vite environment variables, rebuild the frontend:

npm run build
CORS Error

Check that the frontend URL is included in the backend CORS configuration.

Local:

http://localhost:5173

Production:

https://city-of-comics.vercel.app
Comic Upload Fails

Check:

SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET

Also make sure the Supabase bucket exists.

Comic Images Do Not Load

Check whether the comic uses a valid Supabase Storage URL.

Old local paths such as:

/uploads/1/cover.jpg

may not work in production if the files existed only on a local or temporary server filesystem.

Production uploads should use Supabase Storage.

📊 Project Status
Completed
 React frontend
 Vite setup
 Spring Boot backend
 Java 17
 PostgreSQL
 User registration
 Email OTP verification
 Secure password hashing
 Login
 Logout
 Session authentication
 USER role
 HOST role
 Role-based access
 Comic library
 Comic search
 Comic reader
 Previous/Next navigation
 Keyboard navigation
 Fullscreen mode
 Responsive interface
 Comic upload
 Comic editing
 Comic deletion
 Comic page management
 Supabase Storage
 Signed upload URLs
 Direct browser-to-Supabase upload
 Page preloading
 Image caching
 CORS configuration
 Vercel deployment
 Render deployment
 Render PostgreSQL
 Production frontend
 Production backend
🔮 Future Improvements
📚 Reading Features
 Reading history
 Continue Reading
 Reading progress synchronization
 Bookmarks
 Favorites
 Recently read comics
 Personal reading lists
 Comic collections
🔎 Search Improvements
 Advanced search
 Search by author
 Search by publisher
 Search by genre
 Search by year
 Search suggestions
 Advanced filtering
 Sorting
 Pagination
👤 User Profile
 User profile page
 Profile picture
 Change password
 Account settings
 Reading statistics
 Favorite comics
 Personal library
👑 HOST Dashboard
 Dedicated HOST dashboard
 Comic statistics
 Upload statistics
 Storage statistics
 Comic management table
 User management
 Upload history
 Analytics
📖 Advanced Reader
 Zoom controls
 Double-page mode
 Vertical reading mode
 Right-to-left reading
 Reader themes
 Brightness control
 Page rotation
 Automatic reading mode
 Advanced mobile controls
⚡ Performance Improvements
 Image compression
 WebP conversion
 AVIF conversion
 Thumbnail generation
 CDN optimization
 Advanced caching
 Progressive image loading
 Resumable uploads
🔔 Notifications
 New comic notifications
 Email notifications
 Reading reminders
 Upload notifications
 System notifications
🎯 Project Objectives

The main objectives of City of Comics are:

Build a modern online comic reading platform.
Provide secure user authentication.
Provide email-based account verification.
Separate USER and HOST permissions.
Allow authorized HOST users to manage comic content.
Store comic images using cloud storage.
Improve upload performance through direct cloud uploads.
Provide a fast and readable comic reader.
Support desktop and mobile devices.
Provide a scalable foundation for future features.
🔄 Git Workflow

Check repository status:

git status

Add changes:

git add .

Commit changes:

git commit -m "Update City of Comics"

Push changes:

git push origin main
🌿 Feature Branch Workflow

For a new feature:

git checkout -b feature/new-feature

After making changes:

git add .
git commit -m "Add new feature"
git push origin feature/new-feature

Then create a Pull Request on GitHub.

🤝 Contributing

Contributions and improvements are welcome.

Before submitting changes:

Test the frontend.
Test the backend.
Test authentication.
Test comic reading.
Test USER permissions.
Test HOST permissions.
Test comic upload.
Test comic deletion.
Check production configuration.
Make sure no secrets are committed.
📜 License

This project is currently maintained as a personal/academic development project.

A formal open-source license can be added in the future.

👨‍💻 Project Information
Item	Details
Project Name	City of Comics
Project Type	Full-Stack Web Application
Category	Comic / Graphic Novel Reading Platform
Frontend	React + Vite
Backend	Java + Spring Boot
Database	PostgreSQL
Storage	Supabase Storage
Email	Brevo
Frontend Hosting	Vercel
Backend Hosting	Render
Database Hosting	Render PostgreSQL
Source Control	GitHub
🌍 Production Links
Service	URL
🌐 Frontend	https://city-of-comics.vercel.app
⚙️ Backend	https://city-of-comics.onrender.com
💻 GitHub	https://github.com/ragavsankar0615-hue/city-of-comics
⭐ City of Comics

Read. Discover. Explore.

A modern platform for digital comics and graphic novels.

📚 Technology Overview
                         CITY OF COMICS
                              │
                              ▼
                     ┌─────────────────┐
                     │  React + Vite   │
                     │    Frontend     │
                     └────────┬────────┘
                              │
                           REST API
                              │
                              ▼
                     ┌─────────────────┐
                     │   Spring Boot   │
                     │     Backend     │
                     └───────┬─────────┘
                             │
                  ┌──────────┴──────────┐
                  │                     │
                  ▼                     ▼
           ┌──────────────┐      ┌───────────────┐
           │ PostgreSQL   │      │   Supabase    │
           │   Database   │      │    Storage    │
           ├──────────────┤      ├───────────────┤
           │ Users        │      │ Comic Covers  │
           │ Comics       │      │ Comic Pages   │
           │ Comic Pages  │      │               │
           └──────────────┘      └───────────────┘
                  │                     │
                  └──────────┬──────────┘
                             ▼
                      Comic Platform
🚀 City of Comics

A complete digital comic reading platform built with modern full-stack technologies.

React • Vite • Java • Spring Boot • PostgreSQL • Supabase • Brevo • Vercel • Render


### Important

Your pasted README already has the right beginning. **Don't create a second README or paste the previous version underneath it.** Keep your existing content from the beginning through the architecture section, then append the continuation above.

Also, before pushing, make sure the **Brevo** details match your actual `EmailService.java` and environment variables, since your earlier backend configuration contained older Resend settings.
