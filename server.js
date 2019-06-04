const ws = require("nodejs-websocket");

/**
 * 消息队列
 * @param msg_type: 消息类型，0：系统通知，1：单聊消息，2：群聊消息、
 * @param msg_state: 消息状态，0：未读，1：已读
 * @param fron_id: 发送这个消息的对象id
 * @param to_id：接收这个消息的对象id
 */
let msgQue = [];

// 连接池
let connUser = [];

// 实现群发功能
function massNews() {
  server.on("connection", () => {
    console.log("l");
  });
}

// 使用nodejs-websocket暴露出的函数创建WebSocket服务器
// 该函数的回调参数conn是连接对象
var server = ws
  .createServer(conn => {
    // 监听text事件，这是nodejs-websocket封装的接收消息事件
    conn.on("text", msg => {
      let msgs = JSON.parse(msg);
      switch (msgs.msg_type) {
        case 0:
          /**
           * 登录：
           * 1.将用户加入连接池
           * 2.查看消息队列是否有发给本用户的消息，没有则不做处理
           * 3.如果有就发送待发送消息，并从消息队列清除
           */
          console.log("第" + msgs.from_id + "号小可爱驾到了");
          // 监测这个对象
          conn.id = msgs.from_id;
          // 1.将用户加入连接池
          connUser.push({
            user_id: msgs.from_id,
            conn
          });
          console.log(msgQue);
          // 2.查看消息队列是否有发给本用户的消息，没有则不做处理
          for (let i = 0; i < msgQue.length; i++) {
            // 3.如果有就发送待发送消息，并从消息队列清除
            if (msgQue[i].to == msgs.from_id) {
              // 区分单聊和群聊发送消息
              if (msgQue[i].msg_type == 1) {
                conn.sendText(JSON.stringify(msgQue[i]));
              } else {
                // massNews(msgs);
              }
              // 删除这个消息对象
              msgQue.splice(i, 1);
            }
          }
          break;
        case 1:
          /**
           * 单聊：
           * 判断连接池是否存在发送对象
           * 有：发送给这个对象
           * 没有：加入消息队列
           */
          // 作为检测是否存在发送对象的标识
          let flag = false;
          for (let i = 0; i < connUser.length; i++) {
            // 如果有就发送待发送消息
            if (connUser[i].user_id == msgs.to) {
              connUser[i].conn.sendText(msg);
              flag = true;
            }
          }
          // 如果没有就将消息加入消息队列
          if (flag == false) {
            msgQue.push(msgs);
          }
          break;
        case 2:
          /**
           * 群聊：
           * 判断连接池是否存在群聊中的对象
           * 有：发送给这个对象
           * 没有：加入消息队列
           */
          break;
      }
    });
    conn.on("close", () => {
      console.log(conn.id + "号小可爱离开了");
      // 监听离开事件，从连接池中删除
      for (let i = 0; i < connUser.length; i++) {
        if (conn.id == connUser[i].user_id) {
          connUser.splice(i, 1);
        }
      }
    });
    conn.on("error", err => {
      console.log(err);
    });
  })
  .listen(10000);

console.log("this server runing in 127.0.0.1:10000");
