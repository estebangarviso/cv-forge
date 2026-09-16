---
name: google-drive-cv-storage
description: 'Trigger: Google Drive storage, DriveRepository, CV JSON file, save CV, list CVs, delete CV, name conflict. Store and retrieve CvData as JSON files in Drive.'
license: Proprietary
metadata:
    author: estebangarviso
    version: '1.2'
---

## Activation Contract

Use when reading, writing, listing, or deleting CV data through Google Drive. There is no database — Drive is the sole source of truth.

## Hard Rules

- Never call `googleapis` directly from components, hooks, or route handlers — always go through `DriveRepository` (`src/modules/drive/infrastructure/google-drive.repository.ts`) via `CvRepository` (`src/modules/cv/infrastructure/drive-cv.repository.ts`).
- Folder layout under the app's root `CV Studio` folder (auto-provisioned by `getOrCreateFolder('CV Studio')`, never hardcode any folder id): CVs live in `CV Studio/documents/`, custom fonts in `CV Studio/assets/fonts/` — never put both file types in the same folder again. `getOrCreateFolder(name, parentId)` scopes its search/create by `parentId` when given (unscoped, Drive-wide, only for the top-level `CV Studio` lookup itself) — always pass the parent when resolving a subfolder, or you'll risk matching a same-named folder elsewhere in the user's Drive.
- Each CV is one JSON file (`application/json`) inside `documents/`.
- File name is derived from `cv.cvTitle || cv.name || 'Untitled CV'` + `.json`; enforce uniqueness with `findFileByName` (excluding the CV's own id) before create/update, throwing `CvNameConflictError` on conflict.
- Build the Drive client per-request from `session.accessToken` (`new google.auth.OAuth2()` + `setCredentials`) — never cache a Drive client across requests or users.
- Custom fonts (Fase 4) live in `CV Studio/assets/fonts/`, resolved by `DriveFontRepository.resolveFontsFolder()` — see `modules/font/infrastructure/drive-font.repository.ts` (`FontRepository`, mirrors `DriveCvRepository`'s shape). `listFiles`/`findFileByName` (CVs) still filter strictly by `mimeType='application/json'`, so font files never show up in the CV list regardless of folder — the folder split is for tidiness in My Drive, not a correctness requirement.
- **Migrating pre-existing loose files**: files created before this folder split still sit directly in the root `CV Studio` folder. Each repo self-heals with a targeted, low-frequency migration — `DriveCvRepository.resolveDocumentsFolder(migrate)` only runs it from `list()` (once per page load), never from `save()` (runs on every autosave); `DriveFontRepository.resolveFontsFolder()` only runs from `upload()` (rare). Both use `driveRepo.moveFile(fileId, newParentId, oldParentId)` (Drive's `addParents`/`removeParents`), which is idempotent — once a file has moved, later runs find nothing left in root and do nothing. Never add a migration check to a hot path (autosave, font metadata/content reads by id — those don't even need folder resolution).
- A font's `family`/`features`/`originalFileName` are stored as JSON in the Drive file's own `description` field (`createFile`'s optional 5th param), read back via `getFileMetadata` (metadata-only `files.get`, no content download) — never a second sidecar file.

## Decision Gates

| Need                                     | Do                                                                                                                                     |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| List CVs                                 | `listFiles(folderId)` filtered by `mimeType='application/json' and trashed=false`, map to `{cvTitle, id, updatedAt}`                   |
| Read one CV                              | `getFile(id)` (`alt=media`) → `JSON.parse` → `CvDataSchema.parse({...parsed, id})`                                                     |
| Create/update                            | `save()`: check name conflict, then `createFile`/`updateFile`, stamp `updatedAt` (+`createdAt` on create)                              |
| Delete                                   | `deleteFile(id)` — hard delete, not trash                                                                                              |
| Route needs a 409                        | Catch `CvNameConflictError` in the route handler, respond with `{ status: 409 }`                                                       |
| Read a font's metadata only (no content) | `getFileMetadata(id)` → parse `.description` as JSON — cheap, no `alt=media` download                                                  |
| Read a font's actual bytes               | `getFile(id)` (`alt=media`, `responseType:'text'`) — returns the base64 text that was uploaded as-is, see react-pdf-cv-rendering skill |

## Execution Steps

1. Get the port via `getCvRepository(session.accessToken)` (`cv.factory.ts`).
2. Call the matching `CvRepository` method; never touch `DriveRepository` from outside `drive-cv.repository.ts`.
3. In route handlers, guard `session?.accessToken` first (401 if missing) before any repo call.
4. Validate all Drive JSON payloads with `CvDataSchema.parse` before returning to the client.

## Output Contract

Return the typed `CvData` (or an array of `{cvTitle, id, updatedAt}` for list), or throw `CvNameConflictError` for the route layer to translate into a 409.

## References

- `src/modules/drive/infrastructure/google-drive.repository.ts`
- `src/modules/cv/infrastructure/drive-cv.repository.ts`
- `src/app/api/cv/route.ts`, `src/app/api/cv/[id]/route.ts`
