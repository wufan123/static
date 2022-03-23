const axios = require('axios')
const fs = require('fs-extra')

const hero_list_url = 'https://game.gtimg.cn/images/lol/act/img/js/heroList/hero_list.js'
const hero_detail_url ="https://game.gtimg.cn/images/lol/act/img/js/hero/"
async function getData(){
   console.log('get hero list');""
   var {data} =  await axios.get(hero_list_url);
   console.log('write hero list to data file')
   await fs.writeJSONSync("./data/hero_list.json",data);
   for(let item of data.hero){ 
      console.log(`get hero ${item.name} detail`)
      var {data} = await axios.get(`${hero_detail_url}${item.heroId}.js`)
      console.log(`write hero ${item.name} detail to data file`)
      await fs.writeJSONSync(`./data/${item.heroId}.json`,data);
   }
}

getData();
