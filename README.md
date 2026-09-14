# Rectorate Messaging System (THKÜ)

A full-stack web application developed to digitize, streamline, and securely manage internal communications and messages directed to the university rectorate. Built with a robust React frontend and a secure Node.js/PostgreSQL backend.

**Key Features**
* **Secure Authentication:** Admin login system with hashed passwords using `bcryptjs`.
* **Centralized Dashboard:** A dedicated admin panel to view, manage, and track incoming messages.
* **RESTful API:** Clean and scalable backend architecture for fast data processing.
* **Responsive UI:** Modern and accessible user interface tailored for university staff.

**Tech Stack**
* **Frontend:** React.js, Vite, CSS/Tailwind (Update if using specific CSS frameworks)
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL, pgAdmin

**Environment Variables**
To run this project locally, you will need to add the following environment variables to your `.env` file in the `backend` folder. *(Note: Never commit your actual passwords to GitHub).*

`PORT=5000`
`DB_USER=postgres`
`DB_PASSWORD=your_database_password`
`DB_HOST=localhost`
`DB_PORT=5432`
`DB_NAME=thk_mesaj_db`

**Local Installation**

1. Clone the repository
   ```bash
   git clone [https://github.com/boraavcu/rektore-mesaj-sistemi.git](https://github.com/boraavcu/rektore-mesaj-sistemi.git)

1. Install Frontend Dependencies
   cd frontend
   npm install

2. Install Backend Dependencies
   cd ../backend
   npm install

3. Start the Application
   Run the backend: cd backend && node server.js or npm run dev or
   Run the frontend: cd frontend && npm run dev

Developed by Bora Avcu for the University of Turkish Aeronautical Association (UTAA/THKÜ)