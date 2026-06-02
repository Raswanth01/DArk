// =========================================================================
// --- DArk: ECHO SECTOR - OPERATIONAL CORE ENGINE ---
// =========================================================================

// Shared geometric utility function
function checkLineIntercept(p1, p2, p3, p4) {
    let denominator = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
    if (denominator === 0) return null; 
    let ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denominator;
    let ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denominator;
    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
        return { x: p1.x + ua * (p2.x - p1.x), y: p1.y + ua * (p2.y - p1.y), dist: ua };
    }
    return null;
}

function generateProceduralRoom() {
    activeLockdowns = {};
    previousPlayerRoomID = 0;
    bullets = [];
    enemies = [];
    items = [];
    doors = [];
    obstacles = [];
    enemySpawners = [];
    keycards = {
        BLUE: false,
        RED: false,
        GREEN: false
    };

    let lvlData = HARDCODED_LEVELS[currentLayer] || HARDCODED_LEVELS[1];
    
    roomGrid = [];
    
    for (let r = 0; r < lvlData.grid.length; r++) {
        roomGrid.push([]);
        for (let c = 0; c < lvlData.grid[r].length; c++) {
            roomGrid[r].push(lvlData.grid[r][c]);
        }
    }

    let rows = roomGrid.length;
    let cols = roomGrid[0].length;
    for (let r = 0; r < roomGrid.length; r++) {
        for (let c = 0; c < roomGrid[0].length; c++) {

            if (roomGrid[r][c] === 7) {
                roomGrid[r][c] = 1;
            }
        }
    }
    buildRoomMap();

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let tile = roomGrid[r][c];

            if (tile === 30) {

                playerX =
                    c * TILE_SIZE +
                    TILE_SIZE / 2;

                playerY =
                    r * TILE_SIZE +
                    TILE_SIZE / 2;

                roomGrid[r][c] = 1;

                tile = 1;
            }
            
            if (tile === 4) {

                let roomID = 0;

                const dirs = [
                    [1,0],
                    [-1,0],
                    [0,1],
                    [0,-1]
                ];

                for (let dir of dirs) {

                    let nr = r + dir[0];
                    let nc = c + dir[1];

                    if (
                        nr >= 0 &&
                        nr < rows &&
                        nc >= 0 &&
                        nc < cols &&
                        roomIDs[nr][nc] > 0
                    ) {
                        roomID = roomIDs[nr][nc];
                        break;
                    }
                }

                let edge = "TOP";

                if (roomIDs[r]?.[c-1] > 0)
                    edge = "LEFT";

                else if (roomIDs[r]?.[c+1] > 0)
                    edge = "RIGHT";

                else if (roomIDs[r-1]?.[c] > 0)
                    edge = "TOP";

                else if (roomIDs[r+1]?.[c] > 0)
                    edge = "BOTTOM";

                doors.push({
                    r,
                    c,
                    roomID,
                    edge,
                    type: "LOCKDOWN",
                    state: "OPEN",
                    x: c * TILE_SIZE,
                    y: r * TILE_SIZE
                });
            }
            if (
                tile === 5 ||
                tile === 9 ||
                tile === 10
            ) {

                let securityColor = "BLUE";

                if (tile === 9)
                    securityColor = "RED";

                if (tile === 10)
                    securityColor = "GREEN";
                let edge = "TOP";

                    if (roomIDs[r]?.[c-1] > 0)
                        edge = "LEFT";

                    else if (roomIDs[r]?.[c+1] > 0)
                        edge = "RIGHT";

                    else if (roomIDs[r-1]?.[c] > 0)
                        edge = "TOP";

                    else if (roomIDs[r+1]?.[c] > 0)
                        edge = "BOTTOM";

                let roomID = 0;

                const dirs = [
                    [1,0],
                    [-1,0],
                    [0,1],
                    [0,-1]
                ];

                for (let dir of dirs) {

                    let nr = r + dir[0];
                    let nc = c + dir[1];

                    if (
                        nr >= 0 &&
                        nr < rows &&
                        nc >= 0 &&
                        nc < cols &&
                        roomIDs[nr][nc] > 0
                    ) {
                        roomID = roomIDs[nr][nc];
                        break;
                    }
                }
                    
                doors.push({
                    r,
                    c,

                    roomID,   // <-- add this

                    type: "SECURITY",
                    state: "LOCKED",

                    securityColor,
                    edge,
                    x: c * TILE_SIZE,
                    y: r * TILE_SIZE
                });
            }
            if (
                tile === 20 ||
                tile === 21 ||
                tile === 22
            ) {

                let color = "BLUE";

                if (tile === 21)
                    color = "RED";

                if (tile === 22)
                    color = "GREEN";

                items.push({

                    x: c * TILE_SIZE + TILE_SIZE / 2,
                    y: r * TILE_SIZE + TILE_SIZE / 2,

                    type: "KEYCARD",

                    color
                });
            }
            if (tile === 6) {
                obstacles.push({ r: r, c: c, hp: 3, maxHp: 3, x: c * TILE_SIZE, y: r * TILE_SIZE });
            }
            if (lvlData.grid[r][c] === 7) {

                enemySpawners.push({
                    r,
                    c,
                    roomID: roomIDs[r][c]
                });
            }
        }
    }



    

    let shuffled = [...enemySpawners];

    shuffled.sort(() => Math.random() - 0.5);

    let enemyCount = shuffled.length;

    for (let i = 0; i < enemyCount; i++) {

        let s = shuffled[i];

        let pool = lvlData.enemyPool;

        let bp =
            pool[Math.floor(Math.random() * pool.length)];

        enemies.push({
            
            x: s.c * TILE_SIZE + TILE_SIZE / 2,
            y: s.r * TILE_SIZE + TILE_SIZE / 2,

            type: bp.type,
            health: bp.hp,
            maxHp: bp.hp,
            speed: bp.speed,
            radius: bp.radius,
            color: bp.color,
            creditDrop: bp.creditDrop,
            stopDistance: bp.stopDistance,
            fireRate: bp.fireRate,
            damage: bp.damage,

            roomNumber: s.roomID,

            state: "PATROL",
            cloakTimer: 0,
            direction: Math.random() < 0.5 ? 1 : -1,
            patrolAxis: Math.random() < 0.5 ? "HORIZONTAL" : "VERTICAL",

            angle: Math.PI / 2,
            fovAngle: bp.type === "SNIPER" ? Math.PI / 5 : Math.PI / 3,
            viewDist: bp.type === "SNIPER" ? 300 : 150,
            loseTrackTimer: 0,
            lastKnownX: 0,
            lastKnownY: 0,

            baseMinY: (s.r - 1) * TILE_SIZE + 5,
            baseMaxY: (s.r + 1) * TILE_SIZE - 5
        });
    }

    

    rebuildMatrixWallSegments();
}

function rebuildMatrixWallSegments() {
    wallSegments = [];
    let rows = roomGrid.length;
    let cols = roomGrid[0].length;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let tile = roomGrid[r][c];
            let x = c * TILE_SIZE;
            let y = r * TILE_SIZE;


            if (tile === 0) {
                if (r > 0 && roomGrid[r-1][c] !== 0) wallSegments.push({ start: { x: x, y: y }, end: { x: x + TILE_SIZE, y: y } });
                if (r < rows - 1 && roomGrid[r+1][c] !== 0) wallSegments.push({ start: { x: x, y: y + TILE_SIZE }, end: { x: x + TILE_SIZE, y: y + TILE_SIZE } });
                if (c > 0 && roomGrid[r][c-1] !== 0) wallSegments.push({ start: { x: x, y: y }, end: { x: x, y: y + TILE_SIZE } });
                if (c < cols - 1 && roomGrid[r][c+1] !== 0) wallSegments.push({ start: { x: x + TILE_SIZE, y: y }, end: { x: x + TILE_SIZE, y: y + TILE_SIZE } });
            }
            else if (tile === 1) {

                if (r > 0 && roomGrid[r-1][c] === 2)
                    wallSegments.push({
                        start:{x:x,y:y},
                        end:{x:x+TILE_SIZE,y:y}
                    });

                if (r < rows-1 && roomGrid[r+1][c] === 2)
                    wallSegments.push({
                        start:{x:x,y:y+TILE_SIZE},
                        end:{x:x+TILE_SIZE,y:y+TILE_SIZE}
                    });

                if (c > 0 && roomGrid[r][c-1] === 2)
                    wallSegments.push({
                        start:{x:x,y:y},
                        end:{x:x,y:y+TILE_SIZE}
                    });

                if (c < cols-1 && roomGrid[r][c+1] === 2)
                    wallSegments.push({
                        start:{x:x+TILE_SIZE,y:y},
                        end:{x:x+TILE_SIZE,y:y+TILE_SIZE}
                    });
            }
            else if (tile === 6) {

                wallSegments.push({
                    start:{x:x,y:y},
                    end:{x:x+TILE_SIZE,y:y},
                    isCrate:true
                });

                wallSegments.push({
                    start:{x:x+TILE_SIZE,y:y},
                    end:{x:x+TILE_SIZE,y:y+TILE_SIZE},
                    isCrate:true
                });

                wallSegments.push({
                    start:{x:x+TILE_SIZE,y:y+TILE_SIZE},
                    end:{x:x,y:y+TILE_SIZE},
                    isCrate:true
                });

                wallSegments.push({
                    start:{x:x,y:y+TILE_SIZE},
                    end:{x:x,y:y},
                    isCrate:true
                });
            }
        }
    }

    for (let d of doors) {

        if (d.state === "OPEN")
            continue;

        switch(d.edge) {

            case "LEFT":
                wallSegments.push({
                    start:{x:d.x,y:d.y},
                    end:{x:d.x,y:d.y+TILE_SIZE}
                });
                break;

            case "RIGHT":
                wallSegments.push({
                    start:{x:d.x+TILE_SIZE,y:d.y},
                    end:{x:d.x+TILE_SIZE,y:d.y+TILE_SIZE}
                });
                break;

            case "TOP":
                wallSegments.push({
                    start:{x:d.x,y:d.y},
                    end:{x:d.x+TILE_SIZE,y:d.y}
                });
                break;

            case "BOTTOM":
                wallSegments.push({
                    start:{x:d.x,y:d.y+TILE_SIZE},
                    end:{x:d.x+TILE_SIZE,y:d.y+TILE_SIZE}
                });
                break;
        }
    }
        }

function checkEntityMatrixCollision(px, py, rad) {
    let checkPoints = [
        { x: px - rad, y: py - rad }, { x: px + rad, y: py - rad },
        { x: px - rad, y: py + rad }, { x: px + rad, y: py + rad }
    ];
    
    let maxRows = roomGrid.length;
    let maxCols = roomGrid[0].length;

    for (let pt of checkPoints) {
        let c = Math.floor(pt.x / TILE_SIZE);
        let r = Math.floor(pt.y / TILE_SIZE);
        let currentGridX = Math.floor(playerX / TILE_SIZE);
        let currentGridY = Math.floor(playerY / TILE_SIZE);

        

        
        
        if (r < 0 || r >= maxRows || c < 0 || c >= maxCols) return 0;
        if (roomGrid[r][c] === 0 || roomGrid[r][c] === 6) return 0;
        
        
    }

    for (let seg of wallSegments) {

        let nearestX = Math.max(
            Math.min(px, Math.max(seg.start.x, seg.end.x)),
            Math.min(seg.start.x, seg.end.x)
        );

        let nearestY = Math.max(
            Math.min(py, Math.max(seg.start.y, seg.end.y)),
            Math.min(seg.start.y, seg.end.y)
        );

        let dx = px - nearestX;
        let dy = py - nearestY;

        if (dx * dx + dy * dy < rad * rad) {
            return 0;
        }
    }
    return 1; 
}

function update() {
    if (gameStatus !== "PLAYING") return;

    if (powerups.invisibilityTimer > 0) powerups.invisibilityTimer--;

    let isMoving = keys.w || keys.a || keys.s || keys.d;
    let currentSpeed = keys.shift ? playerBaseSpeed * 0.35 : playerBaseSpeed;
    let nextPlayerX = playerX;
    let nextPlayerY = playerY;

    if (keys.w) nextPlayerY -= currentSpeed;
    if (keys.s) nextPlayerY += currentSpeed;
    if (keys.a) nextPlayerX -= currentSpeed;
    if (keys.d) nextPlayerX += currentSpeed;

    if (checkEntityMatrixCollision(nextPlayerX, playerY, playerRadius) === 1) playerX = nextPlayerX;
    if (checkEntityMatrixCollision(playerX, nextPlayerY, playerRadius) === 1) playerY = nextPlayerY;

    playerAngle = Math.atan2(mouse.y - playerY, mouse.x - playerX);
    let pGridX = Math.floor(playerX / TILE_SIZE);
    let pGridY = Math.floor(playerY / TILE_SIZE);


    let standingTileType = (roomGrid[pGridY] && roomGrid[pGridY][pGridX] !== undefined) ? roomGrid[pGridY][pGridX] : 0;

    let playerRoomID = 0;

    if (
        roomIDs[pGridY] &&
        roomIDs[pGridY][pGridX]
    ) {
        playerRoomID = roomIDs[pGridY][pGridX];
    }
    let enteredRoom =
    playerRoomID !== 0 &&
    playerRoomID !== previousPlayerRoomID;


    

    var currentAudioFootprint = 0;
    if (isMoving) {
        currentAudioFootprint = keys.shift ? 0 : 110;
    }
    if (window.weaponDischargeAlertTimer > 0) {
        currentAudioFootprint = 240;
        window.weaponDischargeAlertTimer--;
    }

    // --- MULTI-DOOR LOCKDOWN & ANTI-CRUSH TRACKER CORE ---
    let doorStateChanged = false;
    
    
    
    // 1. Process active threat levels per room to determine safe arming parameters
    enemies.forEach(e => {
        if (e.health > 0 && e.roomNumber === playerRoomID && playerRoomID !== 0) {
            // Verify if player bounding parameters are overlapping with any door inside this sector
            let closeToAnyEntrance = doors.some(d => {
                if (d.type === "LOCKDOWN" && d.roomID === playerRoomID) {
                    let distToPlayer = Math.hypot(playerX - (d.x + TILE_SIZE/2), playerY - (d.y + TILE_SIZE/2));
                    return distToPlayer < TILE_SIZE * 1.5; // True if player center is on threshold tiles
                }
                return false;
            });

            // Trigger isolation lock ONLY when completely clear of door collision blocks
            if (!closeToAnyEntrance && !activeLockdowns[playerRoomID]) {
                console.log("SAFE LOCKDOWN ACTIVATED FOR ROOM ID:", playerRoomID);
                activeLockdowns[playerRoomID] = true;
                
                // FORCE COMPLETE STOP ON BACKGROUND TRACK IMMEDIATELY
                sounds.bgm.pause();
                sounds.bgm.currentTime = sounds.bgm.currentTime; // Lock stream state
                
                playSound(sounds.clang);
                
                setTimeout(() => {
                    if (!activeLockdowns[playerRoomID]) return;
                    sounds.lockdownMusic.currentTime = 0;
                    sounds.lockdownMusic.play();
                }, 200);
            }
        }
    });

    // 2. Perform automated database clearing for rooms with 0 remaining bots
    for (let rID in activeLockdowns) {
        if (activeLockdowns[rID] === true) {
            let roomHasActiveThreats = enemies.some(e => e.roomNumber === parseInt(rID) && e.health > 0);
            if (!roomHasActiveThreats) {
                console.log("SAFE LOCKDOWN TERMINATED FOR ROOM ID:", rID);
                activeLockdowns[rID] = false;
                
                // UNIFIED TRACK SWITCH: Stop combat track completely before starting BGM
                sounds.lockdownMusic.pause();
                sounds.lockdownMusic.currentTime = 0;
                
                sounds.bgm.play().catch(err => console.log("Audio waiting for player interaction..."));
            }
        }
    }

    // 3. Actuate individual door state metrics uniformly to prevent multi-door fights
    // 3. Actuate individual door state metrics uniformly without cross-type conflicts
    doors.forEach(d => {
        let oldState = d.state;
        let distToPlayer = Math.hypot(playerX - (d.x + TILE_SIZE/2), playerY - (d.y + TILE_SIZE/2));
        let playerIsStandingInDoorway = distToPlayer < TILE_SIZE * 1.5;

        // --- LOCKDOWN TYPE GATES ---
        if (d.type === "LOCKDOWN") {
            if (activeLockdowns[d.roomID] === true) {
                d.state = "LOCKED"; 
            } else {
                if (playerIsStandingInDoorway) {
                    d.state = "OPEN";
                } else {
                    d.state = "LOCKED";
                }
            }
        }

        // --- SECURITY TYPE GATES (FIXED CONFLICT) ---
        // --- SECURITY TYPE GATES (STRICT LOCKDOWN ENFORCEMENT) ---
        if (d.type === "SECURITY") {
            let hasKey = keycards[d.securityColor];

            if (activeLockdowns[d.roomID] === true) {
                // anti-crush safety check always takes absolute priority
                if (playerIsStandingInDoorway) {
                    d.state = "OPEN"; 
                } else {
                    // HARDCORE OVERRIDE: Keycards are deactivated during combat!
                    d.state = "LOCKED"; 
                }
            } else {
                // Normal security door functionality out of combat
                if (hasKey && playerIsStandingInDoorway) {
                    d.state = "OPEN";
                } else {
                    d.state = "LOCKED";
                }
            }
        }
        if (d.state !== oldState) {
            if (oldState === "LOCKED" && d.state === "OPEN") {
                playSound(sounds.doorOpen);
            }
            doorStateChanged = true;
        }
    });

    

    if (doorStateChanged) rebuildMatrixWallSegments();

    // --- BULLETS LOOP ---
    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        b.x += b.vx;
        b.y += b.vy;
        b.lifeFrames++;

        let gx = Math.floor(b.x / TILE_SIZE);
        let gy = Math.floor(b.y / TILE_SIZE);

        

        if (roomGrid[gy] && roomGrid[gy][gx] === 6) {
            let crate = obstacles.find(obs => obs.r === gy && obs.c === gx);
            if (crate) {
                if (!b.isEnemyBullet) {
                    playSound(sounds.crateHit);
                    crate.hp -= (1 * upgrades.damageMultiplier);
                    if (crate.hp <= 0) {
                        roomGrid[gy][gx] = 1; 
                        rebuildMatrixWallSegments(); 
                    }
                }
                bullets.splice(i, 1); 
                continue;
            }
        }

        let bulletHitWall = false;

        for (let seg of wallSegments) {

            let hit = checkLineIntercept(
                { x: b.x - b.vx, y: b.y - b.vy },
                { x: b.x, y: b.y },
                seg.start,
                seg.end
            );

            if (!hit) continue;

            b.x = b.x - b.vx;
            b.y = b.y - b.vy;

            let vertical =
                Math.abs(seg.start.x - seg.end.x) <
                Math.abs(seg.start.y - seg.end.y);

            if (vertical) {
                b.vx *= -1;
            } else {
                b.vy *= -1;
            }

            b.bounces++;

            if (b.bounces > upgrades.maxBounces) {
                bullets.splice(i, 1);
            }

            break;
        }
        if (bulletHitWall) {

            b.bounces++;

            if (b.bounces > upgrades.maxBounces) {
                bullets.splice(i, 1);
                continue;
            }
        }

        if (b.isEnemyBullet && Math.hypot(b.x - playerX, b.y - playerY) < playerRadius + b.radius) {
            if (powerups.shieldHealth > 0) {
                playSound(sounds.shieldHit);
                powerups.shieldHealth -= b.damage;

                if (powerups.shieldHealth < 0)
                    powerups.shieldHealth = 0;

            } else {
                playSound(sounds.playerHit);
                playerHealth -= b.damage;

                if (playerHealth <= 0){
                    sounds.bgm.pause();
                    sounds.lockdownMusic.pause();

                    sounds.deathMusic.currentTime = 0;
                    sounds.deathMusic.play();

                    gameStatus = "GAME_OVER";
                }
            }
            bullets.splice(i, 1);
        }
    }

    bullets = bullets.filter(b => b.x > 0 && b.x < canvas.width && b.y > 0 && b.y < canvas.height);

    // --- ENEMY LOGIC CORE ---
    for (let e of enemies) {

        let enemyIsCloaked = false;

        if (e.type === "CLOAKED") {

            e.cloakTimer++;

            enemyIsCloaked =
                (e.cloakTimer % 240) < 120;
        }
        if (e.health <= 0) continue;
        let dx = playerX - e.x;
        let dy = playerY - e.y;
        let dist = Math.hypot(dx, dy);  
        if (
            e.type === "EXPLOSIVE" &&
            dist < 20
        ) {

           if (powerups.shieldHealth > 0) {

                powerups.shieldHealth -= e.damage;

                if (powerups.shieldHealth < 0)
                    powerups.shieldHealth = 0;

            } else {

                playerHealth -= e.damage;

                if (playerHealth <= 0){
                    sounds.bgm.pause();
                    sounds.lockdownMusic.pause();

                    sounds.deathMusic.currentTime = 0;
                    sounds.deathMusic.play();

                    gameStatus = "GAME_OVER";
                }
            }
            playSound(sounds.explosion);
            playSound(sounds.playerHit);
            e.health = 0;

            score += 100;

            items.push({
                x: e.x,
                y: e.y,
                type: "CREDIT",
                value: e.creditDrop
            });

            continue;
        }

        

        let playerVisible = false;
        if (powerups.invisibilityTimer <= 0 && dist < e.viewDist) {
            let angleToPlayer = Math.atan2(dy, dx);
            let diff = Math.abs(e.angle - angleToPlayer);
            if (diff > Math.PI) diff = (Math.PI * 2) - diff;

            if (diff < e.fovAngle / 2) {
                let pathBlocked = false;
                for (let seg of wallSegments) {

                    let hit = checkLineIntercept(
                        { x: e.x, y: e.y },
                        { x: playerX, y: playerY },
                        seg.start,
                        seg.end
                    );

                    if (hit) {
                        pathBlocked = true;
                        break;
                    }
                }
                if (!pathBlocked) playerVisible = true;
            }
        }

        let playerHeard = (powerups.invisibilityTimer <= 0 && dist < currentAudioFootprint);

        if (e.state === "PATROL") {
            if (e.patrolAxis === "VERTICAL") {

                let nextBotY = e.y + (e.speed * 0.4 * e.direction);

                if (
                    checkEntityMatrixCollision(
                        e.x,
                        nextBotY + (e.radius * e.direction),
                        e.radius
                    ) === 0
                ) {

                    e.direction *= -1;

                } else {

                    e.y = nextBotY;
                }

                e.angle =
                    e.direction === 1
                        ? Math.PI / 2
                        : -Math.PI / 2;

            } else {

                let nextBotX =
                    e.x + (e.speed * 0.4 * e.direction);

                if (
                    checkEntityMatrixCollision(
                        nextBotX + (e.radius * e.direction),
                        e.y,
                        e.radius
                    ) === 0
                ) {

                    e.direction *= -1;

                } else {

                    e.x = nextBotX;
                }

                e.angle =
                    e.direction === 1
                        ? 0
                        : Math.PI;
            }

            if (powerups.invisibilityTimer <= 0) {
                if (playerVisible) {

                    playSound(sounds.alert);

                    e.state = "CHASE";
                    e.loseTrackTimer = 120;
                }
                else if (playerHeard) {
                    let angleToPlayer = Math.atan2(dy, dx);
                    e.angle = angleToPlayer;
                }
            }
        } 
        else if (e.state === "CHASE") {
            
            let angle = Math.atan2(dy, dx);
            
            if (playerVisible || playerHeard) {
                e.lastKnownX = playerX;
                e.lastKnownY = playerY;
                e.angle = angle; 
                e.loseTrackTimer = 240; 
                
                let stopDistance = e.stopDistance;


                if (dist > stopDistance) {

                    let nextBotX =
                        e.x + Math.cos(angle) * e.speed;

                    let nextBotY =
                        e.y + Math.sin(angle) * e.speed;

                    if (checkEntityMatrixCollision(nextBotX, e.y, e.radius) === 1) e.x = nextBotX;
                    if (checkEntityMatrixCollision(e.x, nextBotY, e.radius) === 1) e.y = nextBotY;

                }
                else if (playerHeard) {
                    e.angle = angle;
                }

                if (
                    e.type !== "EXPLOSIVE" &&
                    frameCount % e.fireRate === 0
                ) {
                    playSound(sounds.enemyShoot);
                    bullets.push({
                        x: e.x,
                        y: e.y,
                        vx: Math.cos(angle) * 6,
                        vy: Math.sin(angle) * 6,
                        radius: 4,
                        isEnemyBullet: true,
                        bounces: 0,
                        damage: e.damage,
                        lifeFrames: 0
                    });
                }
            } 
            else {
                e.loseTrackTimer--;
                
                let distToMemory =
                    Math.hypot(
                        e.lastKnownX - e.x,
                        e.lastKnownY - e.y
                    );

                if (distToMemory < 20) {
                    e.loseTrackTimer = 0;
                }
                let memDx = e.lastKnownX - e.x;
                let memDy = e.lastKnownY - e.y;

                let memAngle =
                    Math.atan2(memDy, memDx);

                e.angle = memAngle;

                let nextBotX =
                    e.x + Math.cos(memAngle) * (e.speed * 0.6);

                let nextBotY =
                    e.y + Math.sin(memAngle) * (e.speed * 0.6);
                
                if (checkEntityMatrixCollision(nextBotX, e.y, e.radius) === 1) e.x = nextBotX;
                if (checkEntityMatrixCollision(e.x, nextBotY, e.radius) === 1) e.y = nextBotY;

                if (e.loseTrackTimer <= 0) {
                    e.state = "PATROL";
                    e.direction = Math.random() < 0.5 ? 1 : -1;
                    e.patrolAxis = Math.random() < 0.5 ? "HORIZONTAL" : "VERTICAL";
                }
            }
        }

        for (let i = bullets.length - 1; i >= 0; i--) {
            let b = bullets[i];
            if (!b || b.isEnemyBullet) continue;

            if (Math.hypot(b.x - e.x, b.y - e.y) < e.radius + b.radius) {
                e.health -= (1 * upgrades.damageMultiplier);
                if (e.health>0) {
                    playSound(sounds.enemyHit);
                }
                bullets.splice(i, 1);
                
                if (e.health <= 0) {
                    playSound(sounds.enemyDown);

                    score += 100;

                    items.push({
                        x: e.x,
                        y: e.y,
                        type: "CREDIT",
                        value: e.creditDrop
                    });
                }
            }
        }
    }

    for (let i = items.length - 1; i >= 0; i--) {
        let it = items[i];
        if (Math.hypot(playerX - it.x, playerY - it.y) < playerRadius + 12) {
            if (it.type === "KEYCARD") {
                playSound(sounds.pickup);
                keycards[it.color] = true;

            }
            else if (it.type === "CREDIT") {
                playSound(sounds.pickup);
                credits += it.value;

            }
            items.splice(i, 1);
        }
    }

    if (
    roomGrid[pGridY] &&
    roomGrid[pGridY][pGridX] === 8
    ) {

        if (
            HARDCODED_LEVELS[currentLayer + 1]
        ) {

            pendingLayer = currentLayer + 1;

            sounds.lockdownMusic.pause();
            sounds.lockdownMusic.currentTime = 0;

            

            activeLockdowns = {};

            gameStatus = "MARKETPLACE";

        } else {
            sounds.bgm.pause();
            sounds.lockdownMusic.pause();

            sounds.victoryMusic.currentTime = 0;
            sounds.victoryMusic.play();

            gameStatus = "VICTORY";
        }
    }
    if (playerHealth <= 0) {
        gameStatus = "GAME_OVER";
    }
    previousPlayerRoomID = playerRoomID;
    frameCount++;
    if (frameCount % 60 === 0) gameTimer++;

}

function getMatrixTileType(x, y) {
    let c = Math.floor(x / TILE_SIZE);
    let r = Math.floor(y / TILE_SIZE);
    if (roomGrid[r] && roomGrid[r][c] !== undefined) return roomGrid[r][c];
    return 0;
}

window.weaponDischargeAlertTimer = 0;

window.addEventListener("keyup", (e) => {
    let k = e.key.toLowerCase();
    if (k in keys) keys[k] = false;
    if (e.key === "Shift") keys.shift = false;
});

window.addEventListener("keydown", (e) => {
    
    if (
        e.key === "Enter" &&
        gameStatus === "MARKETPLACE"
    ) {

        if (pendingLayer !== null) {

            currentLayer = pendingLayer;
            pendingLayer = null;

            generateProceduralRoom();

            sounds.bgm.currentTime = 0;
            sounds.bgm.play();
        }

        gameStatus = "PLAYING";
    }
    let k = e.key.toLowerCase();
    if (k === "l") {
        flashlightEnabled = !flashlightEnabled;
    }
    if (k === "q") {

        if (
            powerups.cloakCharges > 0 &&
            powerups.invisibilityTimer <= 0
        ) {
            powerups.cloakCharges--;
            playSound(sounds.cloakOn);
            powerups.invisibilityTimer = 600;
        }
    }
    
    if (k in keys) keys[k] = true;
    if (e.key === "Shift") keys.shift = true;

    if (k === "p" && gameStatus !== "GAME_OVER") gameStatus = gameStatus === "PLAYING" ? "PAUSED" : "PLAYING";
    

    if (k === "r") {
        currentLayer = 1; playerHealth = 100; score = 0; credits = 0; gameTimer = 0; frameCount = 0;
        upgrades.damageMultiplier = 1.0; upgrades.alternateFire = false;
        powerups.invisibilityTimer = 0;
        powerups.shieldHealth = 0;
        powerups.cloakCharges = 0;
        activeLockdowns = {}; 
        previousPlayerRoomID = 0;
        gameStatus = "PLAYING";
        generateProceduralRoom();
        sounds.bgm.pause();
        sounds.lockdownMusic.pause();
        sounds.victoryMusic.pause();
        sounds.deathMusic.pause();

        sounds.bgm.currentTime = 0;
        sounds.lockdownMusic.currentTime = 0;
        sounds.victoryMusic.currentTime = 0;
        sounds.deathMusic.currentTime = 0;

        sounds.bgm.play();
    }

    if (gameStatus === "MARKETPLACE") {
        if (e.key === "1" && credits >= 75) {

            upgrades.damageMultiplier += 0.5;
            credits -= 75;
        }

        if (
            e.key === "2" &&
            credits >= 150 &&
            !upgrades.alternateFire
        ) {

            upgrades.alternateFire = true;
            credits -= 150;
        }

        if (e.key === "3" && credits >= 50) {

            playerHealth =
                Math.min(
                    maxHealth,
                    playerHealth + 40
                );

            credits -= 50;
        }

        if (e.key === "4" && credits >= 80) {

            powerups.shieldHealth += 100;

            if (powerups.shieldHealth > 100)
                powerups.shieldHealth = 100;

            credits -= 80;
        }

        if (e.key === "5" && credits >= 100) {

            powerups.cloakCharges++;
            credits -= 100;
        }
    }
});

window.addEventListener("mousemove", (e) => {
    let rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left - offsetX;
    mouse.y = e.clientY - rect.top - offsetY;
});

window.addEventListener("mousedown", (e) => {
    if (gameStatus !== "PLAYING" || e.button !== 0) return;
    if (powerups.invisibilityTimer > 0) return;
    
    window.weaponDischargeAlertTimer = 60; 
    
    let count = upgrades.alternateFire ? 3 : 1;
    for (let i = 0; i < count; i++) {
        let spreadAngle = playerAngle + (i - (count - 1) / 2) * 0.18;
        playSound(sounds.playerShoot);
        bullets.push({ 
            x: playerX, 
            y: playerY, 
            vx: Math.cos(spreadAngle) * bulletSpeed, 
            vy: Math.sin(spreadAngle) * bulletSpeed, 
            radius: 3.5, 
            isEnemyBullet: false, 
            bounces: 0, 
            lifeFrames: 0, 
            damage: 1 * upgrades.damageMultiplier
        });
    }
});


function buildRoomMap() {

    roomIDs = [];

    for (let r = 0; r < roomGrid.length; r++) {
        roomIDs[r] = [];
        for (let c = 0; c < roomGrid[0].length; c++) {
            roomIDs[r][c] = 0;
        }
    }

    let nextRoomID = 1;

    for (let r = 0; r < roomGrid.length; r++) {
        for (let c = 0; c < roomGrid[0].length; c++) {

            if (roomGrid[r][c] !== 1) continue;
            if (roomIDs[r][c] !== 0) continue;

            let queue = [{r,c}];

            roomIDs[r][c] = nextRoomID;

            while(queue.length > 0) {

                let node = queue.pop();

                let dirs = [
                    [1,0],
                    [-1,0],
                    [0,1],
                    [0,-1]
                ];

                for(let d of dirs){

                    let nr = node.r + d[0];
                    let nc = node.c + d[1];

                    if(
                        nr >= 0 &&
                        nr < roomGrid.length &&
                        nc >= 0 &&
                        nc < roomGrid[0].length &&
                        roomGrid[nr][nc] === 1 &&
                        roomIDs[nr][nc] === 0
                    ){
                        roomIDs[nr][nc] = nextRoomID;
                        queue.push({r:nr,c:nc});
                    }
                }
            }

            nextRoomID++;
        }
    }
}

generateProceduralRoom();
window.addEventListener("click", () => {

    sounds.bgm.play();

}, { once: true });
window.addEventListener("keydown", () => {

    sounds.bgm.play();

}, { once: true });