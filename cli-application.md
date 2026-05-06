# VIC CLI Application

## Overview

`vic` is a Git-like version control CLI written in Go. It stores repository data in a local `.vic/` directory and supports local versioning plus remote sync against a VIC server.

This document reflects the current command surface in the repository and includes the newer CLI features that were added after the earlier snapshot-style notes.

## Current Capabilities

- Initialise a repository with `vic init`
- Stage files and directories with `vic add`
- Create commits with `vic commit -m`
- Inspect repository state with `vic status`, `vic diff`, and `vic log`
- Create, list, delete, and switch branches
- Clone, fetch, pull, push, and manage remotes
- Log in to a VIC server and reuse saved sessions
- Watch a remote repository for real-time activity
- Perform fast-forward and three-way merges, including conflict recovery

## Command Summary

### Root

```bash
vic
```

VIC stores snapshots of your files and syncs them with a remote VIC server.

### Repository Setup

#### `vic init [directory]`

Initialises a new VIC repository in the current directory or in the optional target directory.

Examples:

```bash
vic init
vic init my-project
```

#### `vic clone <url> [directory]`

Clones a remote repository into a new directory.

Behavior:

- Uses the last path segment from the URL if no directory is provided
- Creates `origin` automatically in repo config
- Restores the remote `HEAD` branch into the working tree
- Reuses an existing saved session when exactly one user is logged in for that server
- Stops and asks for an in-repo login later if multiple users are logged in for the same server

Examples:

```bash
vic clone http://localhost:3000/api/repos/acme/demo
vic clone http://localhost:3000/api/repos/acme/demo demo-local
```

### Authentication

#### `vic auth login <server-url>`

Prompts for username or email and password, logs in to the VIC server, and stores the session locally.

Behavior:

- Saves the session token in the local session store
- If run inside a VIC repository, updates the repo config `ActiveServer` and `ActiveUser`

Example:

```bash
vic auth login http://localhost:3000
```

#### `vic auth logout <server-url>`

Removes the saved session for a server.

Example:

```bash
vic auth logout http://localhost:3000
```

### Working Tree and Staging

#### `vic add <path>...`

Adds one or more files or directories to the staging area.

Behavior:

- Recursively stages files when a directory is provided
- Skips the `.vic` directory automatically
- Rejects files outside the repository root
- Preserves executable file mode when applicable

Examples:

```bash
vic add main.go
vic add cmd internal
```

#### `vic status`

Shows the current branch plus:

- staged changes
- unstaged changes
- untracked files

It also handles detached `HEAD` display and shows `No commits yet.` for a fresh repository.

#### `vic diff [paths...]`

Shows unstaged changes by default, comparing the working tree against the index.

Examples:

```bash
vic diff
vic diff cmd/status.go
```

#### `vic diff --staged [paths...]`

Shows staged changes, comparing the index against `HEAD`.

Example:

```bash
vic diff --staged
```

### Commits and History

#### `vic commit -m "<message>"`

Creates a commit from the staged index.

Behavior:

- Requires a non-empty commit message
- Requires at least one staged entry
- Requires an authenticated user in the current repository
- Uses the logged-in user as commit author
- Includes merge parents automatically when a merge is in progress

Example:

```bash
vic commit -m "Add remote branch listing"
```

#### `vic log`

Prints commit history starting from `HEAD`.

Behavior:

- Shows commit hash
- Shows merge parents for merge commits
- Shows author and parsed timestamp when available
- Prints the first line of the commit message

### Branching and Checkout

#### `vic branch`

Lists local branches and marks the checked-out branch with `*`.

#### `vic branch <name>`

Creates a new local branch at the current `HEAD`.

Constraint:

- The current branch must already have a commit

#### `vic branch -d <name>`

Deletes a local branch.

Constraint:

- The currently checked-out branch cannot be deleted

#### `vic branch -r`

Lists remote-tracking branches from `refs/remotes/`.

#### `vic branch -a`

Lists both local and remote-tracking branches.

Examples:

```bash
vic branch
vic branch feature/login
vic branch -d old-feature
vic branch -r
vic branch -a
```

#### `vic checkout <branch|commit>`

Checks out a local branch, a remote-tracking branch, or a full commit hash.

Behavior:

- Local branch checkout moves `HEAD` to that branch
- Remote-tracking checkout uses detached `HEAD`
- Full 40-character commit hash checkout uses detached `HEAD`

#### `vic checkout -b <new-branch> <start-point>`

Creates and switches to a new branch from:

- a local branch
- a remote-tracking branch like `origin/main`
- a full commit hash

Examples:

```bash
vic checkout main
vic checkout origin/main
vic checkout 0123456789abcdef0123456789abcdef01234567
vic checkout -b feature/auth main
vic checkout -b fix/pull origin/main
```

### Merge Workflow

#### `vic merge <branch>`

Merges another branch into the current branch.

Supported behavior:

- already up-to-date detection
- fast-forward merges
- three-way merges
- conflict detection
- merge commits with two parents
- remote-tracking branch targets such as `origin/main`

When conflicts happen, VIC:

- writes merge state files in `.vic/`
- updates the working tree with merge results
- updates the index with merged entries
- stops before creating the merge commit

Typical conflict resolution flow:

```bash
vic merge feature-x
vic add <resolved-file>
vic commit -m "Resolve merge"
```

#### `vic merge --continue`

Completes an in-progress merge after conflicts are resolved and staged.

#### `vic merge --abort`

Aborts an in-progress merge and restores the original `HEAD`.

Examples:

```bash
vic merge feature-x
vic merge --continue
vic merge --abort
```

## Remote Management

#### `vic remote add <name> <url>`

Adds a named remote to repo config.

#### `vic remote list`

Lists configured remotes.

#### `vic remote get-url <name>`

Prints the configured URL for a remote.

#### `vic remote set-token <name> <token>`

Stores a Bearer token on a remote entry.

Examples:

```bash
vic remote add origin http://localhost:3000/api/repos/acme/demo
vic remote list
vic remote get-url origin
vic remote set-token origin <token>
```

## Sync Commands

#### `vic fetch <remote>`

Downloads objects and refs from a remote repository.

Behavior:

- Requires a configured remote
- Requires an active logged-in user for the repository
- Writes remote-tracking refs under `refs/remotes/<remote>/...`

Example:

```bash
vic fetch origin
```

#### `vic pull <remote> <branch>`

Fetches from the remote, then fast-forwards the local branch.

Behavior:

- creates the local branch pointer if it does not exist yet
- stops if the local branch has diverged
- suggests `vic merge <remote>/<branch>` when a three-way merge is required

Example:

```bash
vic pull origin main
```

#### `vic push <remote> <branch>`

Pushes a local branch to the remote repository.

Behavior:

- requires the local branch to have commits
- requires a configured remote
- requires an active logged-in user for the repository
- rejects non-fast-forward updates
- uploads reachable objects before advancing the remote branch ref

Example:

```bash
vic push origin main
```

## Real-Time Repository Watch

#### `vic watch`

Connects to the `origin` repository over WebSocket and listens for activity.

Current notifications:

- push events
- pull request updates
- generic activity events

Requirements:

- `origin` must exist
- the repository must have an active logged-in user

Example:

```bash
vic watch
```

## Internal Layout

### Top-Level Structure

```text
cli_application/
|-- cmd/
|-- internal/
|-- go.mod
|-- go.sum
|-- main.go
|-- cli-application.md
```

### Command Layer

`cmd/` contains the Cobra command definitions:

- `add.go`
- `auth.go`
- `branch.go`
- `checkout.go`
- `clone.go`
- `cmd.go`
- `commit.go`
- `diff.go`
- `fetch.go`
- `init.go`
- `log.go`
- `merge.go`
- `pull.go`
- `push.go`
- `remote.go`
- `status.go`
- `watch.go`

### Internal Packages

`internal/` contains the implementation for:

- authentication client and session handling
- repository initialisation and discovery
- object, tree, commit, ref, and index storage
- clone, fetch, pull, and push transport logic
- merge logic and worktree checkout
- WebSocket-based watch notifications

## Notable Newer Additions

Compared with the earlier snapshot-oriented documentation, the current CLI now clearly includes these newer user-facing features:

- `auth login` and `auth logout`
- `remote set-token`
- `branch -r`, `branch -a`, and `branch -d`
- `checkout -b <new> <start-point>`
- `diff --staged`
- `merge --continue`
- `merge --abort`
- `watch`
- remote-tracking branch support in checkout, merge, fetch, and pull

## Notes and Constraints

- Most remote operations depend on repository-level `ActiveUser` state, which is set during login.
- `commit`, `fetch`, `pull`, `push`, and `watch` rely on an authenticated session.
- `pull` is fast-forward only; use `merge` when histories diverge.
- Detached `HEAD` is supported for direct commit-hash and remote-tracking checkouts.
