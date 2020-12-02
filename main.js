const huya_danmu = require('../huya-danmu/index')
var myArgs = process.argv.slice(2);

const roomid = myArgs[0];
const danmuClient = new huya_danmu(roomid)
const mongoClient = require('mongodb').MongoClient;

var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "info";
log4js.configure({
    appenders: { file: { type: "file", filename: defaultRoomId + "_output.log", maxLogSize: 10 * 1024 * 1024 }, console: { type: 'stdout' } },
    categories: { default: { appenders: ["console", "file"], level: "info" } }
});

// Connection URL
const url = 'mongodb://localhost:27017';

let mongoDbCLient = null;

danmuClient.on('connect', () => {
    logger.info(`已连接huya ${roomid}房间弹幕~`);
    // Use connect method to connect to the server
    mongoClient.connect(url, function (err, dbClient) {
        if (err) throw err;
        logger.info("已连接到MongoDB");
        mongoDbCLient = dbClient;
    });
})

let huyaDB = null;
danmuClient.on('message', msg => {
    if (huyaDB == null) {
        huyaDB = mongoDbCLient.db("huya");
    }
    switch (msg.type) {
        case 'chat':
            logger.debug(`[${msg.from.name}]:${msg.content}`)
            huyaDB.collection(roomid).insertOne(msg, function (err, res) {
                if (err) throw err;
            });
            break
        case 'gift':
            logger.debug(`[${msg.from.name}]->赠送${msg.count}个${msg.name}`)
            huyaDB.collection(roomid).insertOne(msg, function (err, res) {
                if (err) throw err;
            });
            break
        case 'userTV':
            logger.debug(`[${msg.from.name}]上电视了，内容是:${msg.content}`)
            huyaDB.collection(roomid + "_tv").insertOne(msg, function (err, res) {
                if (err) throw err;
            });
            break
        case 'tvAward':
            logger.debug(`上电视结束。中奖者是:${msg.from.name}，内容是${msg.content}`)
            huyaDB.collection(roomid + "_tv").insertOne(msg, function (err, res) {
                if (err) throw err;
            });
            break
        case 'VipBarList':
            logger.debug(msg)
            huyaDB.collection(roomid + "_VipBarList").insertOne(msg, function (err, res) {
                if (err) throw err;
            });
            break
    }
})

danmuClient.on('error', e => {
    logger.info(e)
})

danmuClient.on('close', () => {
    logger.info('开始断线重连')
    danmuClient.start()
})

danmuClient.start()
