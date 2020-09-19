const { throws } = require('assert')
const fs = require('fs')
const xlsx = require('node-xlsx')
const config = require('./config')

function jobV2() {

    const report = {
        conflict: [], // 冲突数量
        sameTag: 0, // 相同标签数量
        unexpect: []
    } // 报告
    let map = new Map()
    console.log(`正在读取[${config.mainFile}]数据`)
    // 读取主文件
    let main = xlsx.parse(config.mainFile)[0].data
    // console.log(new Row(main[0]).toArray())
    // return;
    // 数组转map
    main.forEach(v => {
        if (!v[0] || v[0].length <= 0) return;
        map.set(v[0], new Row(v))
    })
    console.log(`读取[${config.mainFile}]数据共：${map.size}条`)

    let files = fs.readdirSync(config.inputDir) // 读取目标文件夹  
    
    files.forEach(file => {
        let excel = xlsx.parse(`${config.inputDir}/${file}`) // 读取表格
        let data = excel.length > 0? excel[0].data: []
        console.log(`正在处理文件[${file}]-共${data.length}条数据`)
        // 处理每个表格文件，只处理第一个sheet页
        data.forEach(v => {
            let key = at(v, 0)
            if (!key) return;
            if (map.has(key)) {
                // 当前数据未包含
                let oldRecode = map.get(key)
                let recode = new Row(v)
                
                oldRecode = fill(oldRecode, config.tagStart + config.tagLength ) // 补充列数
                if (oldRecode.tag.length() === 0) {
                    // 主表中标签为空时，直接添加标签进主表
                    oldRecode.tag = recode.tag
                    oldRecode.author = recode.author
                    map.set(key, oldRecode)
                } else if (!oldRecode.tag.compareTo(recode.tag)) {
                    // 主表中存在标签，进行对比，不同时记录冲突
                    // console.log('old - ', oldRecode.tag.tags, 'new - ', recode.tag.tags)
                    report.conflict.push(oldRecode.toArray().concat(recode.getTagAndAuthor()))
                } else {
                   // 标签相同
                   report.sameTag ++
                }
            } else {
                // 未包含的数据
                report.unexpect ++
            }
        })
        console.log(`处理完成文件[${file}]`)
    })

    // 处理写入数据
    let outputData = []

    // map转为数组
    let mainList = []
    map.forEach(v => {
        mainList.push(v.toArray())
        // throw new Error()
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
    console.log(`意料外的输入-${report.unexpect}条`)
}

// 标签对象
function Tag(arr) {
    this.tags = arr
    // if (arr.length == 4 )
        // console.log('tag -> ', this.tags)
}
Tag.prototype.length = function() {
    return this.tags.filter(v => v).length
}
Tag.prototype.has = function(tag) {
    return this.tags.some(t => t === tag)
}
Tag.prototype.compareTo = function(tag) {
    if (this.length() !== tag.length()) return false;
    return this.tags.every(t => tag.has(t))
}
Tag.prototype.toArray = function() {
    // console.log('pot-> ' , fill(this.tags, config.tagLength))
    return fill(this.tags, config.tagLength)
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

function Row(arr) {
    let tagEnd = config.tagStart + config.tagLength - 1
    // arr = fill(arr, tagEnd + 1)

    this.id = at(arr, 0)
    this.url = at(arr, 1)
    this.label = at(arr, 2)
    this.detail = at(arr, 3)

    this.tag = 
        new Tag(arr.slice( config.tagStart - 1, tagEnd))
        // console.log(arr.slice( config.tagStart - 1, tagEnd))
        // console.log('tagEnd - ', tagEnd)

    this.author = at(arr, tagEnd)
    this.remark = arr.slice(tagEnd + 1) // 其他

    // console.log(this.author, this.remark)
    // throw new Error()
}

Row.prototype.toArray = function() {
    // console.log('id', this.id)
    // console.log('url', this.url)
    // console.log('tags', this.tag)
    // console.log('author', this.author)
    // console.log('remark', this.remark)
    // console.log([this.id, this.url, this.label, this.detail, ...this.tag.tags, this.author, ...this.remark])
    return [this.id, this.url, this.label, this.detail, ...this.tag.toArray(), this.author, ...this.remark]
}
Row.prototype.getTagAndAuthor = function() {
    return [...this.tag.toArray(), this.author]
}

jobV2()