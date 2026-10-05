# mcc-website — notes for AI assistants

## Saving to GitHub

The owner works on more than one computer, and GitHub is how the work moves
between them. When the owner says "save to GitHub", "push", "sync", "back it up"
or "we're done", do this:

1. Run `git status` and say in plain words what is new or changed.
2. **Never commit secrets:** `.env` files, API keys, passwords, tokens, private
   keys. Scan the changed files for anything that looks like one. If you find one,
   stop and tell the owner.
3. **Never commit junk:** `node_modules`, `__pycache__`, `.pytest_cache`,
   Office lock files (`~$*`), local databases. Add them to `.gitignore` if they appear.
4. Files over 50 MB must be stored with Git LFS. If `.gitattributes` does not
   cover one, tell the owner before committing.
5. `git pull` first. If there is a conflict, stop and explain it in plain words;
   do not guess.
6. Commit everything with a message that says what this session did.
7. Push the current branch. If the branch is `main`, ask first: pushing there may update the live website on Vercel.
   Never force-push, delete branches or rewrite history.
8. Confirm `git status` says the branch is up to date with `origin` and nothing
   is left to commit. Then report the branch, a one-line summary of what was saved,
   and anything left out and why.

Saving to GitHub is not the same as publishing live. Deploying a site or app is a
separate step that needs the owner's OK.

### Starting a session

When the owner says "get the latest" or starts work on a computer:
run `git pull` and say which branch is checked out. On a fresh clone, run
`git fetch --all` and list the branches by most recent commit
(`git branch -r --sort=-committerdate`), because the newest work may not be
on the default branch. Ask which one to continue on.

