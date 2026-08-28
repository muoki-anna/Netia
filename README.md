# NetiaX Agrotech Solutions

NetiaX is an agriculture e-commerce and membership platform. It helps farmers browse and purchase farming products, manage subscriptions, earn rewards, and contact the NetiaX team through WhatsApp.

## Features

- Product store for seedlings, propagation media, irrigation systems, and greenhouse systems
- Shopping cart and M-Pesa payment flow
- Customer accounts, subscriptions, and loyalty rewards
- Blog, projects, shipping information, and policy pages
- Floating WhatsApp support chat
- Responsive navigation with Shop categories
- Light and dark themes

## Tech stack

- React and Vite for the web application
- Tailwind CSS and Radix UI components
- Express API
- PocketBase for data, authentication, migrations, and hooks

## Project structure

```
Netia/
??? web/          # React customer-facing website
??? api/          # Express API and integrations
??? pocketbase/   # PocketBase data, hooks, and migrations
??? package.json  # Workspace scripts
```

## Getting started

### Prerequisites

- Node.js 20 or later
- npm
- PocketBase binary (included in the `pocketbase/` directory)

### Install dependencies

```bash
npm install
```

### Run locally

Start the website, API, and PocketBase services together:

```bash
npm run dev
```

The web application is available at the address printed by Vite (normally `http://localhost:3000`). PocketBase runs on port `8090` by default.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Run the web app, API, and PocketBase in development mode. |
| `npm run build` | Create a production build of the web app. |
| `npm run lint` | Lint the web app and API. |
| `npm run start` | Start the API and PocketBase services. |

You can also run commands for an individual workspace, for example:

```bash
npm run dev --prefix web
npm run lint --prefix api
```

## Environment configuration

The API reads its environment variables from `api/.env`. Create this file locally and keep any credentials or secret keys out of version control.

## Contributing

1. Create a branch for your change.
2. Make and test the update locally.
3. Run `npm run lint` and `npm run build`.
4. Open a pull request with a concise description of the change.

## License

Private project ? all rights reserved by NetiaX Agrotech Solutions.
