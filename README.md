Solana Crypto Wallet
A Solana-based cryptocurrency wallet built with Django and React, utilizing a PostgreSQL database managed via PgAdmin. This wallet enables users to create an account with a secure passphrase (secret key) and provides essential wallet functions such as buying and sending Solana (SOL), creating custom tokens, and searching through transaction histories with the help of Gemini AI.

Features
Secure Wallet Signup:
Users can sign up with a randomly generated passphrase (secret key) encrypted with a user-set password. The secret key is used to generate a public key, which serves as the wallet's address. Users must securely store their passphrase for account recovery.

SOL Purchase Simulation:
Simulate buying SOL, the native cryptocurrency of the Solana network.

Send SOL to Other Users:
Transfer SOL between users seamlessly within the platform.

Transaction Search Powered by Gemini AI:
Users can search through their transaction history using natural language, making it easier to find specific transactions.

Token Creation and Management:
Users can mint their own tokens, customize the name, symbol, and amount, and send them to other users.

Tech Stack
Backend: Django (Python)
Frontend: React (JavaScript/TypeScript)
Database: PostgreSQL (PgAdmin for management)
AI Search Engine: Gemini AI
