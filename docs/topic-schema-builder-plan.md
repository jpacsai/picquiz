# Topic Schema Builder Plan

## Goal

The goal is to move topic schema authoring out of direct database editing and into the application.

Today, documents in the `topics` collection act as blueprints for:

- quiz configuration
- quiz generation
- topic item upload/edit forms
- some admin search behavior

The app already consumes topic documents dynamically, so this project is mainly about adding a safe editor and validation layer for `topics`.

## Current State

### What already works

- `Topic` and `TopicField` already describe the runtime schema shape.
- Topic item forms are rendered dynamically from `topic.fields`.
- Quiz configuration is derived from `topic.fields` and `field.quiz`.
- Quiz generation also depends on the topic schema.

### What is missing

- No UI for creating or editing `topics` documents.
- No write service for `topics`.
- No schema validation flow before saving topic definitions.
- No preview flow for checking whether a topic schema will work before it is used.

## Main Idea

Build an admin-only `Topic Schema Builder` that can:

1. create a new topic schema
2. duplicate an existing topic schema
3. edit a topic schema
4. validate the schema before save
5. preview how the schema behaves in the item upload form and quiz flow

## Scope Recommendation

### MVP

The first version should support:

- topic metadata editing
- field list editing
- field order changes
- field type selection
- field-level options editing
- quiz config editing
- validation before save
- save to Firestore

### Later

Nice follow-up features:

- duplicate topic from admin UI
- preview with sample item data
- schema diff / change summary before save
- migration helpers for existing item collections
- publish/draft workflow
- version history

## Proposed User Flow

### New topic

1. Admin opens `Topic Builder`.
2. Admin enters base topic metadata:
   - `id`
   - `label`
   - `slug`
   - `storage_prefix`
3. Admin adds fields one by one.
4. Admin configures field-specific behavior.
5. Admin configures quiz behavior for eligible fields.
6. Admin reviews validation warnings/errors.
7. Admin saves the topic.
8. App redirects to the topic admin page or builder detail page.

### Existing topic

1. Admin opens an existing topic schema.
2. App loads current schema.
3. Admin edits metadata or fields.
4. App shows impact warnings if a risky change is detected.
5. Admin saves after validation passes.

### Duplicate topic

1. Admin selects an existing topic.
2. Admin chooses `Duplicate`.
3. App pre-fills the builder with copied fields.
4. Admin changes `id`, `slug`, `storage_prefix`, labels as needed.
5. Admin saves as a new topic.

## Suggested Information Architecture

### Admin routes

Suggested new routes:

- `/admin/topics/new`
- `/admin/topics/$topicId/edit`
- optionally `/admin/topics/$topicId`

Alternative:

- keep topic schema management under existing admin entry points
- add a new card/button from the admin dashboard

### Main screens

Suggested builder layout:

1. Topic metadata section
2. Field list section
3. Field editor panel
4. Validation panel
5. Preview panel
6. Save actions

## Data Model Notes

### Existing runtime model

Current topic documents already contain:

- `label`
- `slug`
- `storage_prefix`
- `fields`

Each field may contain:

- base properties like `key`, `label`, `required`, `readonly`, `type`
- optional derivation config via `fn`
- optional quiz config via `quiz`
- type-specific config like `options` or `targetFields`

### Builder form model

The builder can use a dedicated draft type such as:

```ts
type TopicDraft = {
  id: string;
  label: string;
  slug: string;
  storage_prefix: string;
  fields: TopicFieldDraft[];
};
```

That draft can stay close to the runtime model, but it is useful to allow temporary invalid states in the editor until validation runs.

## Validation Requirements

### Topic-level validation

- `id` is required
- `label` is required
- `slug` is required
- `storage_prefix` is required
- `id` must be unique for creates
- `slug` should be unique if it maps to a Firestore collection

### Field-level validation

- every field needs a unique `key`
- every field needs a `label`
- every field needs a valid `type`
- derived fields must reference an existing source field
- image upload fields must reference valid file name fields
- image upload fields must define valid target fields
- select fields must have non-empty options
- quiz config should only be allowed on `string`, `number`, `select`

### Cross-field validation

- only one image upload field should be allowed unless multi-image support is intentionally added
- `fn.source` cannot reference the field itself
- derived fields should use compatible source field types
- `quiz.distractor.sourceField` must exist
- `hideInEdit` + `required` combinations may need warning-level validation

### Change-risk validation for existing topics

When editing an existing topic with existing items, warn if:

- a field key is renamed
- a field type changes
- an image target mapping changes
- a field used by quiz config is removed
- a field referenced by another field is removed
- `slug` changes
- `storage_prefix` changes

## Recommended Implementation Phases

## Phase 1: Foundation

Goal: prepare reusable model + validation + persistence pieces.

Tasks:

1. Create a `TopicDraft` model and mapping helpers.
2. Extract topic normalization into a shared place if needed.
3. Add a `topics` service module for:
   - create topic
   - update topic
   - optionally duplicate topic helper
4. Add topic query invalidation helpers.
5. Add builder validation utilities.

Deliverable:

- builder-safe data layer exists
- validation can run without UI

## Phase 2: Builder UI MVP

Goal: create the first usable admin editor.

Tasks:

1. Add admin routes for new/edit topic schema.
2. Build metadata editor.
3. Build field list editor:
   - add field
   - delete field
   - reorder field
   - choose field type
4. Build field detail editor for each supported type:
   - `string`
   - `number`
   - `select`
   - `imageUpload`
5. Build quiz config editor inside eligible field types.
6. Add validation summary UI.
7. Save through the new topics service.

Deliverable:

- admin can create and edit a topic schema in-app

## Phase 3: Preview and Safety

Goal: reduce the risk of saving broken schemas.

Tasks:

1. Add form preview using the same field renderer pattern as item forms.
2. Add quiz preview summary:
   - which fields are quiz-eligible
   - which prompts exist
   - whether distractor config is complete
3. Add risky-change warnings for editing existing topics.
4. Add duplicate topic action.

Deliverable:

- builder is safer for real-world use

## Phase 4: Refinement

Goal: improve maintainability and admin confidence.

Tasks:

1. Add better field presets/templates.
2. Add import/export of topic JSON.
3. Add history or snapshot support.
4. Add migration helpers if field keys change.

Deliverable:

- builder becomes a full schema management tool

## UI Component Breakdown

### Candidate components

- `TopicSchemaBuilderPage`
- `TopicSchemaBuilderForm`
- `TopicMetadataSection`
- `TopicFieldList`
- `TopicFieldListItem`
- `TopicFieldEditor`
- `TopicFieldTypeEditor`
- `QuizFieldConfigEditor`
- `ImageUploadFieldConfigEditor`
- `TopicSchemaValidationPanel`
- `TopicSchemaPreviewPanel`

### Reuse opportunities

Potentially reusable from current app:

- form field rendering patterns
- validation style
- existing admin page layout
- query handling for topics/items

## Technical Decisions To Confirm

These are worth agreeing on before implementation:

1. Can admins edit existing topics freely, or should editing be limited after items already exist?
2. Do we want hard blocks or just warnings for risky schema changes?
3. Should `slug` remain the Firestore collection name for items long term?
4. Should the builder support multiple image upload fields, or explicitly one?
5. Do we want `id` to be user-entered or generated?
6. Do we want draft autosave locally before Firestore save?

## Risks

### Biggest risks

- breaking existing item collections with schema changes
- creating quiz configs that look valid structurally but fail in real data
- allowing field relationships that the runtime does not fully support
- making the builder too generic before the constraints are clear

### Risk mitigation

- validate aggressively
- treat destructive edits carefully
- start with a constrained MVP
- reuse existing runtime assumptions instead of inventing a second schema system

## Recommended MVP Boundaries

To keep the first version focused, I recommend:

- support only the field types that already exist
- support only the derivation functions that already exist
- support only the quiz config options that already exist
- no schema versioning in v1
- no automatic migration of item documents in v1
- duplication support can be v1 or v1.1 depending on time

## Delivery Plan

Suggested implementation order:

1. write validation and persistence layer
2. build the topic draft editor page
3. add field editing UI
4. add save flow
5. add preview
6. add edit-risk warnings
7. test with one existing topic end to end

## Open Questions

- Should the builder live under the current admin topic pages, or under a separate schema admin area?
- Do we want topic schema editing available in production immediately, or only in development/admin first?
- Should existing topics be editable from day one, or should v1 focus on creating new topics only?
- Do we want the builder to expose every raw field property, or hide some advanced options behind an `Advanced` section?

## Working Agreement

If this document is edited in place, it can be used as the source of truth for the next implementation steps.

Expected workflow:

1. You edit this file.
2. I re-read it.
3. I implement from the updated version.
4. If something conflicts with the current codebase, I call it out and propose the smallest adjustment.
