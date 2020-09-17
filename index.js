const fs = require('fs')
const xlsx = require('node-xlsx')
const config = require('./config')

function job() {

    const report = {
        conflict: [], // 冲突数量
        sameTag: 0, // 相同标签数量
        unexpect: []
    } // 报告
    let map = new Map()
    // console.log(`正在读取[${config.mainFile}]数据`)
    // // 读取主文件
    // let main = xlsx.parse(config.mainFile)[0].data
    // // 数组转map
    // main.forEach(v => {
    //     map.set(v[0], v)
    // })
    // console.log(`读取[${config.mainFile}]数据共：${map.size}条`)

    let files = fs.readdirSync(config.inputDir) // 读取目标文件夹    
    files.forEach(file => {
        let excel = xlsx.parse(`${config.inputDir}/${file}`) // 读取表格
        let data = excel.length > 0? excel[0].data: []
        console.log(`正在处理文件[${file}]-共${data.length}条数据`)
        // 处理每个表格文件，只处理第一个sheet页
        data.forEach(v => {
            if (map.has(v[0])) {
                // 当前数据未包含
                let recode = map.get(v[0])
                let mainTag = new Tag(recode)
                let childTag = new Tag(v)
                
                recode = fill(recode, config.tagStart - 1) // 补充列数
                if (mainTag.length() === 0) {
                    // 主表中标签为空时，直接添加标签进主表
                    map.set(v[0], recode.concat(fill(childTag.tags, 3), at(v, config.tagStart + 2)))
                } else if (!mainTag.compareTo(childTag)) {
                    // 主表中存在标签，进行对比，不同时记录冲突
                    report.conflict.push(recode.concat(fill(childTag.tags, 3), at(v, config.tagStart + 2)))
                } else {
                   // 标签相同
                   report.sameTag ++
                }
            } else {
                // 未包含的数据
                map.set(v[0], v)
            }
        })
        console.log(`处理完成文件[${file}]`)
    })

    // 处理写入数据
    let outputData = []

    // map转为数组
    let mainList = []
    map.forEach(v => {
        mainList.push(v)
    })
    if (mainList.length > 0) outputData.push({
        name: 'sheet1',
        data: mainList
    })

    if (report.conflict.length > 0) outputData.push({
        name: '冲突',
        data: report.conflict
    })

    // if (report.unexpect.length > 0) outputData.push({
    //     name: '意料之外',
    //     data: report.unexpect
    // })


    // 写入
    fs.writeFile(config.outputFile, xlsx.build(outputData), "binary", function(err) {
        if (err) return console.error(err)
        console.log('写入文件成功！')
    })

    console.log(`需要处理冲突-${report.conflict.length}条`)
    // console.log(`意料外的输入-${report.unexpect.length}条`)
}

// 标签对象
function Tag(arr) {
    this.tags = arr.slice(config.tagStart - 1, config.tagStart + 2)
    // console.log('tag -> ', this.tags)
}
Tag.prototype.length = function() {
    return this.tags? this.tags.length: 0
}
Tag.prototype.has = function(tag) {
    return this.tags.some(t => t === tag)
}
Tag.prototype.compareTo = function(tag) {
    if (this.length() !== tag.length()) return false;
    return this.tags.every(t => tag.has(t))
}
function fill(arr, length) {
    if (arr.length < length)
        return arr.concat(new Array(length - arr.length))
    else 
        return arr
}

function at(arr, pos) {
    return pos < arr.length? arr[pos]: void 0
}

job()