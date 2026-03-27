const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)
const rootNodeModules = path.resolve(__dirname, '../../node_modules')

config.watchFolders = [path.resolve(__dirname, '../../packages/core')]
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  rootNodeModules,
]
config.resolver.extraNodeModules = new Proxy(
  {
    invariant: path.resolve(__dirname, './shims/invariant.js'),
    '@ungap/structured-clone': path.resolve(__dirname, './shims/structured-clone.js'),
  },
  {
    get(target, name) {
      if (typeof name !== 'string') {
        return undefined
      }
      return target[name] || path.join(rootNodeModules, name)
    },
  }
)

module.exports = config
