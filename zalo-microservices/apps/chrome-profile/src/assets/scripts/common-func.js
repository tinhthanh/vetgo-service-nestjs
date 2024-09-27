String.prototype.format = function () {
  let str = this.toString();
  for (let i = 0; i < arguments.length; i++) {
      let reg = new RegExp("\\{" + i + "\\}", "gm");
      str = str.replace(reg, arguments[i]);
  }
  return str;
};
const parseDMY = s => {
  let [d, m, y] = s.split(/\D/);
  return new Date(y, m - 1, d);
};
const parseDMYString = date => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${day}/${month}/${year}`;
};
const tomorrowDateString = today => {
  today.setDate(today.getDate() + 1);
  return parseDMYString(today);
};
/*------------------------------------------------------------------------------------------------------------------------------------------------*/
// export constant
window.vetgoConstant = {
  ...(window.vetgoConstant || {}),
  // url script
  URL_SCRIPT_GOOGLE: "https://script.google.com/macros/s/{0}/exec",
  VETGO_TOKEN: "VETGODEV",
  // url sheet server
  API_SHEET_SERVER_PRO: "AKfycbxB-8oQowVVDen9WhD44QEja8cm_lFtQc3Sc_0dCEHkNhCFzo8hTlNVUCkagA6ms5cGKg",
  API_SHEET_SERVER_DEV: "AKfycbzC9sSxdtHmTpbzOBMNcOwBV8D36PUOEehuM4XlKe2_B9eNhmrJOf8LRWIv-nYN2LG4",
  // tên table sheet
  TBL_MANAGER_TASK: "{0}_MANAGER_TASK",
  TBL_DEVICE_REMOTE: "DEVICE_REMOTE",
  TBL_MANAGER_SHEET: "MANAGER_SHEET",
  TBL_DATA_ANALYSIS: "{0}_DATA_ANALYSIS",
  TBL_MAP_PHONE: "{0}_MAP_PHONE",
  TBL_SEND_SMS_TASK: "SEND_SMS_TASK",
  // Trạng thái thực thi task
  STATUS_EXECUTE_TASK_AWAIT: "AWAIT",  // trạng thái đợi thực thi
  STATUS_EXECUTE_TASK_FAILED: "FAILED",  // trạng thái thực thi thất bại
  STATUS_EXECUTE_TASK_FINISH: "FINISH", // trạng thái thực thi task hoàn thành
  // Action thực thi zalo
  ACTION_TYPE_ZALO_ADD_FRIEND: "ADD_FRIEND",  // Action kết bạn zalo
  ACTION_TYPE_ZALO_SEND_MESSAGE: "SEND_MESSAGE",  // Action gửi message zalo
  ACTION_TYPE_ZALO_SEND_MESSAGE_FOR_STRANGER: "SEND_MESSAGE_STRANGER",  // Action gửi message zalo cho người lạ
  ACTION_TYPE_ZALO_REMINDER_CALENDAR: "REMINDER_CALENDAR", // Action tạo lịch hẹn zalo
  ACTION_TYPE_ZALO_GET_CONVID: "GET_CONVID", // Action get convId
  // Param key sesstionStorege
  PARAM_KEY_SHEET_ID_CLIENT: "sheetID",
  PARAM_KEY_PHONE: "phone",
  PARAM_KEY_SHEET_SERVER: "sheetServer",
  // Giợi hạn số lần sử dụng chức năng
  TRIAL_ADD_FRIEND: 10,
  TRIAL_SEND_MESSAGE: 5,
  TRAIL_REMIDAR_CALENDAR: 10,
  PRO_ADD_FRIEND: 40,
  PRO_SEND_MESSAGE: 999,
  PRO_REMIDAR_CALENDAR: 999,
  // License sheet
  LICENSE_TRIAL: "Trial",
  LICENSE_PRO: "Pro",
  // param kiểm tra đã thực thi task
  PARAM_EXE_TASK_ADD_FRIEND: "exe_task_add_friend",
  PARAM_EXE_TASK_SEND_MESSAGE: "exe_task_send_message",
  PARAM_EXE_TASK_REMINDER_CALENDAR: "exe_task_reminder_calendar",
  // Kết quả search phone zalo
  SEARCH_PHONE_RESULT_OK: 0,
  SEARCH_PHONE_RESULT_LIMIT: 1,
  SEARCH_PHONE_RESULT_UNVALID: 2,
  SEARCH_PHONE_RESULT_NOT_FOUND: 3,
  SEARCH_PHONE_RESULT_FAILED: 4,
  // Trạng thái lock task
  BLOCK_TASK: "BLOCK",
  UN_BLOCK_TASK: "UN_BLOCK",
  // type thực thi task zalo
  FROM_CONVID_ZALO: "ConvId",
  FROM_SEARCH_PHONE_ZALO: "SearchPhone",
  // Số điện thoại sever
  PHONE_TASK_SERVER: "0559066104"
};

/*------------------------------------------------------------------------------------------------------------------------------------------------*/
var vetgoDB = {
  indexedDB: window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB,
  IDBTransaction: window.IDBTransaction || window.webkitIDBTransaction || window.msIDseachPhoneBTransaction,
  baseName: "vetgoDB",
  storeName: "storeName",
  doc: `
      vetgo.db.add({id:1 ,name: "thanh" , "pass": "1234"}).then();
      vetgo.db.get(1).then( (item) => console.log(item));
      vetgo.db.getAll().then(data => {  console.log(data) });
      vetgo.db.up({id:1 ,name: "update" , "pass": "update"}).then();
      vetgo.db.del(1).then();
      // use with await/ async
       setTimeout(async () => {
          const item = await vetgo.db.get(1);
          console.log(item);
       }, 0)
       // to change database name
       vetgo.db.baseName = 'myDataBase';
       vetgo.db.storeName = 'myTabel';
       // reconnect
       vetgo.db.connectDB().then()
` ,
  logerr: (err) => {
      console.log(err);
  },
  connectDB: () => {
      return new Promise((f) => {
          // Open (or create) the database
          var request = vetgoDB.indexedDB.open(vetgoDB.baseName, 1);
          request.onerror = vetgoDB.logerr;
          request.onsuccess = () => {
              f(request.result);
          }
          request.onupgradeneeded = (e) => {
              //console.log("running onupgradeneeded");
              var Db = e.currentTarget.result;//var Db = e.target.result;

              //uncomment if we want to start clean
              //if(Db.objectStoreNames.contains(storeName)) Db.deleteObjectStore("note");

              //Create store
              if (!Db.objectStoreNames.contains(vetgoDB.storeName)) {
                  var store = Db.createObjectStore(vetgoDB.storeName, { keyPath: "id", autoIncrement: false });
                  //store.createIndex("NameIndex", ["name.last", "name.first"], { unique: false });
              }
              return vetgoDB.connectDB();
          }
      })
  },
  get: (id) => {
      return new Promise((f) => {
          vetgoDB.connectDB().then((db) => {
              var transaction = db.transaction([vetgoDB.storeName], "readonly").objectStore(vetgoDB.storeName).get(id);
              transaction.onerror = vetgoDB.logerr;
              transaction.onsuccess = () => {
                  f(transaction.result ? transaction.result : -1);
              }
          })
      })
  },
  getAll: () => {
      return new Promise((f) => {
          vetgoDB.connectDB().then((db) => {
              var rows = [],
                  store = db.transaction([vetgoDB.storeName], "readonly").objectStore(vetgoDB.storeName);
              if (store.mozGetAll)
                  store.mozGetAll().onsuccess = (e) => {
                      f(e.target.result);
                  };
              else
                  store.openCursor().onsuccess = (e) => {
                      var cursor = e.target.result;
                      if (cursor) {
                          rows.push(cursor.value);
                          cursor.continue();
                      }
                      else {
                          f(rows);
                      }
                  };
          })
      });
  },
  up: (obj) => {//obj with id
      return new Promise((f) => {
          vetgoDB.del(obj.id, 'up', vetgoDB.storeName).then(() => {
              vetgoDB.add(obj, 'up', vetgoDB.storeName).then(() => {
                  f(null);
              })
          })
      })
  },
  add: (obj) => {
      return new Promise((f) => {
          vetgoDB.connectDB().then((db) => {
              var transaction = db.transaction([vetgoDB.storeName], "readwrite");
              var objectStore = transaction.objectStore(vetgoDB.storeName);
              var objectStoreRequest = objectStore.add(obj);
              objectStoreRequest.onerror = vetgoDB.logerr;
              objectStoreRequest.onsuccess = () => {
                  f(objectStoreRequest.result);
              }
          })
      })
  },
  addAll: (objs) => {
      return new Promise((f) => {
          vetgoDB.connectDB().then((db) => {
              var transaction = db.transaction([vetgoDB.storeName], "readwrite");
              var objectStore = transaction.objectStore(vetgoDB.storeName);
              objs.forEach(function (obj) {
                  var objectStoreRequest = objectStore.add(obj);
                  objectStoreRequest.onerror = vetgoDB.logerr;
                  objectStoreRequest.onsuccess = () => {
                      f(objectStoreRequest.result);
                  }
              });
          })
      })
  },
  del: (id) => {
      return new Promise((f) => {
          vetgoDB.connectDB().then((db) => {
              var transaction = db.transaction([vetgoDB.storeName], "readwrite");
              var objectStore = transaction.objectStore(vetgoDB.storeName);
              var objectStoreRequest = objectStore.delete(id);
              objectStoreRequest.onerror = vetgoDB.logerr;
              objectStoreRequest.onsuccess = () => {
                  f(null);
              }
          })
      })
  },
  deleteDB: (dbName) => {
      return new Promise((f, r) => {
          const request = window.indexedDB.open(dbName);
          request.onsuccess = () => {
              const db = request.result;

              db.close();

              const deleteRequest = window.indexedDB.deleteDatabase(dbName);

              deleteRequest.onsuccess = () => {
                  console.log('Database deleted successfully');
                  f(null);
              };

              deleteRequest.onerror = (event) => {
                  console.error('Failed to delete database:', event.target.error);
                  r(null);
              };

              deleteRequest.onblocked = () => {
                  console.warn('Database delete operation blocked by other open connections');
                  r(null);
              };
          };

          request.onerror = (event) => {
              console.error('Failed to open database:', event.target.error);
              r(null);
          };

          request.onblocked = () => {
              console.warn('Database open operation blocked by other open connections');
              r(null);
          };
      });

  }
}
// FE sendEvent
async function sendEvent(data) {
  return new Promise((resolve) => {
    // Định nghĩa hàm xử lý sự kiện
    const eventHandler = function (event) {
      console.warn('response from server', event.detail);

      // Gọi resolve để trả về dữ liệu và xử lý xong
      resolve(event.detail);

      // Loại bỏ event listener sau khi nhận được phản hồi
      document
        .querySelector('body')
        .removeEventListener('RESPONSE_FROM_SERVER', eventHandler);
    };

    // Gắn sự kiện để lắng nghe phản hồi từ server
    document
      .querySelector('body')
      .addEventListener('RESPONSE_FROM_SERVER', eventHandler);

    // Gửi dữ liệu tới server thông qua window.sendActionType
    window.sendActionType(data).then(); // gửi event
  });
}

/*------------------------------------------------------------------------------------------------------------------------------------------------*/
// for selenium
var vetgoSe = {
  profileId: () => sessionStorage.getItem('phone'),
  waitForElement: (selector, timeout = 10 * 1000) => {
    return new Promise((res) => {
      const intervalTime = 100; // Check every 100ms
      const startTime = Date.now();
      const interval = setInterval(() => {
        if (document.querySelector(selector)) {
          clearInterval(interval);
          res(document.querySelector(selector));
        } else if (Date.now() - startTime >= timeout) {
          clearInterval(interval);
          res(null);
        }
      }, intervalTime);
    });
  },
  waitForMultiElement: (selectors, timeout = 10 * 1000) => {
    return new Promise((res) => {
      const intervalTime = 100; // Check every 100ms
      const startTime = Date.now();
      const interval = setInterval(() => {
        for (let selector of selectors) {
          if (document.querySelector(selector)) {
            clearInterval(interval);
            res(document.querySelector(selector));
          } else if (Date.now() - startTime >= timeout) {
            clearInterval(interval);
            res(null);
          }
        }
      }, intervalTime);
    });
  },
  sendKey: async function (selector, value, isEnter, delay = 50) {
    return new Promise((res) => {
      value = value.replace(/\n/g, ' ');
      const model = {
        phone: this.profileId(),
        actionType: 'SEND_KEY',
        data: {
          selector: selector,
          value: value,
          isEnter: isEnter,
          delay: delay,
        },
        url: window.location.href,
        messageStatus: 'NEW',
      };
      console.warn('vetgoSe -> sendKey', model);
      sendEvent(model).then((data) => {
        console.log(data);
        res(data);
      });
    }).catch((error) => console.log('Lỗi sendKeyImage: ' + error));
  },
  sendKeyImage: async function (selector, url) {
    return new Promise((res) => {
      const model = {
        phone: this.profileId(),
        actionType: 'PASTE_IMAGE',
        data: { selector: selector, url: url },
        url: window.location.href,
        messageStatus: 'NEW',
      };
      console.warn('vetgoSe -> sendKeyImage', model);
      sendEvent(model).then((data) => {
        console.log(data);
        res(data);
      });
    }).catch((error) => console.log('Lỗi sendKeyImage: ' + error));
  },
};

/*------------------------------------------------------------------------------------------------------------------------------------------------*/
// sleep function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function selectText(selector) {
  selector.focus();
  selector.value = "";
  return true;
}

// get phone for execute task
function getPhone() {
  return sessionStorage.getItem(vetgoConstant.PARAM_KEY_PHONE);
}
function getCurrentDateTime() {
  var currentDate = new Date();

  var day = currentDate.getDate();
  var month = currentDate.getMonth() + 1; // Note: Months are zero-based, so we add 1
  var year = currentDate.getFullYear();

  var hours = currentDate.getHours();
  var minutes = currentDate.getMinutes();
  var seconds = currentDate.getSeconds();

  // Format the components with leading zeros if needed
  var formattedDate = ('0' + day).slice(-2) + '/' + ('0' + month).slice(-2) + '/' + year;
  var formattedTime = ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2);

  var dateTime = formattedDate + ' ' + formattedTime;
  return dateTime;
}
function generateUUID() { // Public Domain/MIT
  var d = new Date().getTime();//Timestamp
  var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16;//random number between 0 and 16
      if (d > 0) {//Use timestamp until depleted
          r = (d + r) % 16 | 0;
          d = Math.floor(d / 16);
      } else {//Use microseconds since page-load if supported
          r = (d2 + r) % 16 | 0;
          d2 = Math.floor(d2 / 16);
      }
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// parse string format dd/mm/yyyy hh:MM:ss to date
function strToDate(dtStr) {
  if (!dtStr) return null
  let dateParts = dtStr.split("/");
  let timeParts = dateParts[2].split(" ")[1].split(":");
  dateParts[2] = dateParts[2].split(" ")[0];
  // month is 0-based, that's why we need dataParts[1] - 1
  return dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0], timeParts[0], timeParts[1], timeParts[2]);
}

// Kiểm tra kết bạn zalo
// Trường hợp đã kết bạn thì return true, ngược lại return false
async function isAddFriendZalo() {
  const result = await vetgo.se.waitForElement('[data-translate-title="STR_ADD_FRIEND_TO_CONVERSATION"]');
  return result != null;
}

function awaitLoadSuccessPage(selector) {
  return new Promise((res) => {
      const intervalTime = 1000; // Check every 100ms
      const timeout = 300 * intervalTime;
      const startTime = Date.now();
      const interval = setInterval(() => {
          if (document.querySelector(selector)) {
              console.log("Load page OK");
              clearInterval(interval);
              res(document.querySelector(selector));
          } else if (Date.now() - startTime >= timeout) {
              console.log("Load page Failed");
              clearInterval(interval);
              res(null);
          }
      }, intervalTime);
  })
}

/*------------------------------------------------------------------------------------------------------------------------------------------------*/
// for zalo
var vetgoZalo = {
  doc: `
// ex: searchPhone tìm số điên thoại zalo
vetgo.zalo.searchPhone('09000000')
// ex: sendMessage gửi message zalo
vetgo.zalo.sendMessage('#input','hello zalo')
` ,
  sendMessage: async (idSelector, message) => { //OK
      let textSendMessage = await vetgo.se.waitForElement(idSelector);
      if (textSendMessage == null) return false;
      await selectText(textSendMessage);
      await vetgoSe.sendKey(idSelector, message, true);
      return true;
  },
  sendMessageNotEnter: async (idSelector, message) => { // OK
      let textSendMessage = await vetgo.se.waitForElement(idSelector);
      if (textSendMessage == null) return false;
      await selectText(textSendMessage);
      await vetgoSe.sendKey(idSelector, message, false);
      return true;
  },
  sendImage: async (idSelector, urls) => { //TODO cần đổi id
      let result = await vetgoSe.sendKeyImage(idSelector, urls);
      return result === "DONE";

  },
  searchPhone: async (phone) => {
      const enterEvent = new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: false,
          key: "ENTER",
          code: "ENTER",
          keyCode: 13,
          ctrlKey: false
      });
      const idSelector = "#contact-search-input";
      let textSendMessage = await vetgo.se.waitForElement(idSelector);
      if (textSendMessage == null) return vetgoConstant.SEARCH_PHONE_RESULT_FAILED;
      // thực hiện search
      await selectText(textSendMessage);
      await vetgoSe.sendKey(idSelector, phone, false);
      // kiểm tra kết quả search
      const arraySelectorSearch = ['#global_search_list > div > div:nth-child(2) div.gridv2.conv-item.conv-rel', '[data-translate-inner="STR_LIMIT_SEARCH_NUM_PHONE"]',
          '[data-translate-inner="STR_UNVALID_SEARCH_NUM_PHONE"]', '[data-translate-inner="STR_NOT_FOUND"]', '[data-translate-inner="STR_NOT_VALID_PHONE_NUMBER"]'];
      const result = await vetgo.se.waitForMultiElement(arraySelectorSearch);
      console.log(result);
      const idDiv = result.getAttribute("id");
      // Nếu search ok
      if (idDiv && idDiv.includes("friend-item-")) {
          if (idDiv) {
              const convIdValue = idDiv.replace("friend-item-", "");
              const tableMapPhone = vetgoConstant.TBL_MAP_PHONE.format(getPhone());
              let entity = await vetgo.sheet.getById(convIdValue, tableMapPhone); // TODO convert
              if (entity == null) {
                  entity = {
                      id: convIdValue,
                      phone: phone,
                      profile: null,
                      chatMessage: null
                  }
              } else {
                  entity.phone = phone;
              }

              await vetgo.sheet.add(entity, tableMapPhone); // TODO convert
          }
          await sleep(1000);
          textSendMessage.dispatchEvent(enterEvent);
          return vetgoConstant.SEARCH_PHONE_RESULT_OK;
      } else {
          const typeSearch = result.getAttribute("data-translate-inner");
          if (typeSearch == "STR_LIMIT_SEARCH_NUM_PHONE") return vetgoConstant.SEARCH_PHONE_RESULT_LIMIT;
          if (typeSearch == "STR_UNVALID_SEARCH_NUM_PHONE" || typeSearch == "STR_NOT_VALID_PHONE_NUMBER") return vetgoConstant.SEARCH_PHONE_RESULT_UNVALID;
          if (typeSearch == "STR_NOT_FOUND") return vetgoConstant.SEARCH_PHONE_RESULT_NOT_FOUND;
      }
      return vetgoConstant.SEARCH_PHONE_RESULT_FAILED;
  },
  searchName: async (name, avatarLink) => {
      const dbClickEvent = new MouseEvent('dblclick', {
          bubbles: true,
          cancelable: true,
          view: window
      });
      const idSelector = "#contact-search-input";
      let textSendMessage = await vetgo.se.waitForElement(idSelector);
      if (textSendMessage == null) return vetgoConstant.SEARCH_PHONE_RESULT_FAILED;
      // thực hiện search
      await selectText(textSendMessage);
      await vetgoSe.sendKey(idSelector, name, false);
      await sleep(1000);
      // kiểm tra kết quả search
      const searchList = [...document.querySelectorAll('div.gridv2.conv-item.conv-rel')];
      if (searchList.length == 0) return null;
      const elementResult = searchList.filter(result => result.querySelector("img").getAttribute("src") == avatarLink)[0];
      if (elementResult == null || undefined) {
          return null;
      } else {
          elementResult.dispatchEvent(dbClickEvent);
      }
      return elementResult;
  }
}


// export here
window.vetgo = {
   ...(window.vetgo || {}),
    db: vetgoDB,
    se: vetgoSe,
    // sheet: vetgoSheet,
    // sheetServer: vetgoSheetSever,
    zalo: vetgoZalo,
    // api: vetgoApi,
    // vnPay: vetgoVnPay
   };
