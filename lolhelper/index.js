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
    cd: 210,
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
    cd: 180,
    icon: "./imgs/SummonerHaste.png",
  },
  {
    name: "治疗",
    cd: 240,
    icon: "./imgs/SummonerHeal.png",
  },
  {
    name: "清晰",
    cd: 10,
    icon: "./imgs/SummonerMana.png",
  },
  {
    name: "护驾",
    cd: 10,
    icon: "./imgs/SummonerPoroRecall.png",
  },
  {
    name: "魄罗投掷",
    cd: 10,
    icon: "./imgs/SummonerPoroThrow.png",
  },
  {
    name: "惩戒",
    cd: 75,
    icon: "./imgs/SummonerSmite.png",
  },
  {
    name: "标记",
    cd: 10,
    icon: "./imgs/SummonerSnowball.png",
  },
  {
    name: "传送",
    cd: 300,
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
    playerSkills: ["闪现", "治疗", "虚弱"],
  },
];

new Vue({
  el: "#app",
  data: {
    lineList: list,
    timer: null,
    summonerSkills: summonerSkills,
    showSkillsDia: false,
    activeLine: null,
    summonerSkillSpeed:18
  },
  created() {
    this.lineList = this.lineList.map((item) => {
      item.playerSkills = item.playerSkills.map((subitem) => {
        var skill = { canUse: 0, ...this.getSKillByName(subitem) };
        return skill;
      });
    //   item.mode = 1;
    //   item.skillSpeed = "";
      return {mode:1,skillSpeed:"",...item}; 
    });
    this.summonerSkills = this.summonerSkills.map((item) => {
      return { select: false, ...item };
    });
    if (!this.timer) {
      this.timer = setInterval(this.clockTick, 1000);
    }
  },
  methods: {
    resetAll:_.throttle(function(){
        this.lineList.forEach(line=>{
            line.playerSkills.forEach(skill=>{
                skill.canUse = 0; 
            })
        })
    },300), 
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
        //mode 1 显示cd
        if (skill.canUse == 0) {
          if (line.skillSpeed) {  
            // console.log(this.getCDAfterSpeed());
            skill.canUse = this.getCDAfterSpeed(skill.cd,this.summonerSkillSpeed)
          } else {
            skill.canUse = skill.cd;
          }
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
      this.showSkillsDia =false;
    },
    getCDAfterSpeed(cd, num) {
      return parseInt(cd / (1 + num / 100));
    },
  },
});
