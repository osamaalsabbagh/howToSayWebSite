# How To Say website

## Generated lesson snapshots

The published version 23 app reads the existing unversioned paths under `generated/`. Keep those files unchanged so its bundled sentences continue to match its lessons.

Starting with app API version 24, lessons live under `generated/v<apiVersion>/`. Keep every published snapshot unchanged and retain older snapshots for users who have not updated.

Prepare a new snapshot from the sibling app repository:

```bash
cd ../howToSay
npm run generated-lessons:sync -- --dry-run
npm run generated-lessons:sync
```

The command uses `constants/Constants.ts` as the version source and refuses to overwrite an existing version. Review and commit the new version directory in this website repository, then deploy it before releasing the matching app. Never run a sync with `--delete` against the entire website `generated/` directory.
