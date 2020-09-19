const fs = require('fs')
const xlsx = require('node-xlsx')
const config = require('./config')

function merge() {
    let map = new Map()
    console.log(`正在读取[${config.mainFile}]数据`)
    // 读取主文件
    let main = xlsx.parse(config.mainFile)[0].data
    // 数组转map
    main.forEach(v => {
        map.set(v[0], v)
    })
    console.log(`读取[${config.mainFile}]数据共：${map.size}条`)
    console.log(`进行合并`)
    let sheets = xlsx.parse(config.outputFile)
    sheets[0].data.forEach(v => {
        map.set(v[0], limit(v))
    })
    sheets[1].data.forEach(v => {
        map.set(v[0], limit(v))
    })

    console.log('合并完成，正在写文件...')

     // map转为数组
     let mainList = []
     map.forEach(v => {
         mainList.push(v)
     })
    // 写入
    fs.writeFile(config.outputFile2, xlsx.build([{ name: 'sheet1', data: mainList }]), "binary", function (err) {
        if (err) return console.error(err)
        console.log('写入文件成功！')
    })
}
function limit(arr) {
    return arr.slice(0, config.tagStart + 2)
}
merge()