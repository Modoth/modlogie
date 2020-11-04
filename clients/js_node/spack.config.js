const path = require('path')
const fs = require('fs')

class FileUtils {
    /**
     *
     * @param {string} file
     * @return { string[] }
     */
    static readdir(file) {
        return new Promise((resolve, reject) => {
            fs.readdir(file, (err, files) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(files)
                }
            })
        })
    }

    static exists(file) {
        return new Promise((resolve) => {
            fs.exists(file, resolve)
        })
    }
}

const getLocalConfigs = async () => {
    const srcFolder = path.join(__dirname, 'src')
    const subfolders = await FileUtils.readdir(srcFolder)
    let entries = {}
    let localCfg
    let localCfgFile =
        process.env['SPACK_CONFIG_FILE'] || './.local.spack.config.js'
    if (localCfgFile && (await FileUtils.exists(localCfgFile))) {
        try {
            localCfg = require(localCfgFile)
        } catch {
            console.log(`Config File Error: ${localCfgFile}`)
        }
    }
    for (let subfolder of subfolders) {
        let indexFile
        let template
        for (const fileName of ['index.html', 'app.js', 'app.html']) {
            let file = path.join(srcFolder, subfolder, fileName)
            if (await FileUtils.exists(file)) {
                indexFile = file
                if (fileName !== 'index.html') {
                    template = 'src/fastapp/index.html'
                }
                break
            }
        }
        if (!indexFile) {
            continue
        }
        entries[subfolder] = Object.assign(
            { path: indexFile, template },
            localCfg && localCfg.entries && localCfg.entries[subfolder]
        )
    }
    return {
        cd: (localCfg && localCfg.cd) || {},
        dist: localCfg && localCfg.dist,
        entries,
    }
}

module.exports = getLocalConfigs().then(({ cd, dist, entries }) => ({
    entries,
    output: {
        path: path.join(__dirname, dist || 'dist'),
        filename: '[name]',
    },
    cd,
}))