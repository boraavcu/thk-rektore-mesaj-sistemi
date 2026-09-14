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
   git clone [https://github.com/boraavcu/thk-rektore-mesaj-sistemi.git](https://github.com/boraavcu/thk-rektore-mesaj-sistemi.git)
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

## Screenshots

### 1. Message to the Rectorate Page
<p align="center">
  <img src="https://github.com/user-attachments/assets/4ef8532a-4ba8-4969-8cf4-9a2f57b24afc" width="48%">
  <img src="https://github.com/user-attachments/assets/5a54e5ad-bf84-4ace-b5b0-c3b2af8bab22" width="48%">
</p>

### 2. Admin Login
<p align="center">
  <img src="https://github.com/user-attachments/assets/35b9d4ad-2bda-4147-bbb6-a7cfad124a16" width="50%">
</p>

### 3. Incoming Messages and Details
<p align="center">
  <img src="https://github.com/user-attachments/assets/64a35c18-1f8e-4266-b7f8-5c818c669808" width="48%">
  <img src="https://github.com/user-attachments/assets/ba157e73-21ba-4294-9133-259637f0a59c" width="48%">
</p>




