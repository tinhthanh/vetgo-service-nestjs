// String.prototype.format = function () {
//   let str = this.toString();
//   for (let i = 0; i < arguments.length; i++) {
//       let reg = new RegExp("\\{" + i + "\\}", "gm");
//       str = str.replace(reg, arguments[i]);
//   }
//   return str;
// };
// const parseDMY = s => {
//   let [d, m, y] = s.split(/\D/);
//   return new Date(y, m - 1, d);
// };
// const parseDMYString = date => {
//   const day = String(date.getDate()).padStart(2, '0');
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const year = String(date.getFullYear());
//   return `${day}/${month}/${year}`;
// };
// const tomorrowDateString = today => {
//   today.setDate(today.getDate() + 1);
//   return parseDMYString(today);
// };
/*------------------------------------------------------------------------------------------------------------------------------------------------*/
// export constant
// window.vetgoConstant = {
//   ...(window.vetgoConstant || {}),
//   // url script
//   URL_SCRIPT_GOOGLE: "https://script.google.com/macros/s/{0}/exec",
//   VETGO_TOKEN: "VETGODEV",
//   // url sheet server
//   API_SHEET_SERVER_PRO: "AKfycbxB-8oQowVVDen9WhD44QEja8cm_lFtQc3Sc_0dCEHkNhCFzo8hTlNVUCkagA6ms5cGKg",
//   API_SHEET_SERVER_DEV: "AKfycbzC9sSxdtHmTpbzOBMNcOwBV8D36PUOEehuM4XlKe2_B9eNhmrJOf8LRWIv-nYN2LG4",
//   // tên table sheet
//   TBL_MANAGER_TASK: "{0}_MANAGER_TASK",
//   TBL_DEVICE_REMOTE: "DEVICE_REMOTE",
//   TBL_MANAGER_SHEET: "MANAGER_SHEET",
//   TBL_DATA_ANALYSIS: "{0}_DATA_ANALYSIS",
//   TBL_MAP_PHONE: "{0}_MAP_PHONE",
//   TBL_SEND_SMS_TASK: "SEND_SMS_TASK",
//   // Trạng thái thực thi task
//   STATUS_EXECUTE_TASK_AWAIT: "AWAIT",  // trạng thái đợi thực thi
//   STATUS_EXECUTE_TASK_FAILED: "FAILED",  // trạng thái thực thi thất bại
//   STATUS_EXECUTE_TASK_FINISH: "FINISH", // trạng thái thực thi task hoàn thành
//   // Action thực thi zalo
//   ACTION_TYPE_ZALO_ADD_FRIEND: "ADD_FRIEND",  // Action kết bạn zalo
//   ACTION_TYPE_ZALO_SEND_MESSAGE: "SEND_MESSAGE",  // Action gửi message zalo
//   ACTION_TYPE_ZALO_SEND_MESSAGE_FOR_STRANGER: "SEND_MESSAGE_STRANGER",  // Action gửi message zalo cho người lạ
//   ACTION_TYPE_ZALO_REMINDER_CALENDAR: "REMINDER_CALENDAR", // Action tạo lịch hẹn zalo
//   ACTION_TYPE_ZALO_GET_CONVID: "GET_CONVID", // Action get convId
//   // Param key sesstionStorege
//   PARAM_KEY_SHEET_ID_CLIENT: "sheetID",
//   PARAM_KEY_PHONE: "phone",
//   PARAM_KEY_SHEET_SERVER: "sheetServer",
//   // Giợi hạn số lần sử dụng chức năng
//   TRIAL_ADD_FRIEND: 10,
//   TRIAL_SEND_MESSAGE: 5,
//   TRAIL_REMIDAR_CALENDAR: 10,
//   PRO_ADD_FRIEND: 40,
//   PRO_SEND_MESSAGE: 999,
//   PRO_REMIDAR_CALENDAR: 999,
//   // License sheet
//   LICENSE_TRIAL: "Trial",
//   LICENSE_PRO: "Pro",
//   // param kiểm tra đã thực thi task
//   PARAM_EXE_TASK_ADD_FRIEND: "exe_task_add_friend",
//   PARAM_EXE_TASK_SEND_MESSAGE: "exe_task_send_message",
//   PARAM_EXE_TASK_REMINDER_CALENDAR: "exe_task_reminder_calendar",
//   // Kết quả search phone zalo
//   SEARCH_PHONE_RESULT_OK: 0,
//   SEARCH_PHONE_RESULT_LIMIT: 1,
//   SEARCH_PHONE_RESULT_UNVALID: 2,
//   SEARCH_PHONE_RESULT_NOT_FOUND: 3,
//   SEARCH_PHONE_RESULT_FAILED: 4,
//   // Trạng thái lock task
//   BLOCK_TASK: "BLOCK",
//   UN_BLOCK_TASK: "UN_BLOCK",
//   // type thực thi task zalo
//   FROM_CONVID_ZALO: "ConvId",
//   FROM_SEARCH_PHONE_ZALO: "SearchPhone",
//   // Số điện thoại sever
//   PHONE_TASK_SERVER: "0559066104"
// };
/*------------------------------------------------------------------------------------------------------------------------------------------------*/
// var vetgoDB = {
//   indexedDB: window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB,
//   IDBTransaction: window.IDBTransaction || window.webkitIDBTransaction || window.msIDseachPhoneBTransaction,
//   baseName: "vetgoDB",
//   storeName: "storeName",
//   doc: `
//       vetgo.db.add({id:1 ,name: "thanh" , "pass": "1234"}).then();
//       vetgo.db.get(1).then( (item) => console.log(item));
//       vetgo.db.getAll().then(data => {  console.log(data) });
//       vetgo.db.up({id:1 ,name: "update" , "pass": "update"}).then();
//       vetgo.db.del(1).then();
//       // use with await/ async
//        setTimeout(async () => {
//           const item = await vetgo.db.get(1);
//           console.log(item);
//        }, 0)
//        // to change database name
//        vetgo.db.baseName = 'myDataBase';
//        vetgo.db.storeName = 'myTabel';
//        // reconnect
//        vetgo.db.connectDB().then()
// ` ,
//   logerr: (err) => {
//       console.log(err);
//   },
//   connectDB: () => {
//       return new Promise((f) => {
//           // Open (or create) the database
//           var request = vetgoDB.indexedDB.open(vetgoDB.baseName, 1);
//           request.onerror = vetgoDB.logerr;
//           request.onsuccess = () => {
//               f(request.result);
//           }
//           request.onupgradeneeded = (e) => {
//               //console.log("running onupgradeneeded");
//               var Db = e.currentTarget.result;//var Db = e.target.result;

//               //uncomment if we want to start clean
//               //if(Db.objectStoreNames.contains(storeName)) Db.deleteObjectStore("note");

//               //Create store
//               if (!Db.objectStoreNames.contains(vetgoDB.storeName)) {
//                   var store = Db.createObjectStore(vetgoDB.storeName, { keyPath: "id", autoIncrement: false });
//                   //store.createIndex("NameIndex", ["name.last", "name.first"], { unique: false });
//               }
//               return vetgoDB.connectDB();
//           }
//       })
//   },
//   get: (id) => {
//       return new Promise((f) => {
//           vetgoDB.connectDB().then((db) => {
//               var transaction = db.transaction([vetgoDB.storeName], "readonly").objectStore(vetgoDB.storeName).get(id);
//               transaction.onerror = vetgoDB.logerr;
//               transaction.onsuccess = () => {
//                   f(transaction.result ? transaction.result : -1);
//               }
//           })
//       })
//   },
//   getAll: () => {
//       return new Promise((f) => {
//           vetgoDB.connectDB().then((db) => {
//               var rows = [],
//                   store = db.transaction([vetgoDB.storeName], "readonly").objectStore(vetgoDB.storeName);
//               if (store.mozGetAll)
//                   store.mozGetAll().onsuccess = (e) => {
//                       f(e.target.result);
//                   };
//               else
//                   store.openCursor().onsuccess = (e) => {
//                       var cursor = e.target.result;
//                       if (cursor) {
//                           rows.push(cursor.value);
//                           cursor.continue();
//                       }
//                       else {
//                           f(rows);
//                       }
//                   };
//           })
//       });
//   },
//   up: (obj) => {//obj with id
//       return new Promise((f) => {
//           vetgoDB.del(obj.id, 'up', vetgoDB.storeName).then(() => {
//               vetgoDB.add(obj, 'up', vetgoDB.storeName).then(() => {
//                   f(null);
//               })
//           })
//       })
//   },
//   add: (obj) => {
//       return new Promise((f) => {
//           vetgoDB.connectDB().then((db) => {
//               var transaction = db.transaction([vetgoDB.storeName], "readwrite");
//               var objectStore = transaction.objectStore(vetgoDB.storeName);
//               var objectStoreRequest = objectStore.add(obj);
//               objectStoreRequest.onerror = vetgoDB.logerr;
//               objectStoreRequest.onsuccess = () => {
//                   f(objectStoreRequest.result);
//               }
//           })
//       })
//   },
//   addAll: (objs) => {
//       return new Promise((f) => {
//           vetgoDB.connectDB().then((db) => {
//               var transaction = db.transaction([vetgoDB.storeName], "readwrite");
//               var objectStore = transaction.objectStore(vetgoDB.storeName);
//               objs.forEach(function (obj) {
//                   var objectStoreRequest = objectStore.add(obj);
//                   objectStoreRequest.onerror = vetgoDB.logerr;
//                   objectStoreRequest.onsuccess = () => {
//                       f(objectStoreRequest.result);
//                   }
//               });
//           })
//       })
//   },
//   del: (id) => {
//       return new Promise((f) => {
//           vetgoDB.connectDB().then((db) => {
//               var transaction = db.transaction([vetgoDB.storeName], "readwrite");
//               var objectStore = transaction.objectStore(vetgoDB.storeName);
//               var objectStoreRequest = objectStore.delete(id);
//               objectStoreRequest.onerror = vetgoDB.logerr;
//               objectStoreRequest.onsuccess = () => {
//                   f(null);
//               }
//           })
//       })
//   },
//   deleteDB: (dbName) => {
//       return new Promise((f, r) => {
//           const request = window.indexedDB.open(dbName);
//           request.onsuccess = () => {
//               const db = request.result;

//               db.close();

//               const deleteRequest = window.indexedDB.deleteDatabase(dbName);

//               deleteRequest.onsuccess = () => {
//                   console.log('Database deleted successfully');
//                   f(null);
//               };

//               deleteRequest.onerror = (event) => {
//                   console.error('Failed to delete database:', event.target.error);
//                   r(null);
//               };

//               deleteRequest.onblocked = () => {
//                   console.warn('Database delete operation blocked by other open connections');
//                   r(null);
//               };
//           };

//           request.onerror = (event) => {
//               console.error('Failed to open database:', event.target.error);
//               r(null);
//           };

//           request.onblocked = () => {
//               console.warn('Database open operation blocked by other open connections');
//               r(null);
//           };
//       });

//   }
// }
/*------------------------------------------------------------------------------------------------------------------------------------------------*/
// for selenium
// var vetgoSe = {
//   doc: `
// // ex: waitForElement wait element visible and return element
// vetgo.se.waitForElement('#main-tab').then( el => {
//   // do some thing
// })
// // use with await/ async
//   setTimeout(async () => {
//       const el = await vetgo.se.waitForElement('#main-tab');
//             console.log(el.innerText)
//   },0 )
// ` ,
//   waitForElement: (selector, timeout = 10 * 1000) => {
//       return new Promise((res) => {
//           const intervalTime = 100; // Check every 100ms
//           const startTime = Date.now();
//           const interval = setInterval(() => {
//               if (document.querySelector(selector)) {
//                   clearInterval(interval);
//                   res(document.querySelector(selector));
//               } else if (Date.now() - startTime >= timeout) {
//                   clearInterval(interval);
//                   res(null);
//               }
//           }, intervalTime);
//       })
//   },
//   waitForMultiElement: (selectors, timeout = 10 * 1000) => {
//       return new Promise((res) => {
//           const intervalTime = 100; // Check every 100ms
//           const startTime = Date.now();
//           const interval = setInterval(() => {
//               for (let selector of selectors) {
//                   if (document.querySelector(selector)) {
//                       clearInterval(interval);
//                       res(document.querySelector(selector));
//                   } else if (Date.now() - startTime >= timeout) {
//                       clearInterval(interval);
//                       res(null);
//                   }
//               }
//           }, intervalTime);
//       })
//   },
//   sendKey: (selector, value, isEnter) => {
//       value = value.replace(/\n/g, ' ');
//       const model = { actionType: 'SEND_KEY', data: { selector: selector, value: value, isEnter: isEnter }, url: window.location.href, messageStatus: "NEW" };
//       return sendEvent(model).then(data => {
//           console.log(data);
//           return data.messageStatus;
//       }).catch(error => console.log("Lỗi sendkey: " + error));
//   },
//   sendKeyImage: (selector, url) => {
//       return new Promise((res) => {
//           const model = { actionType: 'PASTE_IMAGE', data: { selector: selector, url: url }, url: window.location.href, messageStatus: "NEW" };
//           sendEvent(model).then(data => {
//               console.log(data);
//               res(data.messageStatus);
//           })
//       }).catch(error => console.log("Lỗi sendKeyImage: " + error));

//   }
// }
// FE sendEvent
// function sendEvent(data) {
//   return new Promise((resolve) => {
//       document.querySelector('body').addEventListener('CLIENT_OUT', function (event) {
//           resolve(event.detail);
//       });
//       var raw = JSON.stringify(data);
//       vetgoApi.action(raw);
//   });
// }
/*------------------------------------------------------------------------------------------------------------------------------------------------*/
// for googleSheet
var vetgoSheetSever = {
  //url: vetgoConstant.URL_SCRIPT_GOOGLE.format(vetgoConstant.API_SHEET_SERVER),
  table: 'draft',
  doc: `
// set table work on
  vetgo.sheet.table = 'users';
  // add item
  vetgo.sheet.add({id: 1 , userName: "Thanh" , pass:"123"}).then();
  vetgo.sheet.update({id: 1 , userName: "Thanh2" , pass:"123"}).then();
  vetgo.sheet.getById(1).then( (item) => console.log(item))
  vetgo.sheet.getAll(1).then( (item) => console.log(item))
  vetgo.sheet.deleteById(1).then( (item) => console.log(item))
  // remove table users
  vetgo.sheet.clearData().then()
   // use with await/ async
       setTimeout(async () => {
          const item = await vetgo.sheet.getAll();
          console.log(item);
       }, 0)
` ,
  add: (data, table) => {
      const obj = {
          actionType: 'POST',
          table: table || vetgoSheetSever.table,
          data,
          csrfToken: vetgoConstant.VETGO_TOKEN,
      };
      return vetgoSheetSever.post(obj)
          .then(response => response.data);
  },
  getById: (id, table) => {
      const obj = {
          actionType: 'getById',
          table: table || vetgoSheetSever.table,
          id,
          csrfToken: vetgoConstant.VETGO_TOKEN,
      };
      return vetgoSheetSever.post(obj)
          .then(response => response.data);
  },
  getFireBaseById: (id, table) => {
      const obj = {
          actionType: 'FIREBASE_getById',
          table: table,
          id,
          csrfToken: vetgoConstant.VETGO_TOKEN,
      };
      return vetgoSheetSever.post(obj)
          .then(response => response.data);
  },
  post: async (data, maxRetries = 5) => {
      for (let retry = 0; retry < maxRetries; retry++) {
          try {
              const response = await fetch(vetgoSheetSever.url, {
                  method: 'POST',
                  body: JSON.stringify(data),
                  headers: {
                      'Content-Type': 'text/plain; charset=utf-8'
                  }
              });

              const responseData = await response.json();
              return responseData;
          } catch (error) {
              console.error(`Error occurred during retry ${retry + 1}:`, error);
          }
      }

      throw new Error('Max retry limit exceeded');
  }
}
/*------------------------------------------------------------------------------------------------------------------------------------------------*/
// for googleSheet
var vetgoSheet = {
  table: 'draft',
  doc: `
// set table work on
  vetgo.sheet.table = 'users';
  // add item
  vetgo.sheet.add({id: 1 , userName: "Thanh" , pass:"123"}).then();
  vetgo.sheet.update({id: 1 , userName: "Thanh2" , pass:"123"}).then();
  vetgo.sheet.getById(1).then( (item) => console.log(item))
  vetgo.sheet.getAll(1).then( (item) => console.log(item))
  vetgo.sheet.deleteById(1).then( (item) => console.log(item))
  // remove table users
  vetgo.sheet.clearData().then()
   // use with await/ async
       setTimeout(async () => {
          const item = await vetgo.sheet.getAll();
          console.log(item);
       }, 0)
` ,
  add: (data, table) => {
      const obj = {
          actionType: 'POST',
          table: table || vetgoSheet.table,
          data,
          csrfToken: vetgoConstant.VETGO_TOKEN,
      };
      return vetgoSheet.post(obj)
          .then(response => response.data);
  },
  addAll: (data, table) => {
      const obj = {
          actionType: 'addAll',
          table: table || vetgoSheet.table,
          data,
          csrfToken: vetgoConstant.VETGO_TOKEN,
      };
      return vetgoSheet.post(obj)
          .then(response => response);
  },
  getAll: (table) => {
      const obj = {
          actionType: 'GET',
          table: table || vetgoSheet.table,
          csrfToken: vetgoConstant.VETGO_TOKEN,
      };
      return vetgoSheet.post(obj)
          .then(response => response);
  },
  update: (data, table) => {
      const obj = {
          actionType: 'POST',
          table: table || vetgoSheet.table,
          data,
          csrfToken: vetgoConstant.VETGO_TOKEN,
      };
      return vetgoSheet.post(obj)
          .then(response => response.data);
  },
  getById: (id, table) => {
      const obj = {
          actionType: 'getById',
          table: table || vetgoSheet.table,
          id,
          csrfToken: vetgoConstant.VETGO_TOKEN,
      };
      return vetgoSheet.post(obj)
          .then(response => response.data);
  },
  uploadImg: (base64, name, type) => {
      const obj = {
          actionType: 'UPLOAD',
          base64,
          type,
          name,
          csrfToken: vetgoConstant.VETGO_TOKEN,
      };
      return vetgoSheet.post(obj)
          .then(response => response.data);
  },
  clearData: (table) => {
      const obj = {
          actionType: 'CLEAR',
          table: table || vetgoSheet.table,
          csrfToken: vetgoConstant.VETGO_TOKEN,
      };
      return vetgoSheet.post(obj)
          .then(response => response);
  },
  deleteById: (id, table) => {
      const obj = {
          actionType: 'DELETE',
          table: table || vetgoSheet.table,
          id,
          csrfToken: vetgoConstant.VETGO_TOKEN,
      };
      return vetgoSheet.post(obj)
          .then(response => response);
  },
  post: async (data) => {
      const urlApiSheet = vetgoConstant.URL_SCRIPT_GOOGLE.format(getSheetIdClient());
      for (let retry = 0; retry < maxRetries; retry++) {
          try {
              const response = await fetch(urlApiSheet, {
                  method: 'POST',
                  body: JSON.stringify(data),
                  headers: {
                      'Content-Type': 'text/plain; charset=utf-8'
                  }
              });

              const responseData = await response.json();
              return responseData;
          } catch (error) {
              console.error(`Error occurred during retry ${retry + 1}:`, error);
          }
      }

      throw new Error('Max retry limit exceeded');
  },
  getDeviceRemote: () => {
      const obj = {
          actionType: 'getById',
          table: vetgoConstant.TBL_DEVICE_REMOTE,
          id: getPhone(),
          csrfToken: vetgoConstant.VETGO_TOKEN,
      };
      return vetgoSheet.post(obj).then(response => response.data);
  },
  getPhoneLogin: () => {
      const obj = {
          actionType: 'getById',
          table: vetgoConstant.TBL_DEVICE_REMOTE,
          id: getPhone(),
          csrfToken: vetgoConstant.VETGO_TOKEN,
      };
      return vetgoSheet.post(obj)
          .then(response => response.data.phoneLogin);
  }
}
/*------------------------------------------------------------------------------------------------------------------------------------------------*/
// for zalo
// var vetgoZalo = {
//   doc: `
// // ex: searchPhone tìm số điên thoại zalo
// vetgo.zalo.searchPhone('09000000')
// // ex: sendMessage gửi message zalo
// vetgo.zalo.sendMessage('#input','hello zalo')
// ` ,
//   sendMessage: async (idSelector, message) => {
//       let textSendMessage = await vetgo.se.waitForElement(idSelector);
//       if (textSendMessage == null) return false;
//       await selectText(textSendMessage);
//       await vetgoSe.sendKey(idSelector, message);
//       return true;
//   },
  // sendMessageNotEnter: async (idSelector, message) => {
  //     let textSendMessage = await vetgo.se.waitForElement(idSelector);
  //     if (textSendMessage == null) return false;
  //     await selectText(textSendMessage);
  //     await vetgoSe.sendKey(idSelector, message, "false");
  //     return true;
  // },
  // sendImage: async (idSelector, urls) => {
  //     let result = await vetgoSe.sendKeyImage(idSelector, urls);
  //     return result === "DONE";

  // },
  // searchPhone: async (phone) => {
  //     const enterEvent = new KeyboardEvent('keydown', {
  //         bubbles: true,
  //         cancelable: false,
  //         key: "ENTER",
  //         code: "ENTER",
  //         keyCode: 13,
  //         ctrlKey: false
  //     });
  //     const idSelector = "#contact-search-input";
  //     let textSendMessage = await vetgo.se.waitForElement(idSelector);
  //     if (textSendMessage == null) return vetgoConstant.SEARCH_PHONE_RESULT_FAILED;
  //     // thực hiện search
  //     await selectText(textSendMessage);
  //     await vetgoSe.sendKey(idSelector, phone, "false");
  //     // kiểm tra kết quả search
  //     const arraySelectorSearch = ['#global_search_list > div > div:nth-child(2) div.gridv2.conv-item.conv-rel', '[data-translate-inner="STR_LIMIT_SEARCH_NUM_PHONE"]',
  //         '[data-translate-inner="STR_UNVALID_SEARCH_NUM_PHONE"]', '[data-translate-inner="STR_NOT_FOUND"]', '[data-translate-inner="STR_NOT_VALID_PHONE_NUMBER"]'];
  //     const result = await vetgo.se.waitForMultiElement(arraySelectorSearch);
  //     console.log(result);
  //     const idDiv = result.getAttribute("id");
  //     // Nếu search ok
  //     if (idDiv && idDiv.includes("friend-item-")) {
  //         if (idDiv) {
  //             const convIdValue = idDiv.replace("friend-item-", "");
  //             const tableMapPhone = vetgoConstant.TBL_MAP_PHONE.format(getPhone());
  //             let entity = await vetgo.sheet.getById(convIdValue, tableMapPhone);
  //             if (entity == null) {
  //                 entity = {
  //                     id: convIdValue,
  //                     phone: phone,
  //                     profile: null,
  //                     chatMessage: null
  //                 }
  //             } else {
  //                 entity.phone = phone;
  //             }

  //             await vetgo.sheet.add(entity, tableMapPhone);
  //         }
  //         await sleep(1000);
  //         textSendMessage.dispatchEvent(enterEvent);
  //         return vetgoConstant.SEARCH_PHONE_RESULT_OK;
  //     } else {
  //         const typeSearch = result.getAttribute("data-translate-inner");
  //         if (typeSearch == "STR_LIMIT_SEARCH_NUM_PHONE") return vetgoConstant.SEARCH_PHONE_RESULT_LIMIT;
  //         if (typeSearch == "STR_UNVALID_SEARCH_NUM_PHONE" || typeSearch == "STR_NOT_VALID_PHONE_NUMBER") return vetgoConstant.SEARCH_PHONE_RESULT_UNVALID;
  //         if (typeSearch == "STR_NOT_FOUND") return vetgoConstant.SEARCH_PHONE_RESULT_NOT_FOUND;
  //     }
  //     return vetgoConstant.SEARCH_PHONE_RESULT_FAILED;
  // },
  // searchName: async (name, avatarLink) => {
  //     const dbClickEvent = new MouseEvent('dblclick', {
  //         bubbles: true,
  //         cancelable: true,
  //         view: window
  //     });
  //     const idSelector = "#contact-search-input";
  //     let textSendMessage = await vetgo.se.waitForElement(idSelector);
  //     if (textSendMessage == null) return vetgoConstant.SEARCH_PHONE_RESULT_FAILED;
  //     // thực hiện search
  //     await selectText(textSendMessage);
  //     await vetgoSe.sendKey(idSelector, name, "false");
  //     await sleep(1000);
  //     // kiểm tra kết quả search
  //     const searchList = [...document.querySelectorAll('div.gridv2.conv-item.conv-rel')];
  //     if (searchList.length == 0) return null;
  //     const elementResult = searchList.filter(result => result.querySelector("img").getAttribute("src") == avatarLink)[0];
  //     if (elementResult == null || undefined) {
  //         return null;
  //     } else {
  //         elementResult.dispatchEvent(dbClickEvent);
  //     }
  //     return elementResult;
  // }
// }
/*------------------------------------------------------------------------------------------------------------------------------------------------*/
// for VnPay
var vetgoVnPay = {
  doc: `
// ex: insertTask insert task để gửi tin nhắn sms
vetgo.vnPay.insertTask('09000000', 'aloalo')
` ,
  insertTask: async (idTask, phone, message) => {
      const data = {
          phone: phone,
          message: message,
          phone_branch: getPhone()
      }
      const dataInsert = {
          id: idTask,
          data: JSON.stringify(data),
          status: vetgoConstant.STATUS_EXECUTE_TASK_AWAIT,
          log: null,
          actionType: vetgoConstant.ACTION_TYPE_ZALO_SEND_MESSAGE,
          exeDate: parseDMYString(new Date())
      }
      await vetgoSheet.add(dataInsert, vetgoConstant.TBL_SEND_SMS_TASK);
  }
}
/*------------------------------------------------------------------------------------------------------------------------------------------------*/
// for call api
var vetgoApi = {
  url: 'http://localhost:7171/api/',
  doc: `
// ex: searchPhone tìm số điên thoại zalo
vetgo.zalo.searchPhone('09000000')
// ex: sendMessage gửi message zalo
vetgo.zalo.sendMessage('#input','hello zalo')
` ,
  writeLog: async (data) => {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "text/plain");
      var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: data,
          redirect: 'follow'
      };
      fetch(`${vetgoApi.url}writeLog?profile=${getPhone()}`, requestOptions)
          .then(response => response.text())
          .then(result => console.log(result))
          .catch(error => console.log(error.stack));
      return true;
  },
  action: async (data) => {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "text/plain");
      var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: data,
          redirect: 'follow'
      };
      fetch(`${vetgoApi.url}action?profile=${getPhone()}`, requestOptions)
          .then(response => response.text())
          .then(result => console.log(result))
          .catch(error => { console.log(error); vetgoApi.writeLog(error.stack) });
  },
  config: async () => {
      var requestOptions = {
          method: 'GET',
          redirect: 'follow'
      };
      fetch(`${vetgoApi.url}config?chromeId=${vetgo.chromeId}`, requestOptions)
          .then(response => response.json())
          .then(result => {
              console.log(result.sheetID);
              console.log(result.phone);
              sessionStorage.setItem(vetgoConstant.PARAM_KEY_SHEET_ID_CLIENT, result.sheetID);
              sessionStorage.setItem(vetgoConstant.PARAM_KEY_PHONE, result.phone);
              vetgoSheetSever.url = vetgoConstant.URL_SCRIPT_GOOGLE.format(result.sheetServer);
              console.log('sheet Id server', result.sheetServer);
          }).catch(error => { console.log(error); vetgoApi.writeLog(error.stack) });
      return true;
  },
  turnOffBrowers: async () => {
      var requestOptions = {
          method: 'GET',
          redirect: 'follow'
      };
      fetch(`${vetgoApi.url}turnOffBrowser?profile=${getPhone()}`, requestOptions)
          .then(result => console.log(result))
          .catch(error => { console.log(error); vetgoApi.writeLog(error.stack) });
  },
  getTask: async () => {
      var requestOptions = {
          method: 'GET',
          redirect: 'follow'
      };
      return fetch(`${vetgoApi.url}getTask?profile=${getPhone()}`, requestOptions)
          .then(response => response.text())
          .then()
          .catch(error => { console.log(error); vetgoApi.writeLog(error.stack) });
  },
  blockTaskSendMessForStranger: async (idTask, timeBlock) => {
      var requestOptions = {
          method: 'GET',
          redirect: 'follow'
      };
      return fetch(`${vetgoApi.url}blockTaskSendMessage?profile=${getPhone()}&idTask=${idTask}&timeBlock=${timeBlock}`, requestOptions)
          .then(response => response.text())
          .then()
          .catch(error => { console.log(error); vetgoApi.writeLog(error.stack) });
  },
  blockTaskSearchLimit: async (idTask) => {
      var requestOptions = {
          method: 'GET',
          redirect: 'follow'
      };
      return fetch(`${vetgoApi.url}blockTaskSearchLimit?profile=${getPhone()}&idTask=${idTask}`, requestOptions)
          .then(response => response.text())
          .then()
          .catch(error => { console.log(error); vetgoApi.writeLog(error.stack) });
  },
  removeTaskProcessing: async (idTask) => {
      var requestOptions = {
          method: 'GET',
          redirect: 'follow'
      };
      return fetch(`${vetgoApi.url}removeTaskProcessing?profile=${getPhone()}&idTask=${idTask}`, requestOptions)
          .then(response => response.text())
          .then()
          .catch(error => { console.log(error); vetgoApi.writeLog(error.stack) });
  }
}
/*------------------------------------------------------------------------------------------------------------------------------------------------*/
// sleep function
// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }
// get sheetId for execute task
function getSheetIdClient() {
  return sessionStorage.getItem(vetgoConstant.PARAM_KEY_SHEET_ID_CLIENT);
}
// get phone for execute task
// function getPhone() {
//   return sessionStorage.getItem(vetgoConstant.PARAM_KEY_PHONE);
// }
// get data analysis
async function getDataAnalysis(license, actionType) {
  const idDataAnalysis = `${parseDMYString(new Date())}_${actionType}`;
  const tableDataAnalysis = vetgoConstant.TBL_DATA_ANALYSIS.format(getPhone());
  let dataAnalysis = await vetgoSheet.getById(idDataAnalysis, tableDataAnalysis);
  if (dataAnalysis == null) {
      let limit;
      let statusTask = { status: vetgoConstant.UN_BLOCK_TASK };
      switch (actionType) {
          case vetgoConstant.ACTION_TYPE_ZALO_ADD_FRIEND:
              limit = license == vetgoConstant.LICENSE_TRIAL ? vetgoConstant.TRIAL_ADD_FRIEND : vetgoConstant.PRO_ADD_FRIEND;
              break;
          case vetgoConstant.ACTION_TYPE_ZALO_SEND_MESSAGE:
              limit = license == vetgoConstant.LICENSE_TRIAL ? vetgoConstant.TRIAL_SEND_MESSAGE : vetgoConstant.PRO_SEND_MESSAGE;
              break;
          case vetgoConstant.ACTION_TYPE_ZALO_SEND_MESSAGE_FOR_STRANGER:
              limit = null;
              statusTask.lastTime = "";
              break;
          case vetgoConstant.ACTION_TYPE_ZALO_REMINDER_CALENDAR:
              limit = license == vetgoConstant.LICENSE_TRIAL ? vetgoConstant.TRAIL_REMIDAR_CALENDAR : vetgoConstant.PRO_REMIDAR_CALENDAR;
              break;
      }
      const dataInsert = {
          id: idDataAnalysis,
          count: 0,
          limit: limit,
          statusTask: JSON.stringify(statusTask)
      }
      await vetgoSheet.add(dataInsert, tableDataAnalysis);
      dataAnalysis = dataInsert;
  }
  return dataAnalysis;
}

function vetgoInit() {
  return new Promise(async rs => {
      var sheetIdClient = getSheetIdClient();
      var phone = getPhone();
      let isStop = false;
      while (!isStop) {
          await vetgoApi.config();
          sheetIdClient = getSheetIdClient();
          phone = getPhone();
          if (sheetIdClient != null && sheetIdClient != "" && phone != null && phone != "") isStop = true;
          await sleep(1000);
      }
      if (isStop) {
          rs(null);
      }
  });
}
// async function selectText(selector) {
//   selector.focus();
//   selector.value = "";
//   return true;
// }
// Lấy thông tin convId từ page https://zalo.me bằng số điện thoại
function getconvId(phone) {
  return new Promise(async rs => {
      let target = await vetgo.sheet.getById(phone, vetgoConstant.TBL_MAP_PHONE.format(getPhone()));
      if (target == null || target.profile == "") {
          var ifrm = document.createElement("iframe");
          ifrm.setAttribute("src", `https://zalo.me/${phone}?actionType=GET_PROFILE`);
          ifrm.style.width = "640px";
          ifrm.style.height = "480px";
          ifrm.setAttribute("id", "ifram-profile");
          document.body.appendChild(ifrm);
          await sleep(4000);
          ifrm.remove();
      }
      rs(null);
  });
}
// Kiểm tra kết bạn zalo
// Trường hợp đã kết bạn thì return true, ngược lại return false
// async function isAddFriendZalo() {
//   const result = await vetgo.se.waitForElement('[data-translate-title="STR_ADD_FRIEND_TO_CONVERSATION"]');
//   return result != null;
// }

// function getCurrentDateTime() {
//   var currentDate = new Date();

//   var day = currentDate.getDate();
//   var month = currentDate.getMonth() + 1; // Note: Months are zero-based, so we add 1
//   var year = currentDate.getFullYear();

//   var hours = currentDate.getHours();
//   var minutes = currentDate.getMinutes();
//   var seconds = currentDate.getSeconds();

//   // Format the components with leading zeros if needed
//   var formattedDate = ('0' + day).slice(-2) + '/' + ('0' + month).slice(-2) + '/' + year;
//   var formattedTime = ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2);

//   var dateTime = formattedDate + ' ' + formattedTime;
//   return dateTime;
// }
// parse string format dd/mm/yyyy hh:MM:ss to date
// function strToDate(dtStr) {
//   if (!dtStr) return null
//   let dateParts = dtStr.split("/");
//   let timeParts = dateParts[2].split(" ")[1].split(":");
//   dateParts[2] = dateParts[2].split(" ")[0];
//   // month is 0-based, that's why we need dataParts[1] - 1
//   return dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0], timeParts[0], timeParts[1], timeParts[2]);
// }
async function closeBrowser(isUpdateFireBase) {
  if (isUpdateFireBase) {
      await uploadQrToFireBase(localStorage.getItem("firebase_url"), getPhone(), null, null, null);
  }
  await vetgoApi.turnOffBrowers();
}
// function generateUUID() { // Public Domain/MIT
//   var d = new Date().getTime();//Timestamp
//   var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
//   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
//       var r = Math.random() * 16;//random number between 0 and 16
//       if (d > 0) {//Use timestamp until depleted
//           r = (d + r) % 16 | 0;
//           d = Math.floor(d / 16);
//       } else {//Use microseconds since page-load if supported
//           r = (d2 + r) % 16 | 0;
//           d2 = Math.floor(d2 / 16);
//       }
//       return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
//   });
// }
// function awaitLoadSuccessPage(selector) {
//   return new Promise((res) => {
//       const intervalTime = 1000; // Check every 100ms
//       const timeout = 300 * intervalTime;
//       const startTime = Date.now();
//       const interval = setInterval(() => {
//           if (document.querySelector(selector)) {
//               console.log("Load page OK");
//               clearInterval(interval);
//               res(document.querySelector(selector));
//           } else if (Date.now() - startTime >= timeout) {
//               console.log("Load page Failed");
//               clearInterval(interval);
//               res(null);
//           }
//       }, intervalTime);
//   })
// }
// async function uploadQrToFireBase(firebase_url, phone, qrCode, status, avatar) {
//   if (!firebase_url || !phone) return;
//   const headers = new Headers();
//   headers.append("Content-Type", "application/json");
//   const id = `QR_${phone}`;
//   const raw = JSON.stringify({
//       id: id,
//       qr: qrCode,
//       status: status,
//       img: avatar,
//       seqNo: new Date().getTime()
//   });

//   const requestOptions = {
//       method: 'PUT',
//       headers: headers,
//       body: raw,
//       redirect: 'follow'
//   };

//   fetch(`${firebase_url}/WEB_HOOK/${id}.json`, requestOptions)
//       .then(response => response.text())
//       .then(result => console.log(result))
//       .catch(error => console.log('error', error));
// }
async function sendTelegramMessage(message) {
  const botToken = '6673410567:AAFlIFwjzMPgMyzAssjHnYlZfNSR-zt3Od8';
  const chatId = '-965779970';
  const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`;

  try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error sending Telegram message:', error);
      throw error;
  }
}
async function sendTelegramMessageError(message) {
  const botToken = '6899246391:AAEKkVpOdTYINHybeVZTQGYzs_PjQIQxZpw';
  const chatId = '-4290874465';
  const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`;

  try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      await sendImageToTelegram();
      return data;
  } catch (error) {
      console.error('Error sending Telegram message:', error);
      throw error;
  }
}
async function sendImageToTelegram() {
  const imagePath = await captureScreen();
  console.error("imageDataUrl", imagePath);
  const token = '6899246391:AAEKkVpOdTYINHybeVZTQGYzs_PjQIQxZpw'; // Thay YOUR_BOT_TOKEN bằng token của bot
  const chatId = '-4290874465';  // Thay YOUR_CHAT_ID bằng chat ID của bạn
  // first convert to blob
  //console.error('Error sending photo to Telegram:', imageDataUrl);
  const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: 'POST',
      body: new URLSearchParams({
          chat_id: chatId,
          photo: `https://api.phanmemvet.vn${imagePath.url}?realm=browser-task&review=true`
      }),
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
      }
  });

  const result = await response.json();
  if (!result.ok) {
      console.error('Error sending photo to Telegram:', result);
  } else {
      console.log('Photo sent successfully');
  }
}

async function captureScreen() {
  return new Promise(async (resolve) => {
      html2canvas(document.body).then(canvas => {
      canvas.toBlob(async (blob) => {
              let formData = new FormData();
              formData.append('file', blob, 'screenshot.png');
              try {
      const response = await fetch('https://api.phanmemvet.vn/public/api/files/upload', {
          method: 'POST',
          body: formData,
          headers: {
              'realm': 'browser-task' // Thêm header Realm
          }
      });

      // Kiểm tra phản hồi từ API
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.error('Upload successful:', result.url);
      resolve(result);
  } catch (error) {

      console.error('Error uploading image:', error);
      resolve()
  }

      })
     // return uploadImage(canvas.toDataURL("image/png"));
  });
  })
}

// add thư viên script
// Tạo một thẻ <script>
const scriptCanvas = document.createElement('script');
// Đặt thuộc tính src để chỉ đến URL của tệp JavaScript
scriptCanvas.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'; // canvas
// Thêm thẻ <script> vào đầu hoặc cuối của thẻ <head> hoặc <body>
document.head.appendChild(scriptCanvas); // Thêm vào <head>

// export here
window.vetgo = { ...(window.vetgo || {}), db: vetgoDB, se: vetgoSe, sheet: vetgoSheet, sheetServer: vetgoSheetSever, zalo: vetgoZalo, api: vetgoApi, vnPay: vetgoVnPay };
