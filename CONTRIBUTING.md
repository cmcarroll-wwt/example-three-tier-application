# Contributing to example-three-tier-application

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

1. **Fork and clone** the repository
2. **Install Docker Desktop** (or Docker Engine + Compose plugin)
3. **Start the development environment**:
   ```bash
   docker compose up --build
   ```
4. Open [http://localhost:3000](http://localhost:3000) to verify everything works

## Development Workflow

### Making Changes

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the project conventions (see below)

3. **Test locally** with Docker Compose:
   ```bash
   docker compose up --build
   ```

4. **Commit your changes** with clear, descriptive messages:
   ```bash
   git add .
   git commit -m "Add feature: description of what changed"
   ```

5. **Push and open a pull request**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Project Conventions

- **Migrations are append-only** — Never edit an existing migration file; always create a new one
- **Environment variables for configuration** — No hardcoded connection strings, ports, or URLs
- **The API is internal** — All external traffic goes through the web tier
- **Node 22 / PostgreSQL 17** — Match these versions in any new dependencies or Dockerfiles

### Adding Features

When adding a feature that spans multiple tiers, work in this order:

1. **Database first** — Create migrations for schema changes
2. **API second** — Add or modify endpoints
3. **Frontend last** — Wire up the UI

This ensures each layer is tested before moving to the next.

### Database Migrations

Create migrations using [node-pg-migrate](https://salsita.github.io/node-pg-migrate/):

```bash
cd src/db
npx node-pg-migrate create your-migration-name
```

Edit the generated file in `src/db/migrations/`, then test it:

```bash
docker compose up --build
```

The `migrate` service will apply your migration automatically.

### Code Style

- **JavaScript/Node.js**: Follow the existing style in the codebase
- **React/Next.js**: Use functional components and hooks
- **Formatting**: Keep code clean and readable

### Testing Your Changes

1. **Start the stack**: `docker compose up --build`
2. **Check logs** for errors in all services
3. **Test in the browser** at http://localhost:3000
4. **Test API endpoints** directly if needed (via the web container or by exposing the API port)

### Common Tasks

**Add a new API endpoint:**
1. Add the route handler in `src/api/index.js`
2. Add database queries in `src/api/db.js` if needed
3. Test with curl or from the frontend

**Add a database column:**
1. Create a migration in `src/db/migrations/`
2. Update API endpoints to handle the new field
3. Update the frontend to display/edit it

**Update dependencies:**
1. Modify `package.json` in the appropriate service directory
2. Rebuild: `docker compose up --build`

## Pull Request Guidelines

- **Keep PRs focused** — One feature or fix per PR
- **Write a clear description** — Explain what changed and why
- **Reference issues** — Link to any related issues
- **Test thoroughly** — Ensure the app runs without errors
- **Update documentation** — If you change behavior, update the README

## Getting Help

- **Read the README** — Covers architecture and setup
- **Check agents.md** — Tips for AI-assisted development
- **Open an issue** — For bugs or feature requests
- **Ask questions** — In your PR or in a new issue

## Code of Conduct

Be respectful, constructive, and collaborative. We're all here to build something useful together.

## License

By contributing, you agree that your contributions will be licensed under the same [MIT License](LICENSE) that covers this project.
