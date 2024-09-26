// dán ảnh vào khung chát face book
const response = await fetch("https://scontent.fsgn1-1.fna.fbcdn.net/v/t1.6435-1/118546344_1627530727424786_1296301660786447754_n.jpg?stp=cp0_dst-jpg_s80x80&_nc_cat=107&ccb=1-7&_nc_sid=db5862&_nc_ohc=nKaDAcLY69gQ7kNvgEfUkcg&_nc_ht=scontent.fsgn1-1.fna&oh=00_AYBxIUhWlu2PpOekp2pt5a8xyjXSni4rC4sDmy5KBEV4sw&oe=671C8FF9");
const blob = await response.blob(); // Chuyển dữ liệu ảnh thành Blob

// Tạo đối tượng File từ Blob
const file = new File([blob], 'image.png', { type: 'image/png' });

// Mô phỏng sự kiện DragEvent và thêm file vào DataTransfer
const eventDrop = new DragEvent('drop', {
  bubbles: true,
  cancelable: true,
  dataTransfer: new DataTransfer(),
});
eventDrop.dataTransfer.items.add(file);

// Thực hiện thao tác drop trên vùng chỉ định (dropSelector)
const dropZone = document.querySelector('#mount_0_0_pq > div > div > div:nth-child(1) > div > div.x9f619.x1n2onr6.x1ja2u2z > div > div > div.x78zum5.xdt5ytf.x1t2pt76.x1n2onr6.x1ja2u2z.x10cihs4 > div.x9f619.x2lah0s.x1nhvcw1.x1qjc9v5.xozqiw3.x1q0g3np.x78zum5.x1iyjqo2.x1t2pt76.x1n2onr6.x1ja2u2z > div.x9f619.x1n2onr6.x1ja2u2z.xdt5ytf.x193iq5w.xeuugli.x1r8uery.x1iyjqo2.xs83m0k.x78zum5.x1t2pt76 > div > div > div > div > div > div > div > div.x9f619.x1ja2u2z.x193iq5w.xeuugli.x1r8uery.x1iyjqo2.xs83m0k.x78zum5.xdt5ytf.x6ikm8r.x10wlt62.x1n2onr6 > div > div.x78zum5.xdt5ytf.x1iyjqo2.xs83m0k.x1n2onr6 > div > div > div > div:nth-child(2) > div');
if (dropZone) {
  dropZone.dispatchEvent(eventDrop);
  console.log('File dropped successfully!');
} else {
  console.error('Drop zone not found!');
}
