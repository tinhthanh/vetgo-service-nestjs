// cào nội dung khung chát đang mở
// trả về danh sách
// {
//   "sender": "me",
//   "content": [
//       {
//           "id": "5884397564563",
//           "date": "1727748809908",
//           "type": "text",
//           "content": "kinh chái la ben ben"
//       },
//       {
//           "id": "5884416816468",
//           "date": "1727749077394",
//           "type": "text",
//           "content": "phong kham gui ket qua xet nghiem cho be ạ"
//       }
//   ],
//   "time": "09:17",
//   "avatar": ""
// }
(async function () { // maxScrolls = 40
  let input = vetgo.se.input('conversation.js') || {lastId: ''}; // {lastId: '5884397564563'}; chỉ cào đến last id

  console.warn(input);
  async function scrollToTop() {
    const messageContainer = document.querySelector(
      "#messageViewContainer div[style*='overflow: scroll']"
    );

    if (messageContainer) {
      let currentScrollTop = messageContainer.scrollTop;
      let scrollCount = 0; // Đếm số lần cuộn
      const maxScrolls = 40; // Giới hạn tối đa 5 lần cuộn

      // Lặp cho đến khi scrollTop đạt giá trị 0 (tức là lên đến đầu trang)
      const elNotShow = () => {
        if(input.lastId) {
          const lastMessage =  document.querySelector(`#mtc-${input.lastId}`);
          if(lastMessage) {
            console.warn('Đã tìm thấy last message trong cache');
          }
          return lastMessage ? false: true;
        } else {
          return true;
        }
      }
      while ( elNotShow() && currentScrollTop > 0 && scrollCount < maxScrolls) {
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

      // Lấy tất cả các tin nhắn văn bản id="bb_msg_id_1727617163899" 1727617163899 -> time
      const messageElements = item.querySelectorAll('[id^="bb_msg_id_"]');
      const messageContentList = [];

      messageElements.forEach((msgElement) => {
        const date =  msgElement.id.replaceAll('bb_msg_id_' , ''); // Lấy thời gian tin nhắn ->

        const elId =  msgElement.querySelector('[id^="mtc-"]') || msgElement.querySelector('[id^="reaction-btn-"]') ;
        // const elId =  msgElement.querySelector('[id^="reaction-btn-"]');
          if(!elId) {
             return;
          }
          const id = elId.id.replaceAll('mtc-' , '').replaceAll('reaction-btn-' , '');
            // Kiểm tra xem có hình ảnh nào không
      const imageElement = msgElement.querySelector('.chatImageMessage .image-box__image img');
        if (imageElement) {
          const imageUrl = imageElement.src; // Lấy đường dẫn ảnh
          messageContentList.push({id, date, type: 'image', content: imageUrl });
          return;
        }
        const textMsg =  elId.innerText || '';
        if (textMsg) {
          messageContentList.push({id, date, type: 'text', content: textMsg });
        }

      });
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
        avatar: isSender ? '' :avatar, // Đường dẫn tới avatar
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
