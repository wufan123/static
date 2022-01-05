
let summonerSkills = [
  {
    name: "屏障",
    cd: 180,
    icon: "./imgs/SummonerBarrier.png",
  },
  {
    name: "净化",
    cd: 210,
    icon: "./imgs/SummonerBoost.png",
  },
  {
    name: "点燃",
    cd: 180,
    icon: "./imgs/SummonerDot.png",
  },
  {
    name: "虚弱",
    cd: 210,
    icon: "./imgs/SummonerExhaust.png",
  },
  {
    name: "闪现",
    cd: 300,
    icon: "./imgs/SummonerFlash.png",
  },
  {
    name: "疾跑",
    cd: 210,
    icon: "./imgs/SummonerHaste.png",
  },
  {
    name: "治疗",
    cd: 240,
    icon: "./imgs/SummonerHeal.png",
  },
  {
    name: "清晰",
    cd: 240,
    icon: "./imgs/SummonerMana.png",
  },
  // {
  //   name: "护驾",
  //   cd: 10,
  //   icon: "./imgs/SummonerPoroRecall.png",
  // },
  // {
  //   name: "魄罗投掷",
  //   cd: 10,
  //   icon: "./imgs/SummonerPoroThrow.png",
  // },
  {
    name: "惩戒",
    cd: 15,
    icon: "./imgs/SummonerSmite.png",
  },
  {
    name: "标记",
    cd: 80,
    icon: "./imgs/SummonerSnowball.png",
  },
  {
    name: "传送",
    cd: 420,
    icon: "./imgs/SummonerTeleport.png",
  },
];

let list = [
  {
    name: "上路",
    playerSkills: ["闪现", "点燃", "传送", "疾跑"],
  },
  {
    name: "打野",
    playerSkills: ["闪现", "惩戒"],
  },
  {
    name: "中路",
    playerSkills: ["闪现", "点燃", "传送"], 
  },
  {
    name: "下路",
    playerSkills: ["闪现", "治疗", "点燃"],
  },
  {
    name: "辅助",
    playerSkills: ["闪现", "虚弱", "治疗","点燃"],
  },
];
const longClickInstance = window['vue-long-click'].longClickDirective({delay: 600, interval: 600})
Vue.directive('longclick', longClickInstance)
new Vue({
  el: "#app",
  data: {
    lineList: list,
    timer: null,
    summonerSkills: summonerSkills, 
    showSkillsDia: false,
    activeLine: null,
    summonerSkillSpeed: [],
    summonerSpeedList: [{ label: '星界洞悉', value: 18 }, { label: '明朗之靴', value: 12 }],
    popupVisible: false,   
    searchKey: "",   
    roles: "",
    heroList: [], 
    init:true,
  },
  created() {
    this.getHeroList();
    this.lineList = this.lineList.map((item) => {
      item.playerSkills = item.playerSkills.map((subitem) => {
        var skill = { canUse: 0, ...this.getSKillByName(subitem) };
        return skill;
      });
      return { heroDetail: null, mode: 1, skillSpeed: [], ...item };
    });
    this.summonerSkills = this.summonerSkills.map((item) => {
      return { select: false, ...item }; 
    });
    if (!this.timer) {
      this.timer = setInterval(this.clockTick, 1000);
    }
  },
  computed: {

    rolesHeroList: function () {
      return this.heroList.filter(item => {
        var rolesStr = item.roles.join(",")
        return rolesStr.indexOf(this.roles) >= 0 && item.keywords.indexOf(this.searchKey ? this.searchKey : "") >= 0
      })
    }
  },
  methods: {
    changeHeroSpeed: function (hero, num) {
      // console.log(hero); 
      var newSpeed = hero.spellSpeed + num;
      if (num == 10) {
        hero.spellSpeed = newSpeed
      } else {
        hero.spellSpeed = newSpeed < 0 ? 0 : newSpeed; 
      }
    },
    longClickSkillIcon:function(skill){
       this.$messagebox(skill.name,skill.description) 
    },
    changeGrade: function (skill, num) {
      var newGrade = skill.grade + num;
      if (num == 1) {
        skill.grade = newGrade >= skill.cooldown.length - 1 ? skill.cooldown.length - 1 : newGrade;
      } else {
        skill.grade = newGrade < 0 ? 0 : newGrade;
      }
    },
    clickHeroSkillIcon: function (line, skill) {
      if (skill.canUse == 0) {
        skill.canUse = this.getCDAfterSpeed(skill.cooldown ? skill.cooldown[skill.grade] : 0,line.heroDetail.spellSpeed);  
      } else {
        skill.canUse = skill.canUse - 10 >= 0 ? skill.canUse - 10 : 0;
      }
    },
    chooseHero: async function (hero) {
      this.popupVisible = false;
      this.$indicator.open('载入英雄数据中...');
      var { data } = await axios.get(`./data/${hero.heroId}.json`);
      this.$indicator.close();
      var title = data.hero.title;
      data.skins = data.skins.filter(item=>{
        return item.iconImg&&item.loadingImg  
      })
      var random = Math.floor(Math.random()*data.skins.length); 
      var skin = data.skins[random]; 
      // var icon = skin.iconImg;
      var icon = `//game.gtimg.cn/images/lol/act/img/champion/${data.hero.alias}.png`;
      var loadingImg = skin.loadingImg;
      var loadingImgStyleStr = `'url(${loadingImg})'`
      var spellSort = ["passive", "q", "w", "e", "r"]

      data.spells = data.spells.sort((a, b) => {
        return spellSort.indexOf(a.spellKey) - spellSort.indexOf(b.spellKey)
      });
      data.spells = data.spells.map(item => {
        if (item.cooldown && item.cooldown.length) {
          item.cooldown = item.cooldown.sort((a, b) => {
            return b - a;
          })
        }
        var canUse = 0;
        var grade = 0;
     
        return {canUse, grade, ...item }
      })
      var spellSpeed = 0; 
      this.activeLine.heroDetail = {spellSpeed,title, icon, loadingImg, loadingImgStyleStr, ...data };
    },
    getHeroList: async function () {
      var { data } = await axios.get("./data/hero_list.json");
      this.heroList = data.hero.map(item => {
        return { icon: `//game.gtimg.cn/images/lol/act/img/champion/${item.alias}.png`, ...item }
      });

    },
    resetAll: _.throttle(function () {
      this.lineList.forEach(line => {
        line.heroDetail =null; 
        line.playerSkills.forEach(skill => {
          skill.canUse = 0;
        })
      })
    }, 300),
    getSKillByName(name) {
      var arr = summonerSkills.filter((item) => {
        return item.name == name;
      });
      if (arr.length <= 0) {
        return {};
      }
      return arr.shift();
    },
    clickIcon(line, skill) {
      if (line.mode) {
        if (skill.canUse == 0) {
          skill.canUse = this.getCDAfterSpeed(skill.cd, line.skillSpeed.length ? line.skillSpeed.reduce((a, b) => a + b) : 0)
        } else {
          skill.canUse = skill.canUse - 10 >= 0 ? skill.canUse - 10 : 0;
        }
      } else {
        //mode 2 编辑技能
        line.playerSkills = line.playerSkills.filter((item) => {
          return item.name != skill.name;
        });
      }
    },
    clockTick() {
      this.lineList.forEach((item) => {
        item.playerSkills.forEach((subitem) => {
          if (subitem.canUse > 0) {
            subitem.canUse -= 1;
          } else {
            subitem.canUse = 0;
          }
        });
        if (!item.heroDetail) {
          return;
        }
        var spells = item.heroDetail.spells;

        spells.forEach(subitem => {
          if (subitem.canUse > 0) {
            subitem.canUse -= 1;
          } else {
            subitem.canUse = 0;
          }
        })
      });
    },
    deleteSkill(skills, skill) {
      console.log(skills, skill);
      skills = skills.filter((item) => {
        return item.name != skill.name;
      });
    },
    addSkills() {
      if (!this.activeLine) return;
      var lineSkills = this.activeLine.playerSkills;
      var lineSkillStrArr = lineSkills.map((item) => {
        return item.name;
      });
      var newSkills = this.summonerSkills.filter((item) => {
        return item.select && lineSkillStrArr.indexOf(item.name) < 0;
      });
      if (newSkills.length) {
        newSkills = newSkills.map((item) => {
          return { ...item, canUse: 0 };
        });
        this.activeLine.playerSkills = lineSkills.concat(newSkills);
      }
      console.log(newSkills);
      this.summonerSkills.forEach((item) => {
        item.select = false;
      });
      this.activeLine.mode = 1;
      this.activeLine = null;
      this.showSkillsDia = false;
    },
    getCDAfterSpeed(cd, num) {
      return parseInt(cd / (1 + num / 100));
    },
  },
});
new  Vue({
  el:"#initLoading",
  data:{
    init:true
  }
})