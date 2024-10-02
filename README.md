# Solana Crypto Wallet

A Solana-based cryptocurrency wallet built with Django and React, utilizing a PostgreSQL database managed via PgAdmin. This wallet enables users to create an account with a secure passphrase (secret key) and provides essential wallet functions such as buying and sending Solana (SOL), creating custom tokens, and searching through transaction histories with the help of Gemini AI.

## Features

- **Secure Wallet Signup:**  
  Users can sign up with a randomly generated passphrase (secret key) encrypted with a user-set password. The secret key is used to generate a public key, which serves as the wallet's address. Users must securely store their passphrase for account recovery.
  
- **SOL Purchase Simulation:**  
  Simulate buying SOL, the native cryptocurrency of the Solana network.

- **Send SOL to Other Users:**  
  Transfer SOL between users seamlessly within the platform.

- **Transaction Search Powered by Gemini AI:**  
  Users can search through their transaction history using natural language, making it easier to find specific transactions.

- **Token Creation and Management:**  
  Users can mint their own tokens, customize the name, symbol, and amount, and send them to other users.

## Tech Stack

- **Backend:** Django (Python)
- **Frontend:** React (JavaScript/TypeScript)
- **Database:** PostgreSQL (PgAdmin for management)
- **AI Search Engine:** Gemini AI

## Installation

### Prerequisites

Ensure you have the following installed:

- Python 3.x
- Node.js (with npm or yarn)
- PostgreSQL (with PgAdmin for management)

### Backend (Django)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <project-folder>
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables (e.g., `.env` file) for your database and security settings.

4. Apply migrations and start the server:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

### Frontend (React)

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

### Database (PgAdmin)

1. Set up the PostgreSQL database according to your `.env` configuration.
2. Manage and monitor your database using PgAdmin.

## Usage

- **Sign Up:**  
  Users will receive a passphrase (wallet secret key) that must be securely stored. This passphrase is encrypted with a user-set password for security purposes.
  
- **SOL Transactions:**  
  Users can simulate purchasing SOL and send SOL to other registered users.

- **Token Management:**  
  Users can create and manage their own tokens, mint them, and send tokens to others within the platform.

- **Search Transactions:**  
  The platform features a Gemini AI-powered search engine that allows users to search through transactions using natural language queries.
