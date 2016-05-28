import 'pixi';
import 'p2';
import Phaser from 'phaser';

import MainState from './states/main';
import {DEFAULT_WIDTH, DEFAULT_HEIGHT} from './utils/constants';

class Game extends Phaser.Game {
  constructor() {
    super(DEFAULT_WIDTH, DEFAULT_HEIGHT, Phaser.AUTO, 'mountpoint', null);

    this.state.add('Main', MainState, false);
    this.state.start('Main');
  }
}

window.game = new Game();
