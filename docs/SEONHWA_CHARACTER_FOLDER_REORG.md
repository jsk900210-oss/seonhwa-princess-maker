# Seonhwa Character Folder Reorg

Updated: 2026-08-19

## Goal

Separate the character asset structure into:

- home representative character assets
- schedule (Tsukuru-style) character assets
- legacy folders that can be retired after migration

## Final Structure

Character root:

`assets/characters/seonhwa/`

Keep as home representative character assets:

- `identity/`
- `age-09/base/`
- `age-13/base/`
- `age-16/base/`
- `age-18/base/`

Use as schedule character assets:

- `schedule-base/`
- `schedule-actions/`
- `schedule-npc/`

Keep as intro-only assets:

- `age-09/intro/`

## Naming Rule

- Home representative character: front-facing home, dialogue, and portrait references
- Schedule character: all in-schedule Tsukuru-style visuals
- Intro character: first-entry walking sequence only

## Migration Rule

Move or rebuild assets into the new schedule folders by this order:

1. `schedule-base/`
   - standing neutral
   - walking cycle
   - sitting base
   - sleeping base

2. `schedule-actions/`
   - reading
   - arithmetic
   - cleaning
   - sweeping
   - herbs/errand
   - work-study variants

3. `schedule-npc/`
   - helper NPCs
   - teachers
   - work partners

## Legacy Delete Candidates

These are not the target structure anymore and should be removed only after schedule assets are rebuilt and relinked:

- `activity-consistent/`
- `activity-modular/`
- `job-actions/`
- `wardrobe/`

## Delete Order

1. finish relinking code to `schedule-base/` and `schedule-actions/`
2. verify home character still points only to `identity/` and `age-xx/base/`
3. verify intro still points only to `age-09/intro/`
4. remove legacy folders one by one:
   - `wardrobe/`
   - `job-actions/`
   - `activity-modular/`
   - `activity-consistent/`
5. run asset verification and launch QA

## Current Decision

- the schedule character will use the age-09 Tsukuru-style basis for all ages
- home representative character and schedule character are separate asset systems
- work clothes stay fixed by activity, not by wardrobe outfit layering
