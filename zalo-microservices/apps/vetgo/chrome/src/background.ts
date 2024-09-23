import { LoadScriptController } from "./controllers/load-script.controller";
import {BehaviorSubject, debounceTime, Observable, of} from "rxjs";
import {DeviceRemoteService} from "./services/device-remote.service";
import {CommonFunc} from "./controllers/load-common-fuc.controller";
import {uuid} from "./utils/db-utils";
// const $eventOpenZalo = new BehaviorSubject<boolean>(null);
// const deviceRemoteService = new DeviceRemoteService();
// $eventOpenZalo.pipe(
//   debounceTime(1000)
// ).subscribe((it)=> {
//   if(it) {
//     zaloTab();
//   }
// })
const HEADERS_TO_STRIP_LOWERCASE = [
  'content-security-policy',
  'x-frame-options',
];
chrome.webRequest.onHeadersReceived.addListener((details) =>{
    return {
      responseHeaders: details.responseHeaders.filter(function(header) {
        return HEADERS_TO_STRIP_LOWERCASE.indexOf(header.name.toLowerCase()) < 0;
      })
    };
  }, {
    urls: ["<all_urls>"]
  }, ["blocking", "responseHeaders"]);

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    const url = new URL(details.url);
    const params = new URLSearchParams(url.search);
    const sheetID = params.get('sheetID');
    if (details.method === 'GET' && sheetID) {
      console.log('Found GET request with phone=ABC:', details.url);
      // Thực hiện các hành động khác với yêu cầu này
      chrome.tabs.executeScript(details.tabId, {
        code: 'localStorage.setItem("sheetID", "' + sheetID + '");'
      }, function() {
        console.log('phoneParam saved to local storage of the current domain:', sheetID);
      });
    }
    const profile = params.get('profile');
    if (details.method === 'GET' && profile) {
      console.log('Found GET request with phone=ABC:', details.url);
      // Thực hiện các hành động khác với yêu cầu này
      chrome.tabs.executeScript(details.tabId, {
        code: 'localStorage.setItem("phone", "' + profile + '");'
      }, function() {
        console.log('phoneParam saved to local storage of the current domain:', profile);
      });
    }
  },
  { urls: ['<all_urls>'] },
  ['blocking']
);

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  // Log the URL of the navigation
  console.log('Navigating to:', details.url);
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    tabs.filter( url => url.url.includes('id.zalo.me')).forEach( (it) => {
      if(it.id !== details.tabId) {
        chrome.tabs.remove(it.id);
      }
    })
  })

}, { url: [{ hostEquals: 'id.zalo.me' }] });
const getChromeId = ():Observable<string> =>{
  return new Observable((ob) => {
    chrome.storage.sync.get(({id}) => {
      if(!id) {
       const chromeId =  uuid();
        chrome.storage.sync.set({id: chromeId});
        ob.next(chromeId);
      } else {
        ob.next(id);
      }
    })
  });
}
chrome.runtime.onInstalled.addListener((data) => {
  getChromeId().subscribe((id) => {
    console.log("id",id);
  });
  // chrome.storage.sync.clear(() => console.log("Clear store......"));
  // chrome.cookies.getAll({}, function(cookies) {
  //   var json = JSON.stringify(cookies);
  //   var blob = new Blob([json], {type: "application/json"});
  //   var url = URL.createObjectURL(blob);
  //
  //   chrome.downloads.download({
  //     url: url,
  //     filename: "cookies.json"
  //   });
  // });
});
// function zaloTab() {
//   chrome.tabs.query({ currentWindow: true }, (tabs) => {
//     const isNewTab = tabs.map(tab => tab.url).some( url => url.includes('chat.zalo.me') || url.includes('id.zalo.me'));
//     if(!isNewTab) {
//       chrome.tabs.create({ url: 'https://chat.zalo.me', active: false });
//     }
//   });
// }
// Listen for tab removal
// chrome.tabs.onActivated.addListener((activeInfo) => {
//   $eventOpenZalo.next(true);
// });
// chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
//   $eventOpenZalo.next(true);
// });
chrome.tabs.onCreated.addListener((tab) => {
  // console.log(JSON.stringify(tab));
  // alert(JSON.stringify(tab))
});
chrome.cookies.onChanged.addListener((changeInfo) => {
  // console.log(JSON.stringify(changeInfo.cookie))
});
chrome.runtime.onMessage.addListener((request, sender, respond) => {
  console.log(sender.tab ?
    "from a content script:" + sender.tab.url :
    "from the extension");
  const handler = new Promise((resolve, reject) => {
    if ( request.action === 'REMOVE_EXTENSION' ) {
      // ham nay de tu xoa extension
      chrome.management.uninstallSelf();
      resolve(request);
      return;
    }
    if(request.action === 'SHEET') {
      resolve(request);
      return;
    }
    if (request.action == 'CONTROLLER') {
      const actionType = request.actionType || "MAIN";
      getChromeId().subscribe((id) => {
        console.log(id);
        CommonFunc.load().then((commonCode)=> {
          LoadScriptController.loadScriptByDomain(request.domain, actionType).then((code) => {
            let script = `
          window.vetgo = {...(window.vetgo || {} ) ,chromeId:"${id}"};
          ${commonCode}
          ${code}
          `;
            resolve({ script });
          });
        })
      })
    } else {
      reject('//request is empty.');
    }
  });
  handler.then(message => respond(message)).catch(error => respond(error));
  return true;

});
