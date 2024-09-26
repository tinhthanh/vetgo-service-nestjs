(async () => {
  // return true | false -> true tìm được và mở khung chat len
  // start xử lý input
  const inputStr = sessionStorage.getItem('send-message.js'); // nhận input
  let input = { msg: '' , images: []};
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
  // TODO handle gửi ảnh trước
  const list = (input?.images || []);
  if(list.length > 0) {
    for (let index = 0; index < list.length; index++) {
      const url = list[index];
      await vetgo.se.sendKeyImage("#chat-input-content-id" , url);
    }
  }
  // gửi ảnh xong gửi tin
  if(input?.msg) {
    await vetgo.se.sendKey("#chat-input-content-id" , input.msg, true );
  }
  return {status: "DONE"};
  // end xử lý input
})();
