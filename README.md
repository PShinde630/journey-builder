# Journey Builder

React implementation of the Avantos Journey Builder challenge. The app loads an action blueprint graph from the mock server, renders the journey forms, and lets users view, create, edit, clear, and persist prefill mappings for form fields.

## Features

- Fetches the action blueprint graph from the challenge mock server.
- Renders journey forms as a selectable list.
- Shows fields for the selected form.
- Supports direct dependency, earlier dependency, and global data prefill sources.
- Filters upstream form source fields to the same field key as the target field.
- Supports searching source options in the picker modal.
- Persists mappings in `localStorage` by graph id.
- Includes Vitest coverage for source discovery and dependency traversal.

## Run Locally

This project needs two processes:

1. The Avantos mock API server on port `3000`.
2. This Vite React app on port `5173`.

### 1. Start the Mock Server

In a separate terminal:

```bash
cd ~
git clone https://github.com/mosaic-avantos/frontendchallengeserver.git
cd frontendchallengeserver
npm install
npm start
```

If you already cloned the mock server, skip `git clone` and run:

```bash
cd ~/frontendchallengeserver
npm start
```

The frontend calls:

```text
http://localhost:3000/api/v1/1/actions/blueprints/bp_01jk766tckfwx84xjcxazggzyc/graph
```

### 2. Start This App

In another terminal, clone and run this React app:

```bash
cd ~
git clone https://github.com/PShinde630/journey-builder.git
cd journey-builder
npm install
npm run dev
```

If you already cloned this repository, run:

```bash
cd ~/journey-builder
npm install
npm run dev
```

Open:

```text
http://localhost:5173/
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run test
```

## Project Structure

```text
src/
  api/          API client code
  components/   React UI components
  hooks/        React data/state hooks
  types/        Shared TypeScript types
  utils/        Pure graph and prefill logic
```

The key prefill logic lives in:

```text
src/utils/prefill.ts
src/hooks/usePrefillMappings.ts
src/components/PrefillSourceModal.tsx
```

## Adding New Data Sources

The source picker renders generic `PrefillSourceGroup` objects. To add a new source, add another group in `getPrefillSourceGroups()` inside `src/utils/prefill.ts`.

Example shape:

```ts
{
  id: 'user-profile',
  label: 'User Profile',
  description: 'Current user attributes.',
  options: [
    {
      id: 'user-profile:user_email',
      sourceFormName: 'User Profile',
      sourceFieldId: 'user_email',
      sourceFieldLabel: 'User Email',
      sourceType: 'global',
    },
  ],
}
```

Once the group is returned from `getPrefillSourceGroups()`, the modal will render it automatically. No modal component changes are needed.

## Notes

- Existing mappings are saved in browser `localStorage`.
- If no saved mappings exist, the app seeds one demo mapping for `Form B.email` from `Form A.email`.
- Upstream form fields are filtered to the same field key as the target field. Global sources remain available even when their keys do not match.
