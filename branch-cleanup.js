const Octokit = require('@octokit/rest')
const token = process.env.GITHUB_TOKEN
const client = new Octokit({ auth: `token ${token}` })
const data = JSON.parse(process.env.EVENT_JSON)

async function main() {
  const ref = data.pull_request.head.ref
  const owner = data.pull_request.head.repo.owner.login
  const repo = data.pull_request.head.repo.name

  if (!data.pull_request.merged) {
    console.log(`Skipping: branch "${ref}" has not been merged`)
    return
  }

  const repoInfo = await client.repos.get({ owner, repo })
  const defaultBranch = repoInfo.data.default_branch
  if (defaultBranch === ref) {
    console.log(`Skipping: cannot delete default branch "${ref}"`)
    return
  }

  const branchInfo = await client.repos.getBranch({ owner, repo, branch: ref })
  if (branchInfo.data.is_protected) {
    console.log(`Skipping: cannot delete protected branch "${ref}"`)
    return
  }

  const pullsWithRefAsBase = await client.pulls.list({
    owner,
    repo,
    state: 'open',
    base: ref
  })

  if (pullsWithRefAsBase.data.length) {
    console.log(
      `Skipping: ${ref} is the base of PR ${pullsWithRefAsBase.data[0].number}`
    )
    return
  }

  console.log(`Deleting branch "${ref}" for ${owner}/${repo}...`)
  try {
    const deleteResponse = await client.git.deleteRef({
      owner,
      repo,
      ref: `heads/${ref}`
    })
    console.log(`Branch ${ref} deleted`)
    if (deleteResponse.status === 422) {
      console.log(`The branch ${ref} was already deleted`)
    } else if (deleteResponse.status === 204) {
    } else {
      console.log('Something unexpected happened!')
      console.log(
        `status: ${deleteResponse.status}, response body: ${deleteResponse.data}`
      )
    }
  } catch (error) {
    console.log('Something unexpected happened!')
    console.log(error.message)
  }
}

// module.exports is only required for the async tests to function
module.exports = main()
