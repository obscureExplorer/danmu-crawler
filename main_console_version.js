const huya_danmu = require('../huya-danmu/index')
const myArgs = process.argv.slice(2);
const roomid = myArgs[0];

const log4js = require('log4js');
const logger = log4js.getLogger();
logger.level = 'info';

const danmuClient = new huya_danmu(roomid)

danmuClient.on('connect', () => {
    logger.info(`已连接huya ${roomid}房间弹幕~`)
    console.log(`已连接huya ${roomid}房间弹幕~`)
})

danmuClient.on('message', msg => {
    switch (msg.type) {
        case 'chat':
            console.log(`[${msg.from.name}]:${msg.content}`)
            break
        case 'userTV':
    //        console.log(`[${msg.from.name}]上电视了，内容是:${msg.content}`)
            break
        case 'tvAward':
      //      console.log(`上电视结束。中奖者是:${msg.from.name}，内容是${msg.content}`)
            break 
        case 'gift':
            console.log(`[${msg.from.name}]->赠送${msg.count}个${msg.name}`)
            break
        case 'VipBarList':
            console.log(msg)
            break
        case 'beginLive':
                //开始直播
            console.log(msg)
            break
        case 'endLive':
            //开始直播
            console.log(msg)
            break    
        case 'online':
            console.log(`[当前人气]:${msg.count}`)
            break
    }
})

danmuClient.on('error', e => {
    logger.error(e)
})

danmuClient.on('close', () => {
    logger.info(`开始断线重连`)
    danmuClient.start()
})

danmuClient.start()