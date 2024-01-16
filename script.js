var blockdata = [
  { selector: ".block1", name: "1", pitch: "1" },
  { selector: ".block2", name: "2", pitch: "2" },
  { selector: ".block3", name: "3", pitch: "3" },
  { selector: ".block4", name: "4", pitch: "4" }
]

var setdata = [
  {name: "correct", sets: [1,3,5,8] },
  {name: "wrong", sets: [2,4,5.5,7] }
]



//------------------------
//         Block
//------------------------

var Block = function (blockData, setData) {
  this.allOn = false
  this.blocks = blockData.map((block, i) => ({
    name: block.name,
    $el: block.selector,
    audio: this.getAudio(block.pitch)
  }))
  this.soundSets = setData.map((set,i)=>({
    name: set.name,
    sets: set.sets.map((sound)=>this.getAudio(sound))
  }))
}

Block.prototype.flash=function(note){
  let block = this.blocks.find(d=>d.name==note)
  if (block){
    block.audio.currentTime=0
    block.audio.play()
    $(block.$el).addClass("active")
    setTimeout(()=>{
      if (this.allOn==false){
        $(block.$el).removeClass("active")
      }
    },100)
  }
}

Block.prototype.turnAllon = function () {
  this.allOn = true
  this.blocks.forEach((block)=>{
    $(block.$el).addClass("active")
  })
}

Block.prototype.turnAlloff = function () {
  this.allOn = false
  this.blocks.forEach((block)=>{
    $(block.$el).removeClass("active")
  })
}


Block.prototype.getAudio = function (pitch) {
  var audio = new Audio(
    "https://awiclass.monoame.com/pianosound/set/" + pitch + ".wav"
  )
  return audio
}

Block.prototype.playSet = function (type) {
  let choose = this.soundSets.find(d=>d.name == type)
  if (choose){
      choose.sets.forEach((set)=>{
      set.currentTime=0
      set.play()
    })
  }
  
}


//------------------------
//         Game
//------------------------
var Game = function () {
  $(".block").addClass("disable")
  this.blocks = new Block(blockdata, setdata)
  this.currentLevel = 0
  this.playInterval = 400
  this.mode = "waiting"
  // this.levels = [
  //   "1234",
  //   "12324",
  //   "231234",
  //   "41233412",
  //   "41323134132",
  //   "2342341231231423414232"
  // ]
  let _this = this
  $.ajax({
    url: "https://2017.awiclass.monoame.com/api/demo/memorygame/leveldata",
    success: function(res){
      _this.levels = res
    }
  })
}

Game.prototype.playNote = function (note) {
  this.blocks.flash(note)
}


Game.prototype.startLevel = function () {
  $(".block").addClass("disable")
  this.startGame(this.levels[this.currentLevel])
  var level = this.currentLevel + 1
  this.showMessage("Level "+ level)
}


Game.prototype.startGame = function (answer) {
  this.answer = answer
  this.mode = "gamePlay"
  this.showStatus("")
  var note = this.answer.split("")
  let _this = this
  console.log(note)
  this.timer = setInterval(function(){
    let char = note.shift()
    _this.playNote(char)
    console.log(char)
    if ( !note.length ){
      clearInterval(_this.timer)
      _this.startUserInput()
    }
  },this.playInterval)
}

Game.prototype.showMessage = function (message) {
  $(".levelShow").html("")
  $(".levelShow").html(message)
}




Game.prototype.startUserInput = function () {
  $(".block").removeClass("disable")
  this.userInput = ""
  this.mode = "userInput"
  this.showMessage("It's your turn. ")
}

Game.prototype.userSendInput = function (inputChar) {
  if (this.mode == "userInput"){
    var tempString = this.userInput + inputChar
    this.playNote(inputChar)
    this.showStatus(tempString)
    if (this.answer.indexOf(tempString)==0){
      this.userInput += inputChar
      tempString = 0
      console.log("good")
      if (this.answer == this.userInput){
        console.log("right")
        this.currentLevel += 1
        this.mode = "waiting"
        setTimeout(()=>{
          this.startLevel()
        },1000)
      }
    }else{
      this.currentLevel = 0
      this.mode = "reset"
      setTimeout(()=>{
        this.startLevel()
      },1000)
    }
  }
}

Game.prototype.showStatus = function (tempString) {
  $(".satus").html("")
  var answer = this.answer.split("")
  answer.forEach((ans,i)=>{
    var circle =$("<div class='circle'></div>")
    if ( i < tempString.length ){
      circle.addClass("fullcircle")
    }
    $(".satus").append(circle)
  })
  if (this.answer == tempString ){
    setTimeout(()=>{
      this.showMessage("Correct!!")
      $(".circle").addClass("correct")
      this.blocks.turnAllon()
      this.blocks.playSet("correct")
    },500)
  }else{
    $(".circle").removeClass("correct")
  }
  if (tempString ==""){
    this.blocks.turnAlloff()
  }
  if (this.answer.indexOf(tempString) != 0){
    setTimeout(()=>{
      this.showMessage("Wrong.")
      $(".circle").addClass("wrong")
      this.blocks.turnAllon()
      this.blocks.playSet("wrong")
    },500)
  }else{
    $(".circle").removeClass("wrong")
  }
  
}

var game = new Game()
setTimeout(function(){
  game.startLevel()
},1000)