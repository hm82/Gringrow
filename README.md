# Digital Banking Platform

A comprehensive Digital Banking Platform with headless architecture supporting multiple banking products and operations functions.

## Features

- **Core Banking Integration**: Account management, transactions, transfers, and statements
- **Banking Products**: Checking, Savings, and CD accounts with configurable parameters
- **ACH/NACHA Support**: File generation and processing for external transfers
- **Fraud Management**: Detection, alerts, and prevention mechanisms
- **Customer Service**: Support ticket management and knowledge base
- **Operations Dashboard**: Admin tools for banking operations and fraud monitoring

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js
- **Data Layer**: In-memory storage with schema ready for database migration
- **Testing**: Vitest (unit tests), Playwright (e2e tests)
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm 10 or later

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/digital-banking-platform.git
   cd digital-banking-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The application will be available at:
   ```
   http://localhost:5000
   ```

### Default Credentials

For development/testing purposes, use the following credentials:
- Username: `user`
- Password: `password`

Admin access:
- Username: `admin`
- Password: `admin`

## Testing

### Running Unit Tests

```bash
npm run test:unit
```

### Running E2E Tests

```bash
npm run test:e2e
```

### Running All Tests

```bash
npm test
```

## Deployment

The application can be deployed using GitHub Actions, which automatically builds, tests, and deploys to your hosting environment.

## Project Structure

- `client/`: Frontend React application
  - `src/`: Source code
    - `components/`: UI components
    - `hooks/`: Custom React hooks
    - `lib/`: Utility functions and shared logic
    - `pages/`: Page components
- `server/`: Backend Express application
  - `operations/`: Business logic modules
  - `index.ts`: Server entry point
  - `routes.ts`: API route definitions
  - `storage.ts`: Data access layer
- `shared/`: Shared code between client and server
  - `schema.ts`: Database schema definitions
- `e2e-tests/`: End-to-end tests using Playwright

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.