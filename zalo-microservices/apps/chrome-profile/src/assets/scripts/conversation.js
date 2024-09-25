// cào nội dung khung chát đang mở
// trả về danh sách
// {
//   "sender": "me",
//   "content": [
//       {
//           "type": "text",
//           "content": "Dạ hiện tại đã ổn định lại rồi chị ạ"
//       }
//   ],
//   "time": "23:59",
//   "avatar": "https://res-zalo.zadn.vn/upload/media/2019/1/25/iconlike_1548389696575_103596.png"
// },
// {
//   "sender": "other",
//   "content": [
//       {
//           "type": "image",
//           "content": "blob:https://chat.zalo.me/79411b42-37e7-4b4c-94e4-cfa090a4595a"
//       }
//   ],
//   "time": "09:05",
//   "avatar": "https://s120-ava-talk.zadn.vn/f/3/7/0/31/120/e64d748ecabf69945573344c88f247a0.jpg"
// }
(async function () { // maxScrolls = 40
  async function scrollToTop() {
    const messageContainer = document.querySelector(
      "#messageViewContainer div[style*='overflow: scroll']"
    );

    if (messageContainer) {
      let currentScrollTop = messageContainer.scrollTop;
      let scrollCount = 0; // Đếm số lần cuộn
      const maxScrolls = 40; // Giới hạn tối đa 5 lần cuộn

      // Lặp cho đến khi scrollTop đạt giá trị 0 (tức là lên đến đầu trang)
      while (currentScrollTop > 0 && scrollCount < maxScrolls) {
        messageContainer.scrollTop -= 400; // Giảm scrollTop để cuộn lên
        await new Promise((resolve) => setTimeout(resolve, 100)); // Dừng 100ms trước khi cuộn tiếp
        currentScrollTop = messageContainer.scrollTop;
        scrollCount++; // Tăng số lần cuộn
      }

      if (scrollCount >= maxScrolls) {
        console.warn(`Đã cuộn tối đa ${maxScrolls} lần.`);
      } else {
        console.warn('Đã scroll lên tới đầu trang.');
      }
    } else {
      console.error('Không tìm thấy phần tử container chứa lịch chat.');
    }
  }

  function getMessages() {
    const chatItems = document.querySelectorAll('.chat-item'); // Chọn các phần tử chat
    const messages = [];

    chatItems.forEach((item) => {
      const isSender = item.querySelector('.me') !== null; // Kiểm tra tin nhắn do người gửi hay nhận

      // Lấy tất cả các tin nhắn văn bản
      const messageElements = item.querySelectorAll('.text');
      const messageContentList = [];

      messageElements.forEach((msgElement) => {
        const messageContent = msgElement ? msgElement.innerText : ''; // Lấy nội dung tin nhắn
        if (messageContent) {
          messageContentList.push({ type: 'text', content: messageContent });
        }
      });

      // Kiểm tra xem có hình ảnh nào không
      const imageElement = item.querySelector('.image-box__image img');
      if (imageElement) {
        const imageUrl = imageElement.src; // Lấy đường dẫn ảnh
        messageContentList.push({ type: 'image', content: imageUrl });
      }

      const messageTime = item.querySelector('.card-send-time__sendTime')
        ? item.querySelector('.card-send-time__sendTime').innerText
        : ''; // Lấy thời gian gửi

      // Lấy avatar từ phần tử <img>
      const avatarElement = item.querySelector('img');
      const avatar = avatarElement ? avatarElement.src : '';

      messages.push({
        sender: isSender ? 'me' : 'other',
        content: messageContentList, // Danh sách các tin nhắn, có thể là văn bản hoặc hình ảnh
        time: messageTime,
        avatar: avatar, // Đường dẫn tới avatar
      });
    });

    return messages;
  }

  document.body.style.zoom = '0.25'; // Phóng to giao diện để dễ lấy tin nhắn
  await scrollToTop(); // Gọi hàm để cuộn lên đầu trang
  const allMessages = getMessages(); // Lấy toàn bộ tin nhắn sau khi cuộn lên
  console.warn(allMessages); // Hiển thị tất cả tin nhắn trong console
  document.body.style.zoom = '1'; // Trả về kích thước ban đầu
  return allMessages;
})();
