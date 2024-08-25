
const axios = require('axios');

async function runStressTest() {
  const requestPromises = Array(1).fill(null).map(() =>
    axios.post('http://localhost:8200/prompts', {
      prompt: 'Xin chao',
    })
  );
  for(let item of requestPromises) {
    console.log(item);
    await new Promise((resolve) => setTimeout(resolve, 1000));
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
