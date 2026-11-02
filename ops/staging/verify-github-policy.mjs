import assert from 'node:assert/strict'
import { REPOSITORY, assertRunnerEvent, verifyEnvironmentProtections } from './policy.mjs'
assertRunnerEvent(process.env)
assert.equal(process.env.STAGING_CICD_ENABLED, 'true', 'Staging CI/CD is not enabled by its administrator')
async function get(path) {
  const response = await fetch(`https://api.github.com/repos/${REPOSITORY}/${path}`, {
    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    signal: AbortSignal.timeout(15000),
  })
  assert.ok(response.ok, `Cannot verify GitHub deployment protections (${response.status})`)
  return response.json()
}
for (const name of ['staging', 'staging-discount-migration']) {
  const environment = await get(`environments/${name}`)
  const policies = await get(`environments/${name}/deployment-branch-policies`)
  // The REST environment API currently omits the UI administrator-bypass toggle.
  verifyEnvironmentProtections(environment, policies.branch_policies, process.env.STAGING_ADMIN_BYPASS_DISABLED === 'true')
}
console.log('Verified separate reviewers, no self-review and staging-only policy; owner attested the UI-only admin-bypass setting.')
