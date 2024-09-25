import { LoadScriptController } from "./controllers/load-script.controller";
import { Observable } from "rxjs";
import { CommonFunc } from "./controllers/load-common-fuc.controller";
import { uuid } from "./utils/db-utils";

// Sử dụng declarativeNetRequest thay cho webRequest để tương thích với manifest v3
// chrome.declarativeNetRequest.updateDynamicRules({
//   addRules: [
//     {
//       id: 1,
//       priority: 1,
//       action: {
//         type: 'modifyHeaders',
//         responseHeaders: [
//           { header: 'content-security-policy', operation: 'remove' },
//           { header: 'x-frame-options', operation: 'remove' }
//         ]
//       },
//       condition: {
//         urlFilter: '*',
//         resourceTypes: ['main_frame', 'sub_frame']
//       }
//     }
//   ],
//   removeRuleIds: [1]
// });

// // Lắng nghe các yêu cầu trước khi gửi
// chrome.declarativeNetRequest.updateDynamicRules({
//   addRules: [
//     {
//       id: 2,
//       priority: 1,
//       action: { type: 'allow' },
//       condition: {
//         urlFilter: '*',
//         resourceTypes: ['main_frame', 'sub_frame']
//       }
//     }
//   ],
//   removeRuleIds: [2]
// });

// Chuyển đổi từ chrome.tabs.executeScript sang chrome.scripting.executeScript
// chrome.webRequest.onBeforeRequest.addListener(
//   async (details) => {
//     const url = new URL(details.url);
//     const params = new URLSearchParams(url.search);
//     const sheetID = params.get('sheetID');
//     if (details.method === 'GET' && sheetID) {
//       console.log('Found GET request with sheetID:', details.url);
//       // Sử dụng chrome.scripting để thực thi đoạn mã trong tab
//       await chrome.scripting.executeScript({
//         target: { tabId: details.tabId },
//         func: (sheetID) => {
//           localStorage.setItem("sheetID", sheetID);
//         },
//         args: [sheetID]
//       });
//       console.log('sheetID saved to local storage of the current domain:', sheetID);
//     }
//     const profile = params.get('profile');
//     if (details.method === 'GET' && profile) {
//       console.log('Found GET request with profile:', details.url);
//       await chrome.scripting.executeScript({
//         target: { tabId: details.tabId },
//         func: (profile) => {
//           localStorage.setItem("profile", profile);
//         },
//         args: [profile]
//       });
//       console.log('profile saved to local storage of the current domain:', profile);
//     }
//   },
//   { urls: ['<all_urls>'] },
//   []
// );

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  // Log the URL of the navigation
  console.log('Navigating to:', details.url);
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    tabs.filter((url) => url.url.includes('id.zalo.me')).forEach((it) => {
      if (it.id !== details.tabId) {
        chrome.tabs.remove(it.id);
      }
    });
  });
}, { url: [{ hostEquals: 'id.zalo.me' }] });

// Sử dụng rxjs Observable để lấy chromeId
const getChromeId = (): Observable<string> => {
  return new Observable((ob) => {
    chrome.storage.sync.get(({ id }) => {
      if (!id) {
        const chromeId = uuid();
        chrome.storage.sync.set({ id: chromeId });
        ob.next(chromeId);
      } else {
        ob.next(id);
      }
    });
  });
};

// Khi extension được cài đặt
chrome.runtime.onInstalled.addListener((data) => {
  getChromeId().subscribe((id) => {
    console.log("id", id);
  });
});

// Lắng nghe các message gửi tới extension
chrome.runtime.onMessage.addListener((request, sender, respond) => {
  console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
  const handler = new Promise((resolve, reject) => {
    if (request.action === 'REMOVE_EXTENSION') {
      // Tự gỡ bỏ extension
      chrome.management.uninstallSelf();
      resolve(request);
      return;
    }
    if (request.action === 'SHEET') {
      resolve(request);
      return;
    }
    if (request.action == 'CONTROLLER') {
      const actionType = request.actionType || "MAIN";
      getChromeId().subscribe((id) => {
        console.log(id);
        CommonFunc.load().then((commonCode) => {
          LoadScriptController.loadScriptByDomain(request.domain, actionType).then((code) => {
            let script = `
              window.vetgo = {...(window.vetgo || {} ) ,chromeId:"${id}"};
              ${commonCode}
              ${code}
            `;
            resolve({ script });
          });
        });
      });
    } else {
      reject('//request is empty.');
    }
  });
  handler.then((message) => respond(message)).catch((error) => respond(error));
  return true;
});
