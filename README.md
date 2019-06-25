# Push/Run Shared Actions

A repository of shared actions to include in your workflows

## Branch Cleanup

Automatically delete a pull request branch on merge.

<img width="783" alt="Screenshot 2019-06-16 at 5 32 41 pm" src="https://user-images.githubusercontent.com/241576/59566789-d10a1280-905c-11e9-860d-1d4148cdcf07.png">

**usage:**

```hcl
# Add the following to your ./flow.hcl

workflow "PR branch cleanup" {
  on = "pull_request:closed"
  resolves = "branch cleanup"
}

action "branch cleanup" {
  uses = "push-run/actions/branch-cleanup.js@1.0.0"
}
```
