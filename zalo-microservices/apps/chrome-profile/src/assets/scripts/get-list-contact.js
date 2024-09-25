(async () => {
  document.body.style.zoom = '0.25';
  // kiểm tra có đang ở màn hình danh bạ hay không
  const elMenuActive = document.querySelector('.selected[data-translate-title="STR_TAB_CONTACT"]');
  if (!elMenuActive) {
    // chuyển sang tab danh bạ và đợi zl render
     document.querySelector('[data-translate-title="STR_TAB_CONTACT"]').click();
     await new Promise(resolve => setTimeout(resolve, 1000));
  }
  // Mảng lưu trữ các đối tượng avatar đã thu thập để tránh trùng lặp
  let collectedContacts = new Set();

  // Hàm để thu thập dữ liệu từ các phần tử hiện tại
  function collectDataFromContacts() {
    const contacts = [];
    try {
      document.querySelectorAll('.contact-item-v2-wrapper').forEach(el => {
        const nameElement = el.querySelector('.name-wrapper .name');
        const avatarElement = el.querySelector('.zavatar-single img');

        if (nameElement && avatarElement) {
          const name = nameElement.innerText.trim();
          const avatar = avatarElement.getAttribute('src').trim();

          // Kiểm tra nếu avatar chưa được thu thập, thì thêm vào contacts và collectedContacts
          if (!collectedContacts.has(avatar)) {
            contacts.push({ name,avt: avatar });
            collectedContacts.add(avatar); // Lưu lại avatar để tránh trùng lặp
          }
        }
      });
    } catch (e) {
      console.error('Error collecting contact data:', e);
    }
    return contacts;
  }

  // Hàm để cuộn và thu thập dữ liệu
  async function scrollAndCollect() {
    let allContactsData = [];
    let previousScrollTop = -1;

    // Chọn container scroll và container chứa các phần tử
    const scrollContainer = document.querySelector('.contact-tab-v2__scrollbar-custom > div');
    const itemContainer = document.querySelector('.ReactVirtualized__Grid__innerScrollContainer');

    if (!scrollContainer || !itemContainer) {
      console.error('Không tìm thấy container cuộn hoặc container phần tử.');
      return;
    }

    // Cuộn và thu thập dữ liệu
    while (true) {
      // Thu thập thông tin từ các phần tử đang hiển thị trong viewport
      const contactsData = collectDataFromContacts();

      // Thêm dữ liệu mới vào danh sách
      allContactsData = [...allContactsData, ...contactsData];

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

    return allContactsData;
  }
  // Gọi hàm và log kết quả
  const allContacts = await scrollAndCollect();

  console.warn('Tất cả liên hệ đã thu thập:', allContacts);
  // chuyển về trang message
  document.querySelector('[data-translate-title="STR_TAB_MESSAGE"]').click();
  document.body.style.zoom = '1';
  return allContacts;
})();
