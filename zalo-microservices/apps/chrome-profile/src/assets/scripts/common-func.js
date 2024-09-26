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
    const eventHandler = function(event) {
      console.warn('response from server', event.detail);

      // Gọi resolve để trả về dữ liệu và xử lý xong
      resolve(event.detail);

      // Loại bỏ event listener sau khi nhận được phản hồi
      document.querySelector('body').removeEventListener('RESPONSE_FROM_SERVER', eventHandler);
    };

    // Gắn sự kiện để lắng nghe phản hồi từ server
    document.querySelector('body').addEventListener('RESPONSE_FROM_SERVER', eventHandler);

    // Gửi dữ liệu tới server thông qua window.sendActionType
    window.sendActionType(data).then(); // gửi event
  });
}

var vetgoSe = {
  profileId: () => sessionStorage.getItem('phone'),
  sendKey: async function  (selector, value, isEnter, delay = 50) {
    return new Promise((res) => {
      value = value.replace(/\n/g, ' ');
      const model = { phone: this.profileId() ,actionType: 'SEND_KEY', data: { selector: selector, value: value, isEnter: isEnter, delay: delay }, url: window.location.href, messageStatus: "NEW" };
      console.warn('vetgoSe -> sendKey' , model);
      sendEvent(model).then(data => {
          console.log(data);
          res(data);
      })
  }).catch(error => console.log("Lỗi sendKeyImage: " + error));
  },
  sendKeyImage: async function (selector, url) {
    return new Promise((res) => {
        const model = {phone: this.profileId(), actionType: 'PASTE_IMAGE', data: { selector: selector, url: url }, url: window.location.href, messageStatus: "NEW" };
        console.warn('vetgoSe -> sendKeyImage' , model);
        sendEvent(model).then(data => {
            console.log(data);
            res(data);
        })
    }).catch(error => console.log("Lỗi sendKeyImage: " + error));
}
};

window.vetgo =  { db: vetgoDB, se: vetgoSe}
