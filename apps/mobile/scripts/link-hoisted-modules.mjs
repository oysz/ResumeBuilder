import fs from 'node:fs'
import path from 'node:path'

const mobileRoot = process.cwd()
const workspaceRoot = path.resolve(mobileRoot, '../..')
const mobilePackageJson = JSON.parse(fs.readFileSync(path.join(mobileRoot, 'package.json'), 'utf8'))
const corePackageJson = JSON.parse(
  fs.readFileSync(path.join(workspaceRoot, 'packages/core/package.json'), 'utf8')
)
const hoistedDependencies = Object.entries({
  ...(mobilePackageJson.dependencies || {}),
  ...(corePackageJson.dependencies || {}),
})
  .filter(([, version]) => typeof version === 'string' && !version.startsWith('file:'))
  .map(([name]) => name)

const requiredModules = [
  ...hoistedDependencies,
  '@babel/runtime',
  'invariant',
  '@ungap/structured-clone',
]

const copied = new Set()

function modulePath(root, moduleName) {
  return path.join(root, 'node_modules', moduleName)
}

function ensureLocalModule(moduleName) {
  const sourcePath = modulePath(workspaceRoot, moduleName)
  const targetPath = modulePath(mobileRoot, moduleName)

  if (!fs.existsSync(sourcePath) || fs.existsSync(targetPath)) {
    return
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true })
  fs.cpSync(sourcePath, targetPath, { recursive: true })
  copied.add(moduleName)
  console.log(`[link-hoisted-modules] copied ${moduleName}`)
}

const queue = [...requiredModules]
const visited = new Set()

while (queue.length > 0) {
  const moduleName = queue.shift()
  if (!moduleName || visited.has(moduleName)) {
    continue
  }

  visited.add(moduleName)
  ensureLocalModule(moduleName)

  const localPackageJsonPath = path.join(modulePath(mobileRoot, moduleName), 'package.json')
  const rootPackageJsonPath = path.join(modulePath(workspaceRoot, moduleName), 'package.json')
  const packageJsonPath = fs.existsSync(localPackageJsonPath) ? localPackageJsonPath : rootPackageJsonPath

  if (!fs.existsSync(packageJsonPath)) {
    continue
  }

  const modulePackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  const transitiveDependencies = Object.keys(modulePackageJson.dependencies || {})

  for (const dependencyName of transitiveDependencies) {
    ensureLocalModule(dependencyName)
    if (!visited.has(dependencyName)) {
      queue.push(dependencyName)
    }
  }
}
