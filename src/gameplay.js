class Gameplay extends Phaser.Scene {
  constructor() {
    super("gameplay");
    this.gameStarted = false;
    this.nearBy = 4;
    this.levelLocked = [false, true, true];
    this.maxLevel = 3;
    this.unlockedLevel = 1;

    // Resources
    this.resource = 5000;
    this.resourceTo = 5000;
    this.resourceMap = [300, 350]; // 200 pts for level 1 tanks, 250 for level 2 tanks

    // Health
    this.health = 2000;
    this.healthTo = 2000;
    this.healthConstOnTankObjectiveReached = 300;
    this.healthCostOnTowerDestroyed = 200;

    /** Bullet configs */
    this.listBullets = [];

    /** Tanks configs */
    this.listTanks = [];
    this.maxTank = [3, 6, 8];
    this.maxWave = [3, 4, 5];
    this.currentWave = 1;
    this.tankDestroyed = 0;
    this.tankspawned = 0;
    this.tankShootDelay = [800, 650, 500];
    this.tankSpeed = [1, 1.1, 1.2];

    // Paths setup
    this.pathsX = [];
    this.pathsY = [];
    // Level 1
    this.pathsX[0] = [];
    this.pathsX[0][1] = [1, 1, 8, 8, 16, 16, 19];
    this.pathsX[0][2] = [1, 3, 3, 7, 8, 15, 16, 17, 19];
    this.pathsX[0][3] = [1, 3, 3, 7, 8, 15, 16, 17, 19];

    this.pathsY[0] = [];
    this.pathsY[0][1] = [0, 5, 5, 2, 2, 8, 8];
    this.pathsY[0][2] = [11, 11, 9, 9, 10, 10, 9, 8, 8];
    this.pathsY[0][3] = [11, 11, 9, 9, 10, 10, 9, 8, 8];

    // Level 2
    this.pathsX[1] = [];
    this.pathsY[1] = [];

    this.pathsX[1][1] = [0, 6, 7, 7, 10, 11, 11, 19];
    this.pathsY[1][1] = [3, 3, 4, 5, 5, 6, 7, 7];

    this.pathsX[1][2] = [0, 7, 8, 10, 11, 11, 19];
    this.pathsY[1][2] = [10, 10, 9, 9, 8, 7, 7];

    this.pathsX[1][3] = [0, 7, 8, 10, 11, 11, 19];
    this.pathsY[1][3] = [10, 10, 9, 9, 8, 7, 7];

    this.pathsX[1][4] = [0, 6, 7, 7, 10, 11, 11, 19];
    this.pathsY[1][4] = [3, 3, 4, 5, 5, 6, 7, 7];

    // Level 3
    this.pathsX[2] = [];
    this.pathsY[2] = [];
    this.pathsX[2][1] = [0, 2, 3, 3, 12, 12, 13, 19];
    this.pathsY[2][1] = [6, 6, 5, 2, 2, 5, 6, 6];

    this.pathsX[2][2] = [0, 2, 3, 3, 12, 12, 13, 19];
    this.pathsY[2][2] = [6, 6, 7, 10, 10, 7, 6, 6];

    this.pathsX[2][3] = [0, 2, 3, 3, 12, 12, 13, 19];
    this.pathsY[2][3] = [6, 6, 5, 2, 2, 5, 6, 6];

    this.pathsX[2][4] = [0, 2, 3, 3, 12, 12, 13, 19];
    this.pathsY[2][4] = [6, 6, 7, 10, 10, 7, 6, 6];

    this.pathsX[2][5] = [0, 2, 3, 3, 12, 12, 13, 19];
    this.pathsY[2][5] = [6, 6, 7, 10, 10, 7, 6, 6];

    // Tank objective per level
    this.tankObjectiveX = [19, 19, 19];
    this.tankObjectiveY = [8, 7, 6];
    this.tankSpawnDelay = 1500;

    /**  Tower configs */
    this.listTowers = [];
    this.towerShootDelay = [800, 650, 500];

    // Defensive positions
    this.defPositionsX = [];
    this.defPositionsY = [];
    // Level 1
    this.defPositionsX[0] = [1, 3, 4, 7, 10, 14, 14, 18, 18];
    this.defPositionsY[0] = [7, 2, 7, 7, 4, 4, 8, 6, 10];
    // Level 2
    this.defPositionsX[1] = [1, 1, 5, 5, 12, 12, 17, 17];
    this.defPositionsY[1] = [5, 8, 5, 8, 5, 9, 5, 9];
    // Level 3
    this.defPositionsX[2] = [5, 5, 10, 10];
    this.defPositionsY[2] = [4, 8, 4, 8];

    this.listDefPositions = [];

    // Available towers
    this.listAvailableTowerTypes = [];
    this.totalTowerType = 3;
    this.towerSprites = [249, 250, 252];
    this.costByTowerType = [400, 600, 2000];

    // Animation list
    this.lisAnimationScale = [];
    this.listAnimationTravel = [];
    this.lisAnimationAlpha = [];
  }

  /** Animation functions */
  animateScale(obj, scaleFrom, scaleTo, speed) {
    if (scaleFrom !== scaleTo) {
      obj.isScaling = true;
      obj.scale = scaleFrom;
      obj.scaleTo = scaleTo;
      obj.scaleSpeed = speed;
      this.lisAnimationScale.push(obj);
    }
  }

  updateScaleAnimations() {
    for (var i = this.lisAnimationScale.length - 1; i >= 0; i--) {
      /**@type Tower */
      var obj = this.lisAnimationScale[i];
      if (obj.isScaling) {
        if (obj.turn === undefined) {
          obj.scale += obj.scaleSpeed * (obj.scaleTo * 1.2 - obj.scale);
          if (Math.abs(obj.scale - obj.scaleTo * 1.2) <= 0.05) {
            obj.turn = 2;
          }
        } else {
          obj.scale += obj.scaleSpeed * (obj.scaleTo - obj.scale);
          if (Math.abs(obj.scale - obj.scaleTo) <= 0.05) {
            obj.isScaling = false;
            obj.scale = obj.scaleTo;
          }
        }
      } else {
        this.lisAnimationScale.splice(i, 1);
      }
    }
  }

  animateAlpha(obj, alphaFrom, alphaTo, speed) {
    if (alphaFrom !== alphaTo) {
      obj.isAlphaMoving = true;
      obj.alpha = alphaFrom;
      obj.alphaTo = alphaTo;
      obj.alphaSpeed = speed;
      this.lisAnimationAlpha.push(obj);
    }
  }

  updateAphaAnimations() {
    for (var i = this.lisAnimationAlpha.length - 1; i >= 0; i--) {
      /**@type Tower */
      var obj = this.lisAnimationAlpha[i];

      if (obj.isAlphaMoving) {
        obj.alpha += obj.alphaSpeed * (obj.alphaTo - obj.alpha);
        if (Math.abs(obj.alpha - obj.alphaTo) <= 0.0001) {
          obj.alpha = obj.alphaTo;
          obj.isAlphaMoving = false;
        }
      } else {
        this.lisAnimationAlpha.splice(i, 1);
      }
    }
  }

  animateTravel(obj, fromX, fromY, toX, toY, speed) {
    if (fromX !== toX || fromY !== toY) {
      obj.isTravelingX = true;
      obj.isTravelingY = true;
      obj.x = fromX;
      obj.y = fromY;
      obj.travelToX = toX;
      obj.travelToY = toY;
      obj.travelSpeed = speed;
      this.listAnimationTravel.push(obj);
    }
  }

  updateTravelAnimations() {
    for (var i = this.listAnimationTravel.length - 1; i >= 0; i--) {
      /**@type Tower */
      var obj = this.listAnimationTravel[i];
      if (obj.isTravelingX) {
        obj.x += obj.travelSpeed * (obj.travelToX - obj.x);
        if (Math.abs(obj.travelToX - obj.x) <= this.nearBy) {
          obj.x = obj.travelToX;
          obj.isTravelingX = false;
        }
      }
      if (obj.isTravelingY) {
        obj.y += obj.travelSpeed * (obj.travelToY - obj.y);
        if (Math.abs(obj.travelToY - obj.y) <= this.nearBy) {
          obj.y = obj.travelToY;
          obj.isTravelingY = false;
        }
      }
      if (obj.isTravelingX === false && obj.isTravelingY === false) {
        this.listAnimationTravel.splice(i, 1);
      }
    }
  }

  /** Bullet functions */

  shoot(pX, pY, pVx, pVy, pAngle, pType, pTarget) {
    this.sfxShoot.play();
    var bullet = new Bullet(this, pX, pY, pVx, pVy, pAngle, pType, pTarget);
    this.listBullets.push(bullet);
  }

  updateBullets() {
    for (var b = this.listBullets.length - 1; b >= 0; b--) {
      /**@type Bullet */
      var bullet = this.listBullets[b];
      if (bullet.targetType === "tower") {
        for (var t = 0; t < this.listTowers.length; t++) {
          /**@type Tower */
          var tower = this.listTowers[t];
          if (
            isOverlaping(
              tower.x,
              tower.y,
              tower.width / 2,
              tower.height / 2,
              bullet.x,
              bullet.y,
              bullet.width / 2,
              bullet.height / 2
            )
          ) {
            bullet.delete();
            tower.hurt(1);
          }
        }
      } else if (bullet.targetType === "tank") {
        for (var t = 0; t < this.listTanks.length; t++) {
          /**@typ Tank */
          var tank = this.listTanks[t];
          if (
            isOverlaping(
              tank.x,
              tank.y,
              tank.width / 2,
              tank.height / 2,
              bullet.x,
              bullet.y,
              bullet.width / 2,
              bullet.height / 2
            )
          ) {
            if (bullet.type === 4) {
              var timeToDestroy = 150;
              for (var k = t - 1; k >= 0; k--) {
                /**@type Tank */
                var ta = this.listTanks[k];
                ta.timerToDieIsEnabled = true;
                ta.timerToDie = timeToDestroy;
                timeToDestroy += 100;
              }
              timeToDestroy = 150;
              for (var k = t + 1; k < this.listTanks.length; k++) {
                var ta = this.listTanks[k];
                ta.timerToDieIsEnabled = true;
                ta.timerToDie = timeToDestroy;
                timeToDestroy += 100;
              }
              tank.delete();
              bullet.delete();

              break;
            } else {
              tank.hurt(1);
              bullet.delete();
            }
          }
        }
      }

      bullet.update();

      if (bullet.isDestroyed) {
        this.listBullets.splice(b, 1);
      }
    }
  }

  /**Tower functions */

  spawnTower(pX, pY, pType, pPosID) {
    var tow = new Tower(this, pX, pY, pType);
    tow.posID = pPosID;
    this.listTowers.push(tow);
    return tow;
  }
  showAvailableTowerTypes() {
    var x = 200;
    var y = 395;
    for (var i = 0; i < this.totalTowerType; i++) {
      var tow = this.add.sprite(
        x + 64 * i,
        y,
        "tilesheet",
        this.towerSprites[i]
      );
      tow.depth = 2;

      tow.base = this.add.sprite(tow.x, tow.y, "tilesheet", 181);
      tow.base.setScale(1.3, 1.3);

      tow.cost = this.add.text(
        tow.x - config.tileSize / 2,
        tow.y + 15,
        this.costByTowerType[i],
        {
          fontSize: 14,
          align: "center",
        }
      );
      tow.cost.depth = 3;

      tow.clicked = false;
      tow.type = i;
      tow.initX = tow.x;
      tow.initY = tow.y;
      tow.setInteractive();

      if (tow.type === this.totalTowerType - 1) {
        tow.alpha = 0.3;
        tow.scale = 0.8;
        tow.base.scale = 1.1;
      }

      this.listAvailableTowerTypes.push(tow);
    }
  }

  ShowDefPosition(pX, pY) {
    var pos = this.add.sprite(pX, pY, "tilesheet", 180);
    pos.occupied = false;
    pos.tower = null;
    this.listDefPositions.push(pos);
  }

  updateTowers(dt) {
    // Look for tanks to shoot at
    for (var t = this.listTowers.length - 1; t >= 0; t--) {
      var tower = this.listTowers[t];
      tower.timer -= dt;

      var dist = config.width * 5;
      var targetX = -1;
      var targetY = -1;

      // Look for the nearest tank to shoot at
      for (var i = 0; i < this.listTanks.length; i++) {
        var tank = this.listTanks[i];
        var curDist = processDistance(tank.x, tank.y, tower.x, tower.y);
        if (curDist <= tower.range) {
          if (dist > curDist) {
            dist = curDist;
            targetX = tank.x;
            targetY = tank.y;
          }
        }
      }

      // Shoot at the nearest tank found
      if (targetX > 0 && targetY > 0) {
        if (tower.timer <= 0) {
          var angle = processAngle(tower.x, tower.y, targetX, targetY);
          var vx = 10 * Math.cos(angle);
          var vy = 10 * Math.sin(angle);
          var ang = angle * (180 / Math.PI);
          tower.angle = ang + 90;
          tower.timer = this.towerShootDelay[tower.type];
          var bulletType = 0;
          if (tower.type == 0) {
            bulletType = 2;
          } else if (tower.type == 1) {
            bulletType = 3;
          }
          if (tower.mode === "super") {
            tower.mode = "normal";
            this.animateScale(tower, tower.scale, tower.scale - 0.2, 0.15);
            this.animateScale(
              tower.base,
              tower.base.scale,
              tower.base.scale - 0.2,
              0.15
            );

            bulletType = 4;
          }
          this.shoot(
            tower.x + 15 * Math.cos(angle),
            tower.y + 15 * Math.sin(angle),
            vx,
            vy,
            ang + 90,
            bulletType,
            "tank"
          );
        }
      } else {
        tower.angle = 0;
      }

      if (tower.isDestroyed) {
        var pos = this.listDefPositions[tower.posID];
        pos.occupied = false;
        this.animateAlpha(pos, pos.alpha, 1, 0.04);
        this.listTowers.splice(t, 1);
        if (this.listTowers.length <= 0) {
          for (var i = 0; i < this.listAvailableTowerTypes.length; i++) {
            var tt = this.listAvailableTowerTypes[i];
            if (tt.type === this.totalTowerType - 1) {
              this.animateAlpha(tt, tt.alpha, 0.3, 0.1);
              this.animateScale(tt, tt.scale, 0.8, 0.15);
              this.animateScale(tt.base, tt.base.scale, 1.1, 0.15);
            }
          }
        }
      }
    }
  }

  /** Tank functions */
  spawnTank(pX, pY, pType) {
    if (this.levelFailed === false) {
      var tank = new Tank(this, pX, pY, pType);
      this.animateScale(tank, 0.1, 1.1, 0.1);
      this.animateScale(tank.turret, 0.1, 1.1, 0.1);
      this.listTanks.push(tank);
      this.tankspawned++;
    }
  }

  startNextWave() {
    var lev = 0;
    if (this.currentLevel >= 2) {
      lev = (this.currentWave + 1) % 2;
    }
    if (this.tankspawned < this.maxTank[this.currentLevel - 1]) {
      this.spawnTank(
        this.pathsX[this.currentLevel - 1][this.currentWave][0] *
          config.tileSize +
          config.tileSize / 2,
        this.pathsY[this.currentLevel - 1][this.currentWave][0] *
          config.tileSize +
          config.tileSize / 2,
        lev
      );

      this.waveText.text =
        "Vague " + this.currentWave + "/" + this.maxWave[this.currentLevel - 1];
    } else {
      clearInterval(this.spawnTimerID);
      // console.log("Wave ", this.currentWave, " ended");
    }
  }

  updateTanks(dt) {
    for (var i = this.listTanks.length - 1; i >= 0; i--) {
      /** @type  Tank */
      var tank = this.listTanks[i];
      var dist = config.width * 5;
      var targetX = -1;
      var targetY = -1;
      tank.timer -= dt;

      // Look for the nearest tower to shoot at
      for (var t = 0; t < this.listTowers.length; t++) {
        var tower = this.listTowers[t];
        var curDist = processDistance(tower.x, tower.y, tank.x, tank.y);
        if (curDist <= tank.range) {
          if (dist > curDist) {
            dist = curDist;
            targetX = tower.x;
            targetY = tower.y;
          }
        }
      }

      // Shoot at the nearest tower found
      if (targetX > 0 && targetY > 0) {
        if (tank.timer <= 0) {
          var angle = processAngle(tank.x, tank.y, targetX, targetY);
          var vx = 10 * Math.cos(angle);
          var vy = 10 * Math.sin(angle);
          var ang = angle * (180 / Math.PI);
          tank.turret.angle = ang;
          tank.timer = this.tankShootDelay[tank.type];
          this.shoot(
            tank.turret.x + 20 * Math.cos(angle),
            tank.turret.y + 20 * Math.sin(angle),
            vx,
            vy,
            ang + 90,
            0,
            "tower"
          );
        }
      } else {
        tank.turret.angle = tank.angle;
      }

      // Got the next waypoint
      var nextX =
        this.pathsX[this.currentLevel - 1][this.currentWave][tank.nextPoint] *
          config.tileSize +
        config.tileSize / 2;
      var nextY =
        this.pathsY[this.currentLevel - 1][this.currentWave][tank.nextPoint] *
          config.tileSize +
        config.tileSize / 2;
      var dist = processDistance(tank.x, tank.y, nextX, nextY);
      var angle = processAngle(tank.x, tank.y, nextX, nextY);

      // Check if the next waypoint is far enought for the tank to move to it
      if (dist > this.nearBy) {
        // Set the tank rotation angle if its the very first waypoint
        var targetDeg = angle * (180 / Math.PI);
        if (tank.nextPoint === 1) tank.angle = targetDeg;
        else {
          if (tank.angle < targetDeg) tank.angle += 3;
          else if (tank.angle > targetDeg) tank.angle -= 3;
          if (Math.abs(tank.angle - targetDeg) < 5) tank.angle = targetDeg;
        }

        // Set the tank velocity in order to reach the waypoint
        tank.vx = this.tankSpeed[this.currentLevel - 1] * Math.cos(angle);
        tank.vy = this.tankSpeed[this.currentLevel - 1] * Math.sin(angle);
      } else {
        // Stop the tank when it reached a waypoint

        if (isNaN(nextX) === false && isNaN(nextX) === false) {
          tank.x = nextX;
          tank.y = nextY;
        }

        // Update the next waypoint
        if (
          tank.nextPoint <
          this.pathsX[this.currentLevel - 1][this.currentWave].length
        )
          tank.nextPoint++;

        // Check if the tank reached the objective
        if (
          getCell(tank.x) === this.tankObjectiveX[this.currentLevel - 1] &&
          getCell(tank.y) === this.tankObjectiveY[this.currentLevel - 1]
        ) {
          //console.log("Objective reached");
          tank.reachedObjective = true;
          tank.delete();
          this.costHealth(this.healthConstOnTankObjectiveReached);
        }
      }
      tank.update(dt);

      if (tank.timerToDieIsEnabled) {
        tank.timerToDie -= dt;
        if (tank.timerToDie <= 0) tank.delete();
      }
      if (tank.isDestroyed) {
        // Remove destroyed tanks from the tank list
        this.listTanks.splice(i, 1);
        this.tankDestroyed++;
        // console.log(
        //   "Destroyed ",
        //   this.tankDestroyed,
        //   " Max tanks ",
        //   this.maxTank[this.currentLevel - 1]
        // );

        // Check if the current wave have ended
        if (this.tankDestroyed === this.maxTank[this.currentLevel - 1]) {
          // console.log("Checking possibility to start next wave");
          // Start the next wave
          if (this.currentWave < this.maxWave[this.currentLevel - 1]) {
            this.currentWave++;
            // console.log("Preparing to start wave ", this.currentWave);
            setTimeout(() => {
              this.tankspawned = 0;
              this.tankDestroyed = 0;
              this.spawnTimerID = setInterval(
                () => this.startNextWave(),
                this.tankSpawnDelay
              );
            }, 1000);
          } else {
            // console.log("All waves are done");
            if (this.healthTo > 0) {
              this.sfxVictory.play();
              setTimeout(() => {
                this.sfxVictory.stop();
              }, 5500);
              setTimeout(() => {
                this.levelVictory = true;
                this.showGameStatus();
              }, 1000);
            }
          }
        }
      }
    }
  }

  /** Functions to start level */

  startLevel(pLevel) {
    this.currentLevel = pLevel;
    this.clearLevelSelection();
    this.resource = 5000;
    this.resourceTo = 5000;
    this.health = 2000;
    this.healthTo = 2000;

    this.resourceText.text = "Ressources : " + Math.floor(this.resource);
    this.healthText.text = "Santé : " + Math.floor(this.health);

    this.levelFailedText.visible = false;
    this.levelVictoryText.visible = false;

    this.levelFailed = false;
    this.levelVictory = false;

    // Reset tanks
    this.listTanks.forEach((tank) => tank.delete(false));
    this.listDefPositions.forEach((elt) => elt.destroy());
    this.listTowers.forEach((elt) => elt.delete(false));
    this.listAvailableTowerTypes.forEach((elt) => elt.destroy());
    this.listTanks = [];
    this.tankspawned = 0;
    this.tankDestroyed = 0;
    this.currentWave = 1;

    // Reset towers

    this.listDefPositions = [];
    this.listTowers = [];
    this.listAvailableTowerTypes = [];

    this.currentLevel = pLevel;
    this.gameStarted = true;

    // Reset map
    this.map.setTexture("level" + pLevel);
    this.map.setOrigin(0, 0);

    this.spawnTimerID = setInterval(() => {
      this.startNextWave();
    }, this.tankSpawnDelay);

    // Init towers
    for (var i = 0; i < this.defPositionsX[pLevel - 1].length; i++) {
      var x =
        this.defPositionsX[pLevel - 1][i] * config.tileSize +
        config.tileSize / 2;
      var y =
        this.defPositionsY[pLevel - 1][i] * config.tileSize +
        config.tileSize / 2;
      this.ShowDefPosition(x, y);
    }
    this.showAvailableTowerTypes();
  }

  clearLevelSelection() {
    this.children.getAll().forEach((child) => {
      child.destroy();
    });

    // Gameplay
    this.map = this.add.sprite(0, 0, "level1");

    // Resources
    this.resourceText = this.add.text(
      140,
      10,
      "Ressources : " + this.resource,
      {
        fontSize: 18,
      }
    );

    // Health
    this.healthText = this.add.text(400, 10, "Santé : " + this.health, {
      fontSize: 18,
    });

    // Level status
    this.levelFailedText = this.add.text(0, 100, "Niveau Perdu", {
      fontSize: 32,
      fontStyle: "bold",
    });
    this.levelFailedText.x = (config.width - this.levelFailedText.width) / 2;
    this.levelFailedText.depth = 2;

    this.levelVictoryText = this.add.text(100, 100, "Niveau Réussi", {
      fontSize: 32,
      fontStyle: "bold",
    });
    this.levelVictoryText.x = (config.width - this.levelVictoryText.width) / 2;
    this.levelVictoryText.depth = 2;

    // Wave text
    this.waveText = this.add.text(500, 12 * 32 + 10, "");

    // SFX
    this.sfxExplosion1 = this.sound.add("explosion1", { volume: 0.8 });
    this.sfxExplosion2 = this.sound.add("explosion2", { volume: 0.6 });
    this.sfxShoot = this.sound.add("shoot", { volume: 0.6 });
    this.sfxVictory = this.sound.add("victory");
  }

  showLevelSelection() {
    this.gameStarted = false;
    this.children.getAll().forEach((child) => {
      child.destroy();
    });

    // Level selection
    this.titleSelection = this.add.text(0, 30, "Choix du niveau", {
      fontSize: 30,
      fixedWidth: config.width,
      align: "center",
    });

    this.level1Btn = addButton(
      this,
      7 * config.tileSize,
      3 * config.tileSize,
      "Niveau 1",
      25,
      "button02"
    );

    this.level2Btn = addButton(
      this,
      7 * config.tileSize,
      5 * config.tileSize + 10,
      "Niveau 2",
      25,
      "button02"
    );

    this.level3Btn = addButton(
      this,
      7 * config.tileSize,
      7 * config.tileSize + 20,
      "Niveau 3",
      25,
      "button02"
    );

    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this);
    this.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
    this.input.on(Phaser.Input.Events.POINTER_UP, this.onPointerUp, this);

    // Back button
    this.backBtn = addButton(this, 32, 11 * 32, "Retour", 18, "button02", 0.7);
    this.input.on("gameobjectdown", this.onClick, this);

    this.input.on("pointerover", this.onPointerOver, this);
    this.input.on("pointerout", this.onPointerOut, this);

    if (this.levelLocked[1]) {
      this.level2Btn.alpha = 0.5;
      this.level2Btn.text.alpha = 0.5;
    } else {
      if (this.level2Btn.alpha < 1) {
        this.animateAlpha(this.level2Btn, this.level2Btn.alpha - 0.2, 1, 0.05);
        this.animateAlpha(
          this.level2Btn.text,
          this.level2Btn.alpha - 0.2,
          1,
          0.05
        );
      }
    }

    if (this.levelLocked[2]) {
      this.level3Btn.alpha = 0.5;
      this.level3Btn.text.alpha = 0.5;
    } else {
      if (this.level3Btn.alpha < 1) {
        this.animateAlpha(this.level3Btn, this.level3Btn.alpha - 0.2, 1, 0.05);
        this.animateAlpha(
          this.level3Btn.text,
          this.level3Btn.alpha - 0.2,
          1,
          0.05
        );
      }
    }

    this.titleSelection.visible = true;
    this.level1Btn.visible = true;
    this.level1Btn.text.visible = true;
    this.level2Btn.visible = true;
    this.level2Btn.text.visible = true;
    this.level3Btn.visible = true;
    this.level3Btn.text.visible = true;
    this.backBtn.text.visible = true;
    this.backBtn.visible = true;
  }

  /** Handle events */
  onClick(pointer, gameObject) {
    if (gameObject === this.backBtn) {
      this.scene.start("home");
      this.sound.play("click");
    }
  }

  onPointerOver(pointer, gameObject) {
    if (this.gameStarted) {
      return;
    }
    if (
      isOverlaping(
        pointer.x,
        pointer.y,
        1,
        1,
        this.backBtn.x,
        this.backBtn.y,
        this.backBtn.width,
        this.backBtn.height
      )
    ) {
      this.backBtn.setTexture("button00");
    }
    if (
      isOverlaping(
        pointer.x,
        pointer.y,
        1,
        1,
        this.level1Btn.x,
        this.level1Btn.y,
        this.level1Btn.width,
        this.level1Btn.height
      )
    ) {
      this.level1Btn.setTexture("button00");
    }

    if (
      isOverlaping(
        pointer.x,
        pointer.y,
        1,
        1,
        this.level2Btn.x,
        this.level2Btn.y,
        this.level2Btn.width,
        this.level2Btn.height
      )
    ) {
      this.level2Btn.setTexture("button00");
    }

    if (
      isOverlaping(
        pointer.x,
        pointer.y,
        1,
        1,
        this.level3Btn.x,
        this.level3Btn.y,
        this.level3Btn.width,
        this.level3Btn.height
      )
    ) {
      this.level3Btn.setTexture("button00");
    }
  }
  onPointerOut(pointer, gameObject) {
    if (this.gameStarted) {
      return;
    }
    this.backBtn.setTexture("button02");
    this.level1Btn.setTexture("button02");
    this.level2Btn.setTexture("button02");
    this.level3Btn.setTexture("button02");
  }

  onPointerDown(pointer, gameObject) {
    // Handle click on level selection button
    if (
      isOverlaping(
        pointer.x,
        pointer.y,
        1,
        1,
        this.level1Btn.x,
        this.level1Btn.y,
        this.level1Btn.width,
        this.level1Btn.height
      )
    ) {
      this.sound.play("click");
      this.startLevel(1);
    }

    if (
      isOverlaping(
        pointer.x,
        pointer.y,
        1,
        1,
        this.level2Btn.x,
        this.level2Btn.y,
        this.level2Btn.width,
        this.level2Btn.height
      ) &&
      this.levelLocked[1] == false
    ) {
      this.sound.play("click");
      this.startLevel(2);
    }

    if (
      isOverlaping(
        pointer.x,
        pointer.y,
        1,
        1,
        this.level3Btn.x,
        this.level3Btn.y,
        this.level3Btn.width,
        this.level3Btn.height
      ) &&
      this.levelLocked[2] == false
    ) {
      this.sound.play("click");
      this.startLevel(3);
    }

    // Collision with tower icons selection
    for (var i = 0; i < this.listAvailableTowerTypes.length; i++) {
      var tow = this.listAvailableTowerTypes[i];
      if (
        isOverlaping(
          pointer.x,
          pointer.y,
          1,
          1,
          tow.x - config.tileSize / 2,
          tow.y - config.tileSize / 2,
          tow.width,
          tow.height
        ) &&
        tow.alpha === 1
      ) {
        tow.clicked = true;
      }
    }
  }

  onPointerMove(pointer, gameObject) {
    // Collision with tower icons selection
    for (var i = 0; i < this.listAvailableTowerTypes.length; i++) {
      var tow = this.listAvailableTowerTypes[i];
      if (tow.clicked) {
        tow.x = pointer.x;
        tow.y = pointer.y;

        this.animateAlpha(tow.base, tow.base.alpha, 0, 0.01);
        this.animateAlpha(tow.cost, tow.cost.alpha, 0, 0.01);
      }
    }
  }

  onPointerUp(pointer, gameObject) {
    // Collision with tower icons selection
    for (var i = 0; i < this.listAvailableTowerTypes.length; i++) {
      var tow = this.listAvailableTowerTypes[i];
      tow.clicked = false;
      // console.log(tow.def);
      for (var j = 0; j < this.listDefPositions.length; j++) {
        var pos = this.listDefPositions[j];
        this.animateAlpha(tow.base, tow.base.alpha, 1, 0.01);
        this.animateAlpha(tow.cost, tow.cost.alpha, 1, 0.01);

        if (tow.type === this.totalTowerType - 1) {
          // The player is trying to use the special bullet
          // We make sure he drag it's icon over a tower
          if (
            isOverlaping(
              pos.x - config.tileSize / 2,
              pos.y - config.tileSize / 2,
              pos.width,
              pos.height,
              tow.x - config.tileSize / 2,
              tow.y - config.tileSize / 2,
              tow.width,
              tow.height
            ) &&
            pos.occupied === true
          ) {
            var cost = this.costByTowerType[tow.type];
            if (this.resource >= cost) {
              pos.tower.mode = "super";
              this.addToResources(-cost);
              this.animateScale(
                pos.tower,
                pos.tower.scale - 0.2,
                pos.tower.scale + 0.2,
                0.15
              );
              this.animateScale(
                pos.tower.base,
                pos.tower.base.scale - 0.2,
                pos.tower.base.scale + 0.2,
                0.15
              );

              tow.x = tow.initX;
              tow.y = tow.initY;
              this.animateScale(tow, 0.1, 1, 0.15);
              this.animateScale(tow.base, 0.1, tow.base.scale, 0.15);
            }
          }
        } else {
          if (
            isOverlaping(
              pos.x - config.tileSize / 2,
              pos.y - config.tileSize / 2,
              pos.width,
              pos.height,
              tow.x - config.tileSize / 2,
              tow.y - config.tileSize / 2,
              tow.width,
              tow.height
            ) &&
            pos.occupied === false
          ) {
            pos.tower = this.spawnTower(pos.x, pos.y, tow.type, j);
            this.animateScale(pos.tower, 0.1, 1, 0.15);
            this.animateScale(pos.tower.base, 0.1, pos.tower.base.scale, 0.15);

            this.addToResources(-this.costByTowerType[tow.type]);
            tow.x = tow.initX;
            tow.y = tow.initY;
            this.animateScale(tow, 0.1, 1, 0.15);
            this.animateScale(tow.base, 0.1, tow.base.scale, 0.15);

            pos.occupied = true;
            pos.alpha = 0;
          } else {
            setTimeout(() => {
              for (var i = 0; i < this.listAvailableTowerTypes.length; i++) {
                var tow = this.listAvailableTowerTypes[i];
                this.animateTravel(
                  tow,
                  tow.x,
                  tow.y,
                  tow.initX,
                  tow.initY,
                  0.01
                );
              }
            }, 0);
          }
        }
      }
    }
  }

  // Resources function
  addToResources(pX) {
    this.resourceTo += pX;
    for (var i = 0; i < this.listAvailableTowerTypes.length; i++) {
      var tt = this.listAvailableTowerTypes[i];
      if (this.resourceTo < this.costByTowerType[tt.type]) {
        this.animateAlpha(tt, tt.alpha, 0.3, 0.1);
        this.animateScale(tt, tt.scale, 0.8, 0.15);
        this.animateScale(tt.base, tt.base.scale, 1.1, 0.15);
      } else {
        if (tt.type === this.totalTowerType - 1) {
          if (this.listTowers.length > 0) {
            this.animateAlpha(tt, tt.alpha, 1, 0.1);
            this.animateScale(tt, tt.scale, 1, 0.15);
            this.animateScale(tt.base, tt.base.scale, 1.3, 0.15);
          }
        } else {
          this.animateAlpha(tt, tt.alpha, 1, 0.1);
          this.animateScale(tt, tt.scale, 1, 0.15);
          this.animateScale(tt.base, tt.base.scale, 1.3, 0.15);
        }
      }
    }
  }

  // Health functions
  costHealth(pX) {
    if (this.levelFailed === false) {
      this.healthTo -= pX;
    }
  }

  // Game over function
  showGameStatus() {
    this.children.getAll().forEach((child) => {
      if (child.visible === true)
        this.animateAlpha(child, child.alpha, 0.5, 0.05);
    });
    for (var i = 0; i < this.listAvailableTowerTypes.length; i++) {
      var tt = this.listAvailableTowerTypes[i];
      this.animateAlpha(tt, tt.alpha, 0.3, 0.1);
      this.animateScale(tt, tt.scale, 0.8, 0.15);
      this.animateScale(tt.base, tt.base.scale, 1.1, 0.15);
    }

    if (this.levelFailed) {
      this.levelFailedText.visible = true;
      this.animateAlpha(this.levelFailedText, 0.6, 1, 0.05);
    }
    if (this.levelVictory) {
      this.levelVictoryText.visible = true;
      this.animateAlpha(this.levelVictoryText, 0.6, 1, 0.05);
    }

    setTimeout(() => {
      this.children.getAll().forEach((child) => {
        if (child.visible === true)
          this.animateAlpha(child, child.alpha + 0.2, 0, 0.01);
      });
    }, 1500);

    setTimeout(() => {
      if (this.levelVictory) {
        this.unlockedLevel++;
        if (this.unlockedLevel <= this.maxLevel) {
          this.levelLocked[this.unlockedLevel - 1] = false;
        }
      }
      this.showLevelSelection();
    }, 2500);
  }

  create() {
    this.showLevelSelection();
  }

  update(time) {
    var dt = getDeltaTime(time);

    if (this.gameStarted) {
      if (this.levelFailed === false) {
        this.updateTanks(dt);
        this.updateTowers(dt);
        this.updateBullets();
      }

      this.updateScaleAnimations();
      this.updateTravelAnimations();
      this.updateAphaAnimations();

      // Animate Resources value modification
      if (this.resource > this.resourceTo) {
        this.resource -= (this.resource - this.resourceTo) * 0.15;
        if (Math.abs(this.resource - this.resourceTo) <= 0.1) {
          this.resource = this.resourceTo;
        }
        this.resourceText.text = "Ressources : " + Math.floor(this.resource);
      }
      if (this.resource < this.resourceTo) {
        this.resource += (this.resourceTo - this.resource) * 0.15;
        if (Math.abs(this.resource - this.resourceTo) <= 0.1) {
          this.resource = this.resourceTo;
        }
        this.resourceText.text = "Ressources : " + Math.floor(this.resource);
      }

      // Animate Health value modification
      if (this.health > this.healthTo) {
        this.health -= (this.health - this.healthTo) * 0.15;
        if (Math.abs(this.health - this.healthTo) <= 0.1) {
          this.health = this.healthTo;
        }
        this.healthText.text = "Santé : " + Math.floor(this.health);
      }
      if (this.healthTo <= 0 && this.levelFailed === false) {
        setTimeout(() => {
          this.levelFailed = true;
          this.showGameStatus();
        }, 500);
      }
    }
    if (this.levelFailed) {
      // console.log("Game Over");
    }
  }
}
