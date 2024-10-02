(async () => {
  document.body.style.zoom = '0.25';
  // kiểm tra có đang đứng ở màn hình danh sách tin nhắ hay không
  const elMenuActive = document.querySelector('.selected[data-translate-title="STR_TAB_MESSAGE"]');
  if (!elMenuActive) {
     document.querySelector('[data-translate-title="STR_TAB_MESSAGE"]').click();
     await new Promise(resolve => setTimeout(resolve, 1000));
  }
  // Mảng lưu trữ các đối tượng avatar đã thu thập
  let collectedAvatars = new Set();

  // Hàm để thu thập dữ liệu từ các phần tử hiện tại
  function collectDataFromItems() {
    const items = [];
    try {
      document.querySelectorAll('.ReactVirtualized__Grid__innerScrollContainer .msg-item').forEach(el => {
        if (el.querySelectorAll('.zavatar-single').length === 1) {
          const name = el.querySelector('.conv-item-title__name').innerText;
          const msg = el.querySelector('.conv-message').innerText;
          let time = '';
          const elTime = el.querySelector('.preview-time');
          if (elTime) {
            time = elTime.innerText;
          }
          const elAvt = el.querySelector('.zavatar-single img');
          // TODO trường hợp user chưa cập nhật avt
           if(!elAvt) {
            return;
           }
          const avt = elAvt.getAttribute('src');

          // Kiểm tra nếu avatar chưa được thu thập, thì thêm vào items và collectedAvatars
          if (!collectedAvatars.has(avt)) {
            // kiểm tra có tắt thông báo không
           const mute = el.querySelector('.conv__mute') ? true : false;
            // lay so luong tin nhan den
            let counter = '';
            const elCounter =  el.querySelector('.--counter > i[class^="fa fa-"]');
            if(elCounter) {
              try {
                counter = elCounter.classList[1].match(/fa-(\d+|\d+\+)/)[1] || '';
                if(counter) {
                  counter = parseInt(counter, 10);
                }
              } catch (e) { }
            }
            // kiem tra nut gim
             const pinned = el.classList.contains('pinned');

            items.push({ name, msg, time, avt, pinned, counter, mute });
            collectedAvatars.add(avt); // Lưu lại avatar để tránh trùng lặp
          }
        }
      });
    } catch (e) {
      console.warn(e);
    }
    return items;
  }

  // Hàm để cuộn và thu thập dữ liệu
  async function scrollAndCollect() {
    let allElementsData = [];
    let previousScrollTop = -1;

    // Chọn container scroll và container chứa các phần tử
    const scrollContainer = document.querySelector('.virtualized-scroll > div');
    const itemContainer = document.querySelector('.ReactVirtualized__Grid__innerScrollContainer');

    if (!scrollContainer || !itemContainer) {
      console.error('Không tìm thấy container cuộn hoặc container phần tử.');
      return;
    }

    // Cuộn và thu thập dữ liệu
    while (true) {
      // Thu thập thông tin từ các phần tử đang hiển thị trong viewport
      const elementsData = collectDataFromItems();

      // Thêm dữ liệu mới vào danh sách
      allElementsData = [...allElementsData, ...elementsData];

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

    return allElementsData;
  }

  // Gọi hàm và log kết quả
  const scrollContainer = document.querySelector('.virtualized-scroll > div');
  scrollContainer.scrollTop = 0; // đưa thanh scroll lên top
  const allData = await scrollAndCollect();
  // scroll ve top
  scrollContainer.scrollTop = 0;
  console.warn('Tất cả dữ liệu đã thu thập:', allData);
    document.body.style.zoom = '1';
  return allData;
})();
