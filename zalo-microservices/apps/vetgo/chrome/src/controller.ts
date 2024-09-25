// const addScript = (script,actionType) => {
//    let style = window.document.createElement('script');
//    style.setAttribute("type",'text/javascript');
//    style.setAttribute("id", actionType);
//    style.appendChild(window.document.createTextNode(script));
//    if(document.readyState === 'complete') {
//       (window.document.head || document.getElementsByTagName('head')[0]).appendChild(style);
//      } else {
//      if((window.document.head || document.getElementsByTagName('head')[0])) {
//         (window.document.head || document.getElementsByTagName('head')[0]).appendChild(style);
//         } else {
//         document.addEventListener("DOMContentLoaded", function () {
//            (window.document.head || document.getElementsByTagName('head')[0]).appendChild(style);
//         });
//       }
//    }
// }
// try {
//    const actionType =  new URL(window.location.href).searchParams.get("actionType") || "MAIN";
//    const cache  = sessionStorage.getItem(actionType);
//    if(cache) {
//       addScript(cache,actionType);
//    } else {
//       chrome.runtime.sendMessage({action: "CONTROLLER", domain: window.location.hostname.replace(/(https?:\/\/)?(www.)?/i, ''), actionType: actionType }, (response) => {
//           addScript(`var chromeId = "${ chrome.runtime.id}";  ${response.script} `,actionType);
//           sessionStorage.setItem( actionType, `var chromeId = "${ chrome.runtime.id}";  ${response.script} `);
//       });
//    }
// } catch (err) {
//    console.log(err)
// }
// try {
//   // cach dung:  document.querySelector('body').dispatchEvent(new CustomEvent('REMOVE_EXTENSION', { detail: { key: 'value' } }));
//   setTimeout(()=> {
//     document.querySelector('body').addEventListener('REMOVE_EXTENSION', function(event: any) {
//       console.log(event.detail); // { key: 'value' }
//       chrome.runtime.sendMessage({action: "REMOVE_EXTENSION", data: event.detail}, (response) => {

//         console.log('tu huy thanh cong' , response);
//       });
//     });
//   }, 1000);
// } catch (err) {
//   console.log(err);
// }

