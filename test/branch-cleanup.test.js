const { expect } = require('chai')
const nock = require('nock')
const run = require('./support/runner')

describe('branch-cleanup.js', () => {
  let api, eventData, ref, owner, repo, isProtected, otherPRs, deleteBranch

  beforeEach(() => {
    ref = 'new-feature'
    owner = 'appleton'
    repo = 'dotfiles'
    merged = true
    defaultBranch = 'master'
    isProtected = false
    otherPRs = []

    eventData = JSON.stringify({
      pull_request: {
        merged,
        head: { ref, repo: { name: repo, owner: { login: owner } } }
      }
    })

    api = nock('https://api.github.com')
      .get(`/repos/${owner}/${repo}`)
      .reply(200, () => ({ default_branch: defaultBranch }))
      .get(`/repos/${owner}/${repo}/branches/${ref}`)
      .reply(200, () => ({ is_protected: isProtected }))
      .get(`/repos/${owner}/${repo}/pulls?state=open&base=${ref}`)
      .reply(200, () => otherPRs)

    deleteBranch = api
      .delete(`/repos/${owner}/${repo}/git/refs/${ref}`)
      .reply(204)
  })

  it('deletes the branch', async () => {
    await run('branch-cleanup.js', { EVENT_JSON: eventData })
    expect(deleteBranch.isDone()).to.eq(true)
  })

  describe('when the branch was not merged', () => {
    beforeEach(() => {
      eventData = JSON.stringify({
        pull_request: {
          merged: false,
          head: { ref, repo: { name: repo, owner: { login: owner } } }
        }
      })
    })

    it('does not delete the branch', async () => {
      await run('branch-cleanup.js', { EVENT_JSON: eventData })
      expect(deleteBranch.isDone()).to.eq(false)
    })
  })

  describe('when the branch is the default', () => {
    beforeEach(() => {
      defaultBranch = ref
    })

    it('does not delete the branch', async () => {
      await run('branch-cleanup.js', { EVENT_JSON: eventData })
      expect(deleteBranch.isDone()).to.eq(false)
    })
  })

  describe('when the branch is protected', () => {
    beforeEach(() => {
      isProtected = true
    })

    it('does not delete the branch', async () => {
      await run('branch-cleanup.js', { EVENT_JSON: eventData })
      expect(deleteBranch.isDone()).to.eq(false)
    })
  })

  describe('when the branch is the base of another PR', () => {
    beforeEach(() => {
      otherPRs = [{ number: 1 }]
    })

    it('does not delete the branch', async () => {
      await run('branch-cleanup.js', { EVENT_JSON: eventData })
      expect(deleteBranch.isDone()).to.eq(false)
    })
  })
})
