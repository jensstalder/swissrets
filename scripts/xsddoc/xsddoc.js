const globby = require('globby')
const path = require('path')
const fs = require('fs-extra')
const { exec } = require('../lib')

const xsddoc = async () => {
  const { CLASSPATH } = process.argv
  const locator = process.platform === 'win32'
    ? 'where'
    : 'which'

  const executable = await exec(`${locator} java`)
  const localClassPath = []

  if (CLASSPATH) {
    localClassPath.push(CLASSPATH)
  }

  const libClasses = await globby('lib/*.jar', { cwd: __dirname })
  localClassPath.push(...libClasses.map(file => path.resolve(__dirname, file)))
  const classpath = localClassPath.join(':')

  const outputDir = path.join(__dirname, '..', '..', 'docs', 'docs')
  await fs.remove(outputDir)
  await fs.ensureDir(outputDir)

  const head = '<a href="https://swissrets.ch" target="__top"><strong>Back to SwissRETS</strong></a>'

  const args = [
    `-h "${head}"`,
    '-t "SwissRETS"',
    '-v',
    `-o ${outputDir}`,
    path.join(__dirname, '..', '..', 'schema', 'schema.xsd')
  ].join(' ')

  // execute xsddoc
  await exec(`${executable} -classpath ${classpath} net.sf.xframe.xsddoc.Main ${args}`, {
    stdio: 'inherit',
    printCommand: true
  })

  // override stylesheet, with custom styles
  const styleFile = 'stylesheet.css'
  await fs.copy(
    path.join(__dirname, styleFile),
    path.join(outputDir, styleFile)
  )
}

module.exports = xsddoc
