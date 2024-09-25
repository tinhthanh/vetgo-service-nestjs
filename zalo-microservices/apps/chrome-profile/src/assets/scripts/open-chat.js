// input là link img
// B1 scroll xuống đến khi tìm được ảnh theo url
// tìm thấy thì click vào link img để đi qua khung chát
// true neu tìm thấy, false neu không tìm thấy

// giả lập input để dán lên khung chát để test
// task case avt có trong khug chat , và avt k có trong khung chát
// sessionStorage.setItem('open-chat.js', JSON.stringify({
//   avt: 'https://s120-ava-talk.zadn.vn/4/c/5/4/27/120/64bdc01d51614b63c9a78674d5a2c919.jpg'
// }));

(async () => { // return true | false -> true tìm được và mở khung chat len
  // start xử lý input
  const inputStr = sessionStorage.getItem('open-chat.js'); // nhận input
  let input = { avt: "" };
  if (inputStr) {
    sessionStorage.removeItem('open-chat.js'); // sau khi nhận thì xoá input
    const iObj = JSON.parse(inputStr);
    if (iObj.avt) {
        input = iObj;
    }
  } else {
     // thông báo lỗi
     console.error('Vui lòng truyền input vào hàm nay !');
     return false;
  }
  // end xử lý input

  document.body.style.zoom = '0.25';
  // kiểm tra có đang đứng ở màn hình danh sách tin nhắ hay không
  const elMenuActive = document.querySelector('.selected[data-translate-title="STR_TAB_MESSAGE"]');
  if (!elMenuActive) {
     document.querySelector('[data-translate-title="STR_TAB_MESSAGE"]').click();
     await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // kiểm tra khung danh sách chát có avt thi click vào
  // trả vè true | false
  function checkAndClick() {
    try {
      let clicked = false; // Cờ để kiểm tra xem đã click chưa
      document.querySelectorAll('.ReactVirtualized__Grid__innerScrollContainer .msg-item').forEach(el => {
        if (clicked) return; // Thoát nếu đã click

        if (el.querySelectorAll('.zavatar-single').length === 1) {
          const name = el.querySelector('.conv-item-title__name').innerText;
          const elAvt = el.querySelector('.zavatar-single img');

          if (elAvt) {
            const avt = elAvt.getAttribute('src');
            const avtFilename = avt.split('/').pop(); // Lấy tên file từ URL avt
            const inputAvtFilename = input.avt.split('/').pop(); // Lấy tên file từ URL input.avt

            if (avtFilename === inputAvtFilename) { // chỉ so sánh tên ảnh thôi
              elAvt.click();
              clicked = true; // Đánh dấu đã click
            }
          }
        }
      });

      return clicked; // Trả về true nếu đã click, ngược lại false
    } catch (e) {
      console.log(e);
      return false; // Trả về false trong trường hợp có lỗi
    }
  }


  // Hàm để cuộn và trả về kết quả tìm thấy true | false
  async function scrollAndCollect() {
    let previousScrollTop = -1;
    // Chọn container scroll và container chứa các phần tử
    const scrollContainer = document.querySelector('.virtualized-scroll > div');
    const itemContainer = document.querySelector('.ReactVirtualized__Grid__innerScrollContainer');
    if (!scrollContainer || !itemContainer) {
      console.error('Không tìm thấy container cuộn hoặc container phần tử.');
      return false;
    }
    let rs = false;
    // Cuộn và thu thập dữ liệu
    while (true) {
      // Thu thập thông tin từ các phần tử đang hiển thị trong viewport
      const isFound = checkAndClick();
        if(isFound) {
          rs  = true; // đánh dấu là tìm được
          break;
        }

      // Cuộn xuống 1000px hoặc đến cuối
      scrollContainer.scrollTop += 1000;

      // Đợi một chút để các phần tử mới được tải vào
      await new Promise(resolve => setTimeout(resolve, 500)); // Điều chỉnh thời gian đợi nếu cần

      // Kiểm tra nếu không còn cuộn được nữa thì dừng lại
      if (scrollContainer.scrollTop === previousScrollTop) {
        break;
      }
      previousScrollTop = scrollContainer.scrollTop;
    }
    return rs;
  }

  // Gọi hàm và log kết quả
  const scrollContainer = document.querySelector('.virtualized-scroll > div');
  scrollContainer.scrollTop = 0; // đưa thanh scroll lên top
  const result = await scrollAndCollect();
  // scroll ve top
  scrollContainer.scrollTop = 0;
  console.warn('Kết quả tìm kiếm và click khung chát:', result);
    document.body.style.zoom = '1';
  return result;
})();
