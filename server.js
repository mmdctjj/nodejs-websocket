const ws = require('nodejs-websocket')

/**
 * 存放待发送消息的数组，每个元素都是一个对象
 * @param msg_type: 消息类型，0：系统通知，1：单聊消息，2：群聊消息、
 * @param msg_state: 消息状态，0：未读，1：已读
 * @param fron_id: 发送这个消息的对象id
 * @param to_id：接收这个消息的对象id
 */
var connUser = [];

// 使用nodejs-websocket暴露出的函数创建WebSocket服务器
// 该函数的回调参数conn是连接对象
var server = ws.createServer((conn) => {
    // 监听text事件，这是nodejs-websocket封装的事件
    conn.on("text", (msg) => {
        console.log(JSON.parse(msg))
        // 将json对象转换为js对象，并存到新变量中
        var msgs = JSON.parse(msg)

        if (msgs.msg_type == 0) {
            connUser.push({
                message: msgs.message,
                conn
            })
        } else if (msgs.msg_type == 1) {
            connUser.push({
                msg_state: 0,
                from_id: msgs.from,
                to_id: msgs.to,
                conn
            })
        } else {
            connUser.push({
                msg_state: 0,
                from_id: msgs.from,
                to_id: 'all',
                conn
            })
        }
        // 循环消息池数组
        for (let i = 0; i < connUser.length; i++) {
            // 如果接收消息的对象登录了，那就将待发送的消息发送个连接对象,并改变消息状态为已读
            if (connUser[i].msg_state == 0 && connUser[i].to_id == msgs.from) {
                connUser[i].conn.sendText(msg)
                connUser[i].msg_state = 1
            } else if (connUser[i].msg_state == 0 && connUser[i].to_id == 'all') {
                server.connections.forEach((conn) => {
                    if (connUser[i].from_id != msgs.from) {
                        conn.sendText(msg)
                    }
                })
            }
        }
    })
    conn.on("close", () => {
        console.log("Connection closed")
    })
    conn.on("error", (err) => {
        console.log(err)
    })
}, ).listen(10000)
server.on("connection", () => {
    console.log('l')
})

console.log("this server runing in 127.0.0.1:10000")