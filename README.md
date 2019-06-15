# Push/Run Shared Actions

A repository of shared actions to include in your workflows

## Branch Cleanup

Automatically delete a pull request branch on merge.

**usage:**

```hcl
# Add the following to your ./flow.hcl

workflow "PR branch cleanup" {
  on = "pull_request:closed"
  resolves = "branch cleanup"
}

action "branch cleanup" {
  uses = "appleton/push-run-actions/branch-cleanup.js@1.0.0"
}
```
