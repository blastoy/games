var MARGINS = { GOOD: 20, PERFECT: 10 }
var SCORES = { GOOD: 1, PERFECT: 2 }
var SPEEDS = { NORMAL: 2, FAST: 4 }

var gameWidth = 900
var gameHeight = 900

var cursors, up, down, left, right, boss1, scoreText, statusText

var score = 0
var perfectCounter = 1
var currentNoteIndx = 0
var speed = SPEEDS.NORMAL

new Phaser.Game({
  type: Phaser.AUTO,
  width: gameWidth,
  height: gameHeight,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  pixelArt: true
})

var map = {
  bpm: 1000,
  notes: [
    {
      time: 3000,
      key: 'UP'
    },
    {
      time: 3500,
      key: 'LEFT'
    },
    {
      time: 4000,
      key: 'RIGHT'
    },
    {
      time: 4500,
      key: 'DOWN'
    },
    {
      time: 5000,
      key: 'UP'
    },
    {
      time: 5000,
      key: 'DOWN'
    },
    {
      time: 6000,
      key: 'LEFT'
    },
    {
      time: 7000,
      key: 'RIGHT'
    }
  ]
}

function preload() {
  this.load.spritesheet('up', 'assets/images/up.png', { frameWidth: 32, frameHeight: 32 })
  this.load.spritesheet('down', 'assets/images/down.png', { frameWidth: 32, frameHeight: 32 })
  this.load.spritesheet('left', 'assets/images/left.png', { frameWidth: 32, frameHeight: 32 })
  this.load.spritesheet('right', 'assets/images/right.png', { frameWidth: 32, frameHeight: 32 })

  this.load.spritesheet('up-eat', 'assets/images/up-eat.png', { frameWidth: 32, frameHeight: 32 })
  this.load.spritesheet('down-eat', 'assets/images/down-eat.png', { frameWidth: 32, frameHeight: 32 })
  this.load.spritesheet('left-eat', 'assets/images/left-eat.png', { frameWidth: 32, frameHeight: 32 })
  this.load.spritesheet('right-eat', 'assets/images/right-eat.png', { frameWidth: 32, frameHeight: 32 })

  this.load.spritesheet('boss1', 'assets/images/boss1.png', { frameWidth: 50, frameHeight: 32 })

  updateNotes = updateNotes.bind(this)
  updateCursors = updateCursors.bind(this)
  onNoteConsume = onNoteConsume.bind(this)
  onNoteAttack = onNoteAttack.bind(this)
  onNoteUpdate = onNoteUpdate.bind(this)
  onNoteFail = onNoteFail.bind(this)
}

function create() {
  up = this.add.sprite(gameWidth/2, (gameHeight/2) - 50, 'up').setScale(2)
  down = this.add.sprite(gameWidth/2, (gameHeight/2) + 50, 'down').setScale(2)
  left = this.add.sprite((gameWidth/2) - 50, gameHeight/2, 'left').setScale(2)
  right = this.add.sprite((gameWidth/2) + 50, gameHeight/2, 'right').setScale(2)

  boss1 = this.add.sprite(100, 100, 'boss1').setScale(3)

  cursors = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE')

  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' })
  statusText = this.add.text(gameWidth - 16, 16, ' ', { fontSize: '32px', fill: '#fff', align: 'right' })
  statusText.setOrigin(1, 0)
}

function update () {
  updateNotes()
  updateCursors()
}

function updateNotes () {
  var note = map.notes[currentNoteIndx]
  var now = this.time.now

  if (!note || (now + map.bpm) < note.time) return // no note to fire

  switch (note.key) {
    case 'UP':
      this.tweens.add({
        targets: this.add.sprite(gameWidth/2, -32, 'up').setScale(2),
        x: up.x,
        y: up.y + MARGINS.GOOD,
        duration: note.time - now,
        onComplete: onNoteFail,
        onUpdate: onNoteUpdate
      })
      break

    case 'DOWN':
      this.tweens.add({
        targets: this.add.sprite(gameWidth/2, gameHeight + 32, 'down').setScale(2),
        x: down.x,
        y: down.y - MARGINS.GOOD,
        duration: note.time - now,
        onComplete: onNoteFail,
        onUpdate: onNoteUpdate
      })
      break

    case 'LEFT':
      this.tweens.add({
        targets: this.add.sprite(-32, gameHeight/2, 'left').setScale(2),
        x: left.x + MARGINS.GOOD,
        y: left.y,
        duration: note.time - now,
        onComplete: onNoteFail,
        onUpdate: onNoteUpdate
      })
      break

    case 'RIGHT':
      this.tweens.add({
        targets: this.add.sprite(gameWidth + 32, gameHeight/2, 'right').setScale(2),
        x: right.x - MARGINS.GOOD,
        y: right.y,
        duration: note.time - now,
        onComplete: onNoteFail,
        onUpdate: onNoteUpdate
      })
      break
  }

  currentNoteIndx++
}

function updateCursors () {
  if (cursors.UP.isDown) up.setTexture('up-eat')
  else up.setTexture('up')

  if (cursors.DOWN.isDown) down.setTexture('down-eat')
  else down.setTexture('down')

  if (cursors.LEFT.isDown) left.setTexture('left-eat')
  else left.setTexture('left')

  if (cursors.RIGHT.isDown) right.setTexture('right-eat')
  else right.setTexture('right')

  // if (cursors.W.isDown) Phaser.Actions.Call(player.getChildren(), function(n) { n.y -= speed })
  // if (cursors.A.isDown) Phaser.Actions.Call(player.getChildren(), function(n) { n.x -= speed })
  // if (cursors.S.isDown) Phaser.Actions.Call(player.getChildren(), function(n) { n.y += speed })
  // if (cursors.D.isDown) Phaser.Actions.Call(player.getChildren(), function(n) { n.x += speed })

  speed = cursors.SPACE.isDown ? SPEEDS.FAST : SPEEDS.NORMAL
}

function onNoteUpdate (tween, sprite) {
  var shouldEatNote = false
  var delta = Math.INFINITY

  switch (sprite.texture.key) {
    case 'up':
      delta = Math.abs(sprite.y - (tween.data[1].end - MARGINS.GOOD))
      shouldEatNote = (delta < MARGINS.GOOD) && cursors.UP.isDown && sprite.active
      break

    case 'down':
      delta = Math.abs(sprite.y - (tween.data[1].end + MARGINS.GOOD))
      shouldEatNote = (delta < MARGINS.GOOD) && cursors.DOWN.isDown && sprite.active
      break

    case 'left':
      delta = Math.abs(sprite.x - (tween.data[0].end - MARGINS.GOOD))
      shouldEatNote = (delta < MARGINS.GOOD) && cursors.LEFT.isDown && sprite.active
      break

    case 'right':
      delta = Math.abs(sprite.x - (tween.data[0].end + MARGINS.GOOD))
      shouldEatNote = (delta < MARGINS.GOOD) && cursors.RIGHT.isDown && sprite.active
      break
  }

  var scoreType = delta < MARGINS.PERFECT ? SCORES.PERFECT : SCORES.GOOD

  if (shouldEatNote) {
    onNoteAttack(sprite, scoreType)
    onNoteConsume(tween, sprite, scoreType)
  }
}

function onNoteFail (tween, sprites) {
  statusText.setText('MISS')
  perfectCounter = 1

  this.tweens.add({
    targets: sprites,
    x: gameWidth/2,
    y: gameHeight/2,
    alpha: 0,
    duration: 1000,
    onComplete: function (tween, sprites) {
      sprites[0].destroy()
    }
  })
}

function onNoteAttack (sprite, scoreType) {
  var graphic, shape

  switch (sprite.texture.key) {
    case 'up':
      shape = new Phaser.Geom.Rectangle(gameWidth/2 - 32, 0, 64, gameHeight/2)
      graphic = this.add.graphics({ fillStyle: { color: 0xff0000, alpha: 0.5 } })
      break

    case 'down':
      shape = new Phaser.Geom.Rectangle(gameWidth/2 - 32, gameHeight/2, 64, gameHeight/2)
      graphic = this.add.graphics({ fillStyle: { color: 0x0000ff, alpha: 0.5 } })
      break

    case 'left':
      shape = new Phaser.Geom.Rectangle(0, gameHeight/2 - 32, gameWidth/2, 64)
      graphic = this.add.graphics({ fillStyle: { color: 0x00ff00, alpha: 0.5 } })
      break

    case 'right':
      shape = new Phaser.Geom.Rectangle(gameWidth/2, gameHeight/2 - 32, gameWidth/2, 64)
      graphic = this.add.graphics({ fillStyle: { color: 0xff00ff, alpha: 0.5 } })
      break
  }

  graphic.fillRectShape(shape)

  this.tweens.add({
    targets: graphic,
    alpha: 0,
    duration: 200,
    onComplete: function (tween, graphics) {
      graphics[0].destroy()
    }
  })
}

function onNoteConsume (tween, sprite, scoreType) {
  switch (scoreType) {
    case SCORES.PERFECT:
      score += (25 * perfectCounter)
      scoreText.setText('Score: ' + score + ' (x' + perfectCounter + ')')
      perfectCounter++

      var targetX = statusText.x
      statusText.alpha = 0
      statusText.x = targetX - 30
      statusText.setText('PERFECT!!')

      this.tweens.add({
        targets: statusText,
        x: targetX,
        duration: 100,
        alpha: 1
      })
      break

    case SCORES.GOOD:
      score += 10
      scoreText.setText('Score: ' + score)
      perfectCounter = 1

      statusText.setText('GOOD!')
      break
  }

  tween.stop()
  sprite.destroy()
}
