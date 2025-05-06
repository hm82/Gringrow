# Contributing to Digital Banking Platform

Thank you for considering contributing to the Digital Banking Platform! This document outlines the process for contributing to this project.

## Code of Conduct

By participating in this project, you agree to uphold our Code of Conduct. Please treat all team members with respect.

## How Can I Contribute?

### Reporting Bugs

- Check if the bug has already been reported by searching GitHub Issues
- If the bug hasn't been reported, create a new issue
- Use a clear and descriptive title
- Provide detailed steps to reproduce the problem
- Include any relevant screenshots or error messages
- Describe the expected behavior

### Suggesting Enhancements

- Check if the enhancement has already been suggested
- Create a new issue with a clear title
- Provide a detailed description of the enhancement
- Explain why this enhancement would be useful
- Include mockups or examples if possible

### Pull Requests

1. Fork the repository
2. Create a new branch for your feature or bugfix: `git checkout -b feature/my-feature` or `git checkout -b fix/my-bugfix`
3. Make your changes
4. Run the tests: `npm test`
5. Commit your changes with a descriptive message: `git commit -m "Add feature X"`
6. Push to your branch: `git push origin feature/my-feature`
7. Submit a pull request

## Development Workflow

### Setting Up Your Development Environment

1. Clone the repository: `git clone https://github.com/yourusername/digital-banking-platform.git`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

### Testing

- Run unit tests: `npm run test:unit`
- Run e2e tests: `npm run test:e2e`
- Run all tests: `npm test`

### Code Style

- We use ESLint for JavaScript/TypeScript linting
- Follow the existing code style
- Document your code with comments where necessary
- Write clear commit messages

### Branching Strategy

- `main` branch is the stable version
- Feature branches should be created from `main`
- Name branches descriptively: `feature/feature-name` or `fix/bug-name`

## Pull Request Process

1. Update the README.md if necessary with details of changes
2. Update the documentation if you're changing functionality
3. The PR should work in all supported browsers
4. The PR will be reviewed by at least one maintainer
5. Once approved, the PR will be merged by a maintainer

Thank you for contributing!