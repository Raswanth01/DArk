// =========================================================================
// --- DArk: ECHO SECTOR - OPERATIONAL RENDERING ENGINE ---
// =========================================================================

// Shared geometric utility function renamed to match engine code perfectly
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

function render() {
    
    let lvlData = HARDCODED_LEVELS[currentLayer] || HARDCODED_LEVELS[1];

    ctx.fillStyle = "#020205";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let worldWidth =
        roomGrid[0].length * TILE_SIZE;

    let worldHeight =
        roomGrid.length * TILE_SIZE;

    offsetX =
        (canvas.width - worldWidth) / 2;

    offsetY =
        ((canvas.height-90) - worldHeight) / 2+90;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.beginPath();
    ctx.moveTo(playerX, playerY);

    let totalRays = 180;
    let viewDistance = 150;
    for (let i = 0; i <= totalRays; i++) {
        let angle = playerAngle - (Math.PI / 4.8) + (i / totalRays) * (Math.PI / 2.4);
        let rayEnd = { x: playerX + Math.cos(angle) * viewDistance, y: playerY + Math.sin(angle) * viewDistance };

        let closestHit = null;
        for (let seg of wallSegments) {
            let hit = checkLineIntercept({ x: playerX, y: playerY }, rayEnd, seg.start, seg.end);
            if (hit) { if (!closestHit || hit.dist < closestHit.dist) closestHit = hit; }
        }
        if (closestHit) ctx.lineTo(closestHit.x, closestHit.y);
        else ctx.lineTo(rayEnd.x, rayEnd.y);
    }
    ctx.lineTo(playerX, playerY);
    ctx.closePath();





    
    if (flashlightEnabled) {
        ctx.clip();
    }






    // LAYER 3: Paint Grid Tiles
    for (let r = 0; r < roomGrid.length; r++) {
        for (let c = 0; c < roomGrid[0].length; c++) {
            let tile = roomGrid[r][c];
            let x = c * TILE_SIZE;
            let y = r * TILE_SIZE;

            if (tile === 0) {
                ctx.fillStyle = THEME.colors.voidBackground;
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = "#11111f";
                ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
            } else if (tile === 1) {
                ctx.fillStyle = THEME.colors.radarFloor;
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            } else if (
                tile === 20 ||
                tile === 21 ||
                tile === 22
            ) {

                ctx.fillStyle = "#16202d";

                ctx.fillRect(
                    x,
                    y,
                    TILE_SIZE,
                    TILE_SIZE
                );
            } else if (tile === 2) {
                ctx.fillStyle = "#131d2a";      
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            } else if (
                tile === 4 ||
                tile === 5 ||
                tile === 9 ||
                tile === 10
            ) {

                ctx.fillStyle = "#131d2a";

                ctx.fillRect(
                    x,
                    y,
                    TILE_SIZE,
                    TILE_SIZE
                );
            } else if (tile === 6) {
                ctx.fillStyle = "#4a3319";
                ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                
                let obsCrate = obstacles.find(o => o.r === r && o.c === c);
                if (obsCrate) {
                    ctx.strokeStyle = "rgb(50, 19, 7)";
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
                    
                    ctx.beginPath();
                    ctx.moveTo(x + 5, y + 5); ctx.lineTo(x + TILE_SIZE - 5, y + TILE_SIZE - 5);
                    ctx.moveTo(x + TILE_SIZE - 5, y + 5); ctx.lineTo(x + 5, y + TILE_SIZE - 5);
                    ctx.stroke();
                }
            } else if (tile === 7) {

                    ctx.fillStyle = "#440000";
                    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

                    ctx.fillStyle = "#ff4444";
                    ctx.beginPath();
                    ctx.arc(
                        x + TILE_SIZE/2,
                        y + TILE_SIZE/2,
                        5,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                
            } else if (tile === 8) {
                ctx.fillStyle = "rgba(0, 255, 200, 0.15)";
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = THEME.colors.playerAvatar;
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 3, y + 3, TILE_SIZE - 6, TILE_SIZE - 6);
            }
        }
    }

    // LAYER 4: Render Perimeter Wall Outline Vectors
    ctx.lineWidth = 1.5;

    for (let seg of wallSegments) {

        ctx.strokeStyle =
            seg.isCrate
                ? "#5a3818"
                : THEME.colors.wallOutline;

        ctx.beginPath();
        ctx.moveTo(seg.start.x, seg.start.y);
        ctx.lineTo(seg.end.x, seg.end.y);
        ctx.stroke();
    }

    // LAYER 5: Draw Shifting Gate Dividers
    doors.forEach(d => {
        let doorColor = "#ff00f2";

        if (d.type === "SECURITY") {

            if (d.securityColor === "BLUE")
                doorColor = "#3a7cff";

            if (d.securityColor === "RED")
                doorColor = "#ff4444";

            if (d.securityColor === "GREEN")
                doorColor = "#44ff44";
        }

        ctx.strokeStyle =
            d.state === "LOCKED"
                ? doorColor
                : "rgba(0,255,200,0.15)";
        ctx.lineWidth = d.state === "LOCKED" ? 3 : 1;
        
        ctx.beginPath();

        switch(d.edge){

            case "LEFT":
                ctx.moveTo(d.x, d.y);
                ctx.lineTo(d.x, d.y + TILE_SIZE);
                break;

            case "RIGHT":
                ctx.moveTo(d.x + TILE_SIZE, d.y);
                ctx.lineTo(d.x + TILE_SIZE, d.y + TILE_SIZE);
                break;

            case "TOP":
                ctx.moveTo(d.x, d.y);
                ctx.lineTo(d.x + TILE_SIZE, d.y);
                break;

            case "BOTTOM":
                ctx.moveTo(d.x, d.y + TILE_SIZE);
                ctx.lineTo(d.x + TILE_SIZE, d.y + TILE_SIZE);
                break;
        }
        ctx.stroke();


    });

    // LAYER 6: Pickups
    for (let it of items) {

        if (it.type === "CREDIT") {

            ctx.fillStyle = "#ffd700";

            ctx.beginPath();
            ctx.arc(
                it.x,
                it.y,
                6,
                0,
                Math.PI * 2
            );
            ctx.fill();

            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1;
            ctx.stroke();

        }
        else if (it.type === "KEYCARD") {

            if (it.color === "BLUE")
                ctx.fillStyle = "#3a7cff";
            else if (it.color === "RED")
                ctx.fillStyle = "#ff4444";
            else
                ctx.fillStyle = "#44ff44";

            ctx.fillRect(
                it.x - 8,
                it.y - 5,
                16,
                10
            );

            ctx.fillStyle = "#111";
            ctx.fillRect(
                it.x + 2,
                it.y - 3,
                4,
                3
            );
            
        }
    }

    // LAYER 7: Threats & Red Dashed FOV Cones
    for (let e of enemies) {
        if (e.health <= 0) continue;
        let enemyIsCloaked =
            e.type === "CLOAKED" &&
            (e.cloakTimer % 240) < 120;

        if (enemyIsCloaked)
            continue;

        ctx.save();
        ctx.strokeStyle = e.state === "CHASE" ? "rgba(255, 0, 0, 0.85)" : "rgba(255, 30, 30, 0.5)";
        ctx.lineWidth = e.state === "CHASE" ? 2 : 1.5;
        ctx.setLineDash([4, 4]);

        let coneResolution = 24;
        let halfFov = e.fovAngle / 2;
        let step = e.fovAngle / coneResolution;

        ctx.beginPath();
        ctx.moveTo(e.x, e.y);

        for (let a = -halfFov; a <= halfFov; a += step) {
            let currentRayAngle = e.angle + a;
            let targetMaxPoint = {
                x: e.x + Math.cos(currentRayAngle) * e.viewDist,
                y: e.y + Math.sin(currentRayAngle) * e.viewDist
            };

            let closestObstacle = null;
            for (let seg of wallSegments) {
                // FIXED: Direct variable fields now pass standard p1-p4 references smoothly
                let hit = checkLineIntercept({ x: e.x, y: e.y }, targetMaxPoint, seg.start, seg.end);
                if (hit) {
                    if (!closestObstacle || hit.dist < closestObstacle.dist) closestObstacle = hit;
                }
            }

            if (closestObstacle) {
                ctx.lineTo(closestObstacle.x, closestObstacle.y);
            } else {
                ctx.lineTo(targetMaxPoint.x, targetMaxPoint.y);
            }
        }

        ctx.lineTo(e.x, e.y);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
        
        ctx.beginPath(); ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fillStyle = e.color; ctx.fill(); 
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.closePath();
        let barWidth = 28;
        let barHeight = 4;

        ctx.fillStyle = "#222";

        ctx.fillRect(
            e.x - barWidth / 2,
            e.y - e.radius - 12,
            barWidth,
            barHeight
        );

        ctx.fillStyle = "#ff3333";

        ctx.fillRect(
            e.x - barWidth / 2,
            e.y - e.radius - 12,
            barWidth * (e.health / e.maxHp),
            barHeight
        );
        
    }

    

    // LAYER 8: Laser Bullet Projectiles
    for (let b of bullets) {
        ctx.fillStyle = b.isEnemyBullet ? THEME.colors.textAlert : THEME.colors.playerAvatar;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    
    ctx.restore();
    // LAYER 9: Player Avatar, HP Bar, Shield Bar, and Aim Line
    let screenPlayerX = playerX + offsetX;
    let screenPlayerY = playerY + offsetY;

    // Shield Ring
    if (powerups.shieldHealth > 0) {

        ctx.beginPath();

        ctx.arc(
            screenPlayerX,
            screenPlayerY,
            playerRadius + 5,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle = "#66ffff";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Player Body
    ctx.beginPath();

    ctx.arc(
        screenPlayerX,
        screenPlayerY,
        playerRadius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        powerups.invisibilityTimer > 0
            ? THEME.colors.playerInvis
            : THEME.colors.playerAvatar;

    ctx.fill();

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Bars
    let hpBarWidth = 34;
    let hpBarHeight = 5;

    // Shield Bar
    if (powerups.shieldHealth > 0) {

        ctx.fillStyle = "#222";

        ctx.fillRect(
            screenPlayerX - hpBarWidth / 2,
            screenPlayerY - playerRadius - 22,
            hpBarWidth,
            hpBarHeight
        );

        ctx.fillStyle = "#66ffff";

        ctx.fillRect(
            screenPlayerX - hpBarWidth / 2,
            screenPlayerY - playerRadius - 22,
            hpBarWidth *
            (powerups.shieldHealth / 100),
            hpBarHeight
        );
    }

    // HP Bar
    ctx.fillStyle = "#222";

    ctx.fillRect(
        screenPlayerX - hpBarWidth / 2,
        screenPlayerY - playerRadius - 14,
        hpBarWidth,
        hpBarHeight
    );

    let hpPercent = playerHealth / maxHealth;

    if (hpPercent > 0.6)
        ctx.fillStyle = "#00ff66";
    else if (hpPercent > 0.3)
        ctx.fillStyle = "#ffaa00";
    else
        ctx.fillStyle = "#ff3333";

    ctx.fillRect(
        screenPlayerX - hpBarWidth / 2,
        screenPlayerY - playerRadius - 14,
        hpBarWidth * hpPercent,
        hpBarHeight
    );

    // Aim Line
    ctx.beginPath();

    ctx.moveTo(
        screenPlayerX,
        screenPlayerY
    );

    ctx.lineTo(
        screenPlayerX +
            Math.cos(playerAngle) * 22,
        screenPlayerY +
            Math.sin(playerAngle) * 22
    );

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // LAYER 10: HUD Top Panel Display
    ctx.fillStyle = "rgba(4, 4, 10, 0.95)";
    ctx.fillRect(0, 0, canvas.width, 90);

    ctx.font = THEME.fonts.hudText;
    ctx.fillStyle = "#ffffff";

    // LEFT SIDE
    ctx.textAlign = "left";

    ctx.fillText(
        `HP: ${playerHealth}/${maxHealth}    $${credits}    SCORE: ${score}    DMG x${upgrades.damageMultiplier.toFixed(1)}`,
        20,
        28
    );
    let activeLayerName =
        HARDCODED_LEVELS[currentLayer]
            ? HARDCODED_LEVELS[currentLayer].name
            : "UNKNOWN";
    ctx.fillText(
        `LAYER ${currentLayer} - ${activeLayerName}`,
        20,
        52
    );

    // KEYCARDS CENTER
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";

    ctx.fillText(
        "KEYCARDS",
        canvas.width / 2,
        16
    );
    let cardX = canvas.width / 2 - 50;

    if (keycards.BLUE) {

        ctx.fillStyle = "#3a7cff";
        ctx.fillRect(cardX, 28, 24, 16);

        ctx.strokeStyle = "#ffffff";
        ctx.strokeRect(cardX, 28, 24, 16);
        ctx.fillStyle = "#111";

        ctx.fillRect(cardX + 16, 30, 4, 3);
        cardX += 35;
    }

    if (keycards.RED) {

        ctx.fillStyle = "#ff4444";
        ctx.fillRect(cardX, 28, 24, 16);

        ctx.strokeStyle = "#ffffff";
        ctx.strokeRect(cardX, 28, 24, 16);
        ctx.fillStyle = "#111";

        ctx.fillRect(cardX + 16, 30, 4, 3);
        cardX += 35;
    }

    if (keycards.GREEN) {

        ctx.fillStyle = "#44ff44";
        ctx.fillRect(cardX, 28, 24, 16);

        ctx.strokeStyle = "#ffffff";
        ctx.strokeRect(cardX, 28, 24, 16);
        ctx.fillStyle = "#111";

        ctx.fillRect(cardX + 16, 30, 4, 3);
        cardX += 35;
    }

// RIGHT SIDE
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "right";

    ctx.fillText(
        `TIME: ${gameTimer}s`,
        canvas.width - 20,
        28
    );

    ctx.fillText(
        `CLOAKS: ${powerups.cloakCharges}`,
        canvas.width - 20,
        48
    );

    if (powerups.invisibilityTimer > 0) {

        ctx.fillText(
            `ACTIVE: ${Math.ceil(powerups.invisibilityTimer / 60)}s`,
            canvas.width - 20,
            68
        );
    }

    

    // LAYER 11: Menu Overlays
    if (gameStatus === "MARKETPLACE") {
        ctx.fillStyle = THEME.colors.shopBg; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = THEME.colors.playerAvatar; ctx.font = THEME.fonts.overlayTitle; ctx.textAlign = "center";
        
        let lx = canvas.width / 2 - 220;
        let sy = 280;

        // Title
        ctx.textAlign = "center";

        ctx.fillStyle = "#00ffcc";
        ctx.font = THEME.fonts.overlayTitle;

        ctx.fillText(
            "MARKETPLACE",
            canvas.width / 2,
            120
        );

        // Subtitle
        ctx.fillStyle = "#ffffff";
        ctx.font = THEME.fonts.overlaySub;

        ctx.fillText(
            "Upgrade Terminal",
            canvas.width / 2,
            165
        );

        // Credits
        ctx.fillStyle = "#ffd700";
        ctx.font = THEME.fonts.shopItem;

        ctx.fillText(
            `$${credits} Credits Available`,
            canvas.width / 2,
            210
        );

        // Shop items start below
        ctx.textAlign = "left";
        ctx.fillStyle = "#ffffff";

        ctx.fillStyle = "#ffffff";

        ctx.fillText("[1] DAMAGE BOOST", lx, sy);
        ctx.fillStyle = "#888";
        ctx.fillText("+50% weapon damage", lx + 25, sy + 20);
        ctx.fillStyle = "#00ffcc";
        ctx.fillText("$75", lx + 300, sy);

        ctx.fillStyle = "#ffffff";
        ctx.fillText("[2] TRI-SHOOTER", lx, sy + 60);
        ctx.fillStyle = "#888";
        ctx.fillText("fires 3 projectiles", lx + 25, sy + 80);
        ctx.fillStyle = "#00ffcc";
        ctx.fillText("$150", lx + 300, sy + 60);

        ctx.fillStyle = "#ffffff";
        ctx.fillText("[3] MEDICAL PATCH", lx, sy + 120);
        ctx.fillStyle = "#888";
        ctx.fillText("restore 40 HP", lx + 25, sy + 140);
        ctx.fillStyle = "#00ffcc";
        ctx.fillText("$50", lx + 300, sy + 120);

        ctx.fillStyle = "#ffffff";
        ctx.fillText("[4] SHIELD CELL", lx, sy + 180);
        ctx.fillStyle = "#888";
        ctx.fillText("restore 100 shield", lx + 25, sy + 200);
        ctx.fillStyle = "#00ffcc";
        ctx.fillText("$80", lx + 300, sy + 180);

        ctx.fillStyle = "#ffffff";
        ctx.fillText("[5] CLOAK CHARGE", lx, sy + 240);
        ctx.fillStyle = "#888";
        ctx.fillText("+1 cloak use", lx + 25, sy + 260);
        ctx.fillStyle = "#00ffcc";
        ctx.fillText("$100", lx + 300, sy + 240);

        ctx.textAlign = "center";
        ctx.fillStyle = "#ffffff";

        ctx.fillText(
            "[ENTER] Deploy to Next Layer",
            canvas.width / 2,
            canvas.height - 70
        );
    }

    if (gameStatus === "PAUSED") {
        ctx.fillStyle = "rgba(2, 2, 5, 0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.textAlign = "center";

        ctx.fillStyle = THEME.colors.playerAvatar;
        ctx.font = THEME.fonts.overlayTitle;

        ctx.fillText(
            "OPERATION PAUSED",
            canvas.width / 2,
            canvas.height / 2 - 80
        );

        ctx.fillStyle = "#ffffff";
        ctx.font = THEME.fonts.overlaySub;

        ctx.fillText(
            `Current Layer : ${currentLayer}`,
            canvas.width / 2,
            canvas.height / 2 - 10
        );

        ctx.fillText(
            `Credits : $${credits}`,
            canvas.width / 2,
            canvas.height / 2 + 20
        );

        ctx.fillText(
            `Score : ${score}`,
            canvas.width / 2,
            canvas.height / 2 + 50
        );

        ctx.fillText(
            "[P] Resume    [R] Restart",
            canvas.width / 2,
            canvas.height / 2 + 100
        );
    }

    if (gameStatus === "GAME_OVER") {
        ctx.fillStyle = "rgba(20, 0, 0, 0.90)";
        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.textAlign = "center";

        ctx.fillStyle = "#ff4444";
        ctx.font = THEME.fonts.overlayTitle;
        ctx.fillText(
            "MISSION FAILED",
            canvas.width / 2,
            canvas.height / 2 - 120
        );
        ctx.fillStyle = "#ffffff";
        ctx.font = THEME.fonts.overlaySub;
        ctx.fillText(
            `Layer Reached : ${currentLayer}`,
            canvas.width / 2,
            canvas.height / 2 - 30
        );

        ctx.fillText(
            `Final Score : ${score}`,
            canvas.width / 2,
            canvas.height / 2 + 5
        );

        ctx.fillText(
            `Credits Earned : ${credits}`,
            canvas.width / 2,
            canvas.height / 2 + 40
        );

        ctx.fillText(
            `Runtime : ${gameTimer}s`,
            canvas.width / 2,
            canvas.height / 2 + 75
        );

        ctx.fillText(
            "[R] Restart Operation",
            canvas.width / 2,
            canvas.height / 2 + 130
        );
    }

    if (gameStatus === "VICTORY") {

        ctx.fillStyle = "rgba(0, 20, 20, 0.90)";
        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.textAlign = "center";

        ctx.fillStyle = "#00ffcc";
        ctx.font = THEME.fonts.overlayTitle;
        ctx.fillText(
            "MISSION COMPLETE",
            canvas.width / 2,
            canvas.height / 2 - 120
        );
        ctx.fillStyle = "#ffffff";
        ctx.font = THEME.fonts.overlaySub;

        ctx.fillText(
            `Final Score : ${score}`,
            canvas.width / 2,
            canvas.height / 2 - 20
        );

        ctx.fillText(
            `Credits Earned : ${credits}`,
            canvas.width / 2,
            canvas.height / 2 + 15
        );

        ctx.fillText(
            `Runtime : ${gameTimer}s`,
            canvas.width / 2,
            canvas.height / 2 + 50
        );

        ctx.fillText(
            "[R] Start New Operation",
            canvas.width / 2,
            canvas.height / 2 + 120
        );
    }
}

function loop() {
    update(); render(); requestAnimationFrame(loop);
}
requestAnimationFrame(loop);