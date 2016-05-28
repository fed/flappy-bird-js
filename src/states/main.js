import Phaser from 'phaser';

export default class Main extends Phaser.State {
  preload() {
    this.game.load.image('bird', 'assets/bird.png');
    this.game.load.image('pipe', 'assets/pipe.png');
    this.game.load.audio('jump', 'assets/jump.wav');
  }

  create() {
    this.game.stage.backgroundColor = '#71c5cf';
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    // Bind physics to the bird
    this.bird = this.game.add.sprite(100, 245, 'bird');
    this.game.physics.arcade.enable(this.bird);
    this.bird.body.gravity.y = 1000;

    // Call the jump function when tapping on the screen or hitting the space key
    this.input.onDown.add(this.jump, this);
    this.game.input
      .keyboard.addKey(Phaser.Keyboard.SPACEBAR)
      .onDown.add(this.jump, this);

    this.pipes = this.game.add.group();
    this.timer = this.game.time.events.loop(1500, this.addRowOfPipes, this);

    // Keep track of score on the upper left corner
    this.score = 0;
    this.labelScore = this.game.add.text(20, 20, "0", {
      font: "30px Arial",
      fill: "#fff"
    });

    this.bird.anchor.setTo(-0.2, 0.5);

    this.jumpSound = this.game.add.audio('jump');

    if (!this.game.device.desktop) {
      // Set the scaling mode to SHOW_ALL to show all the game
      this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

      // Set a minimum and maximum size for the game
      // Here the minimum is half the game size
      // And the maximum is the original game size
      this.game.scale.setMinMax(
        this.game.width * 0.5,
        this.game.height * 0.5,
        this.game.width,
        this.game.height
      );

      // Center the game horizontally and vertically
      this.game.scale.pageAlignHorizontally = true;
      this.game.scale.pageAlignVertically = true;
    }
  }

  /**
   * This function contains the game logic.
   * It gets called 60 times per second.
   */
  update() {
    // Restart the game if the bird is off the screen limits
    if (this.bird.y < 0 || this.bird.y > 490) {
      this.restartGame();
    }

    // Restart the game on collision detection
    this.game.physics.arcade.overlap(
      this.bird,
      this.pipes,
      this.hitPipe,
      null,
      this
    );

    if (this.bird.angle < 20) {
      this.bird.angle += 1;
    }
  }

  jump() {
    if (!this.bird.alive) {
      return;
    }

    // Actual jump
    this.bird.body.velocity.y = -350;

    // Animate the bird when it jumps
    this.game.add.tween(this.bird)
      .to({angle: -20}, 100)
      .start();

    this.jumpSound.play();
  }

  restartGame() {
    this.game.state.start('Main');
  }

  addOnePipe(x, y) {
    // Create a pipe at the position x and y
    let pipe = this.game.add.sprite(x, y, 'pipe');

    // Add the pipe to our previously created group
    this.pipes.add(pipe);

    // Enable physics on the pipe
    this.game.physics.arcade.enable(pipe);

    // Add velocity to the pipe to make it move left
    pipe.body.velocity.x = -200;

    // Automatically kill the pipe when it's no longer visible
    pipe.checkWorldBounds = true;
    pipe.outOfBoundsKill = true;
  }

  addRowOfPipes() {
    // Increase the score by 1 every time a new row of pipes gets created
    this.score++;
    this.labelScore.text = this.score;

    // Randomly pick a number between 1 and 5
    // This will be the hole position
    let hole = Math.floor(Math.random() * 5) + 1;

    // Add the 6 pipes
    // With one big hole at position 'hole' and 'hole + 1'
    for (let i = 0; i < 8; i++) {
      if (i != hole && i != hole + 1) {
        this.addOnePipe(400, i * 60 + 10);
      }
    }
  }

  hitPipe() {
    // If the bird has already hit a pipe, do nothing
    // It means the bird is already falling off the screen
    if (!this.bird.alive) {
      return;
    }

    this.bird.alive = false;

    // Prevent new pipes from appearing
    this.game.time.events.remove(this.timer);

    // Go through all the pipes, and stop their movement
    this.pipes.forEach((p) => {
      p.body.velocity.x = 0;
    });
  }
}
