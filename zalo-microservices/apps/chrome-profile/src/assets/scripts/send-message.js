(async () => {
  // return true | false -> true tìm được và mở khung chat len
  // start xử lý input
  const inputStr = sessionStorage.getItem('send-message.js'); // nhận input
  let input = { msg: '' };
  if (inputStr) {
    sessionStorage.removeItem('send-message.js'); // sau khi nhận thì xoá input
    const iObj = JSON.parse(inputStr);
    if (iObj.msg) {
      input = iObj;
    }
  } else {
    // thông báo lỗi
    console.error('Vui lòng truyền input vào hàm nay !');
    return false;
  }
 await vetgo.se.sendKey("#chat-input-content-id" , input.msg, true );
  return {status: "DONE"};
  // end xử lý input
})();
