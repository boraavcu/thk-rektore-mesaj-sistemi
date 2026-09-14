# Rectorate Messaging System (THKÜ)

A full-stack web application developed to digitize, streamline, and securely manage internal communications and messages directed to the university rectorate. Built with a robust React frontend and a secure Node.js/PostgreSQL backend.

**Key Features**
* **Secure Authentication:** Admin login system with hashed passwords using `bcryptjs`.
* **Centralized Dashboard:** A dedicated admin panel to view, manage, and track incoming messages.
* **RESTful API:** Clean and scalable backend architecture for fast data processing.
* **Responsive UI:** Modern and accessible user interface tailored for university staff.

**Tech Stack**
* **Frontend:** React.js, Vite, CSS
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL, pgAdmin

**Environment Variables**
To run this project locally, you will need to add the following environment variables to your `.env` file in the `backend` folder. *(Note: Never commit your actual passwords to GitHub).*

```env
PORT=5000
DB_USER=postgres
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=thk_mesaj_db
```

1. Clone the repository
   ```bash
   git clone [https://github.com/boraavcu/rektore-mesaj-sistemi.git](https://github.com/boraavcu/rektore-mesaj-sistemi.git)
   ```

2. Install Frontend Dependencies
   ```bash
   cd frontend
   npm install
   ```

3. Install Backend Dependencies
   ```bash
   cd backend
   npm install
   ```

4. Start the Application
   
   Run the backend
   ```bash
   cd backend
   npm run dev or node server.js
   ```
   Run the frontend
      ```bash
   cd frontend
   npm run dev
   ```

Developed by Bora Avcu for the University of Turkish Aeronautical Association (THKÜ).
