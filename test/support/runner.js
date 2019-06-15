const { NodeVM } = require('vm2')
const path = require('path')
const fs = require('fs')

module.exports = function run(file, env = {}) {
  return new Promise(async (resolve, reject) => {
    env = Object.assign(
      {
        GITHUB_TOKEN: 'abctoken',
        EVENT_JSON: '{}'
      },
      env
    )

    const vm = new NodeVM({
      eval: false,
      wasm: false,
      require: {
        external: {
          modules: ['@octokit/*'],
          transitive: true
        },
        nesting: false
      },
      sandbox: { process: { env }, console: { log() {}, error() {} } }
    })

    const filePath = path.join(__dirname, '../../', file)

    try {
      await vm.run(fs.readFileSync(filePath), filePath)
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}
