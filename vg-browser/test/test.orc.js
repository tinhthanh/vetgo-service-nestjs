
const axios = require('axios');

async function runStressTest() {
  const requestPromises = Array(5).fill(null).map(() =>
    axios.post('http://localhost:7200/ocr/img', {
      url: 'https://firebasestorage.googleapis.com/v0/b/petplus2025.appspot.com/o/image%2Fz5734402069691_59f7fd184baad67064c636e417fd8e82.jpg-1723723689178.jpeg?alt=media&token=cd595208-be0f-4aa8-bd3e-ae5f901c5e5d',
    })
  );
  for(let item of requestPromises) {
    console.log(item);
    try {
        item.then((rs) => {
          console.log(rs.data);
          console.log('done')
        });
    } catch (error) {
        console.error('One or more requests failed:', error.error);
      }
  }
}

runStressTest();
