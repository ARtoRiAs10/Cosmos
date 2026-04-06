// CosmosCanvas.jsx — PixiJS renderer with rich 2D office art
import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import useCosmosStore from '../../store/useCosmosStore';
import useKeyboard from '../../hooks/useKeyboard';
import useMovement from '../../hooks/useMovement';
import { PROXIMITY_RADIUS, isWithinProximity } from '../../utils/proximity';

export const CANVAS_W = 1600;
export const CANVAS_H = 1000;
const AVATAR_R = 26;

const hex2n = (h) => parseInt((h || '#6366f1').replace('#', ''), 16);

// ── Room definitions with entry doors ─────────────────────────────────────
const ROOMS = [
  { id: 'room1', label: 'Room 1',  x: 860, y: 60,  w: 380, h: 300 },
  { id: 'room2', label: 'Room 2',  x: 120, y: 60,  w: 380, h: 300 },
  { id: 'lounge', label: 'Lounge', x: 580, y: 520, w: 260, h: 200 },
];

// ── Draw plank wood floor ─────────────────────────────────────────────────
const drawFloor = (app) => {
  const g = new PIXI.Graphics();
  const PLANK_H = 60;
  for (let y = 0; y < CANVAS_H; y += PLANK_H) {
    const shade = (Math.floor(y / PLANK_H) % 2 === 0) ? 0xdabd97 : 0xd4b690;
    g.beginFill(shade);
    g.drawRect(0, y, CANVAS_W, PLANK_H);
    g.endFill();
    // Plank divider
    g.lineStyle(1, 0xb8956a, 0.3);
    g.moveTo(0, y);
    g.lineTo(CANVAS_W, y);
    // Plank grain lines
    g.lineStyle(0.5, 0xb08050, 0.1);
    for (let x = 0; x < CANVAS_W; x += 180 + Math.sin(y * 0.1) * 20) {
      g.moveTo(x, y + 6);
      g.lineTo(x + 140, y + 6);
    }
  }
  // subtle vignette border
  g.lineStyle(0);
  g.beginFill(0x000000, 0.06);
  g.drawRect(0, 0, CANVAS_W, 12);
  g.drawRect(0, CANVAS_H - 12, CANVAS_W, 12);
  g.drawRect(0, 0, 12, CANVAS_H);
  g.drawRect(CANVAS_W - 12, 0, 12, CANVAS_H);
  g.endFill();

  app.stage.addChildAt(g, 0);
  return g;
};

// ── Draw 2D chair (top-down view) ─────────────────────────────────────────
const drawChair = (g, cx, cy, angle = 0) => {
  const seat = new PIXI.Graphics();
  // Seat cushion
  seat.beginFill(0x8B6B4A);
  seat.lineStyle(1, 0x6B4F35, 0.8);
  seat.drawRoundedRect(-14, -13, 28, 26, 4);
  seat.endFill();
  // Seat cushion highlight
  seat.beginFill(0xA07850, 0.4);
  seat.drawRoundedRect(-10, -9, 20, 14, 3);
  seat.endFill();
  // Backrest
  seat.beginFill(0x6B4F35);
  seat.lineStyle(1, 0x4A3525, 0.9);
  seat.drawRoundedRect(-14, -20, 28, 8, 3);
  seat.endFill();
  // Chair legs (4 dots)
  const legColor = 0x4A3525;
  [[-10, 10], [10, 10], [-10, -12], [10, -12]].forEach(([lx, ly]) => {
    seat.beginFill(legColor);
    seat.drawCircle(lx, ly, 2.5);
    seat.endFill();
  });
  seat.x = cx;
  seat.y = cy;
  seat.rotation = angle;
  return seat;
};

// ── Draw 2D desk (top-down) ───────────────────────────────────────────────
const drawDesk = (g, x, y, w = 90, h = 55) => {
  // Shadow
  g.beginFill(0x000000, 0.08);
  g.drawRoundedRect(x + 4, y + 4, w, h, 5);
  g.endFill();
  // Desk surface
  g.beginFill(0xC8A878);
  g.lineStyle(1.5, 0x9A7850, 0.9);
  g.drawRoundedRect(x, y, w, h, 5);
  g.endFill();
  // Desk surface texture/grain
  g.lineStyle(0.5, 0xB89060, 0.25);
  for (let gy = y + 10; gy < y + h - 6; gy += 12) {
    g.moveTo(x + 6, gy); g.lineTo(x + w - 6, gy);
  }
  // Monitor
  g.lineStyle(1.5, 0x333333, 0.9);
  g.beginFill(0x1a1a2e);
  g.drawRoundedRect(x + w / 2 - 18, y + 6, 36, 22, 3);
  g.endFill();
  g.beginFill(0x162040);
  g.drawRoundedRect(x + w / 2 - 14, y + 9, 28, 15, 2);
  g.endFill();
  // Monitor stand
  g.beginFill(0x555555);
  g.drawRoundedRect(x + w / 2 - 3, y + 27, 6, 5, 1);
  g.endFill();
  // Keyboard
  g.beginFill(0xdddddd);
  g.lineStyle(1, 0xaaaaaa, 0.8);
  g.drawRoundedRect(x + w / 2 - 16, y + 36, 32, 12, 2);
  g.endFill();
  // Mouse
  g.beginFill(0xfafafa);
  g.lineStyle(0.8, 0xbbbbbb, 0.8);
  g.drawEllipse(x + w / 2 + 24, y + 40, 5, 7);
  g.endFill();
};

// ── Draw 2D plant ────────────────────────────────────────────────────────
const drawPlant = (container, cx, cy) => {
  const g = new PIXI.Graphics();
  // Pot
  g.beginFill(0xb05030);
  g.drawRoundedRect(cx - 8, cy + 4, 16, 12, 2);
  g.endFill();
  g.beginFill(0x904020, 0.6);
  g.drawRect(cx - 8, cy + 4, 16, 3);
  g.endFill();
  // Leaves
  const leafColors = [0x2d8a4e, 0x3aad62, 0x22c55e];
  [[-8, -8, 0.8], [0, -14, 0], [8, -8, -0.8], [-5, -4, 0.4], [5, -4, -0.4]].forEach(([lx, ly, rot], i) => {
    g.beginFill(leafColors[i % 3], 0.9);
    g.drawEllipse(cx + lx, cy + ly, 7, 11);
    g.endFill();
  });
  return g;
};

// ── Draw a door entry ───────────────────────────────────────────────────
const drawDoor = (container, x, y, horizontal = true) => {
  const g = new PIXI.Graphics();
  // Door frame
  g.lineStyle(3, 0x7a5c38, 0.9);
  g.beginFill(0xe8cfa8, 0.5);
  if (horizontal) {
    g.drawRect(x - 20, y - 4, 40, 8);
  } else {
    g.drawRect(x - 4, y - 20, 8, 40);
  }
  g.endFill();
  // Door knob
  g.beginFill(0xd4a017);
  g.lineStyle(0.5, 0xaa7a00);
  g.drawCircle(x + (horizontal ? 10 : 0), y + (horizontal ? 0 : 10), 3);
  g.endFill();
  // Entry label
  const txt = new PIXI.Text('ENTER', {
    fontFamily: 'DM Sans, Arial', fontSize: 9, fontWeight: '700', fill: 0x7a5c38,
  });
  txt.anchor.set(0.5);
  txt.x = x;
  txt.y = horizontal ? y + 16 : y;
  container.addChild(g);
  container.addChild(txt);
};

// ── Draw a small rug / carpet under desk cluster ─────────────────────────
const drawRug = (g, x, y, w, h) => {
  g.beginFill(0xc4956a, 0.25);
  g.lineStyle(2, 0xa07850, 0.3);
  g.drawRoundedRect(x, y, w, h, 8);
  g.endFill();
  // Rug border pattern
  g.lineStyle(1, 0xa07850, 0.2);
  g.drawRoundedRect(x + 6, y + 6, w - 12, h - 12, 5);
};

// ── Draw walls around each room ─────────────────────────────────────────
const drawRoomWalls = (container, room) => {
  const g = new PIXI.Graphics();
  const { x, y, w, h } = room;
  // Room floor (lighter shade)
  g.beginFill(0xe8cfa8, 0.55);
  g.lineStyle(2.5, 0xa8845c, 0.85);
  g.drawRoundedRect(x, y, w, h, 6);
  g.endFill();

  // Wall shadow inside
  g.lineStyle(0);
  g.beginFill(0x000000, 0.04);
  g.drawRoundedRect(x + 2, y + 2, w - 4, h - 4, 4);
  g.endFill();

  container.addChild(g);

  // Room label
  const style = new PIXI.TextStyle({ fontFamily: 'DM Sans, Arial', fontSize: 12, fontWeight: '700', fill: 0x7a5c38 });
  const txt = new PIXI.Text(`🗨 ${room.label}`, style);
  txt.x = x + 10;
  txt.y = y + h - 26;
  container.addChild(txt);

  return g;
};

// ── Full scene: rooms, desks, chairs, plants, doors ─────────────────────
const drawScene = (app) => {
  const container = new PIXI.Container();
  container.name = 'scene';

  // Draw rugs in open area
  const rug = new PIXI.Graphics();
  drawRug(rug, 480, 420, 200, 130);
  drawRug(rug, 850, 400, 200, 150);
  container.addChild(rug);

  for (const room of ROOMS) {
    drawRoomWalls(container, room);

    const g = new PIXI.Graphics();

    // 2 desk clusters per room (left pair, right pair)
    const deskLeft  = { x: room.x + 30,  y: room.y + 50 };
    const deskRight = { x: room.x + room.w - 130, y: room.y + 50 };

    // Draw desks
    drawDesk(g, deskLeft.x,  deskLeft.y);
    drawDesk(g, deskRight.x, deskRight.y);
    drawDesk(g, deskLeft.x,  deskLeft.y + 140);
    drawDesk(g, deskRight.x, deskRight.y + 140);

    container.addChild(g);

    // Draw chairs for each desk
    const chairs = new PIXI.Container();
    // Top row chairs (in front of desk = below it visually)
    const ch1 = drawChair(null, deskLeft.x + 45,  deskLeft.y + 70);
    const ch2 = drawChair(null, deskRight.x + 45, deskRight.y + 70);
    const ch3 = drawChair(null, deskLeft.x + 45,  deskLeft.y + 210);
    const ch4 = drawChair(null, deskRight.x + 45, deskRight.y + 210);
    [ch1, ch2, ch3, ch4].forEach((c) => chairs.addChild(c));
    container.addChild(chairs);

    // Door at bottom center of each room
    drawDoor(container, room.x + room.w / 2, room.y + room.h, true);

    // Plants in corners
    container.addChild(drawPlant(container, room.x + 18, room.y + 22));
    container.addChild(drawPlant(container, room.x + room.w - 18, room.y + 22));
  }

  // Standalone plants in open floor area
  container.addChild(drawPlant(container, 560, 460));
  container.addChild(drawPlant(container, 980, 440));
  container.addChild(drawPlant(container, 200, 480));
  container.addChild(drawPlant(container, 1350, 480));

  // Water cooler
  const cooler = new PIXI.Graphics();
  cooler.beginFill(0x6699cc, 0.7);
  cooler.drawRoundedRect(600, 380, 20, 30, 4);
  cooler.endFill();
  cooler.beginFill(0x99bbee, 0.8);
  cooler.drawEllipse(610, 385, 10, 14);
  cooler.endFill();
  container.addChild(cooler);
  const coolerTxt = new PIXI.Text('💧', { fontSize: 14 });
  coolerTxt.x = 603;
  coolerTxt.y = 360;
  container.addChild(coolerTxt);

  // ── Lounge room — sofa, coffee table ─────────────────────────────────
  const loungeRoom = ROOMS.find(r => r.id === 'lounge');
  if (loungeRoom) {
    const { x: lx, y: ly, w: lw, h: lh } = loungeRoom;
    drawRoomWalls(container, loungeRoom);

    const lg = new PIXI.Graphics();
    // Rug
    lg.beginFill(0xc87070, 0.28);
    lg.lineStyle(1.5, 0xa05050, 0.3);
    lg.drawEllipse(lx + lw/2, ly + lh/2, lw/2 - 20, lh/2 - 18);
    lg.endFill();

    // Coffee table (center oval)
    lg.beginFill(0xc8a260);
    lg.lineStyle(1.5, 0x9a7840, 0.9);
    lg.drawEllipse(lx + lw/2, ly + lh/2, 38, 24);
    lg.endFill();
    // Coffee cups on table
    lg.beginFill(0x8b4513, 0.8);
    lg.drawCircle(lx + lw/2 - 16, ly + lh/2 - 6, 5);
    lg.drawCircle(lx + lw/2 + 14, ly + lh/2 + 4, 5);
    lg.endFill();

    // Sofa (top side — back facing up)
    lg.beginFill(0x3b6ea5, 0.85);
    lg.lineStyle(1.5, 0x2a5080, 0.9);
    lg.drawRoundedRect(lx + 18, ly + 20, lw - 36, 34, 8);
    lg.endFill();
    // Sofa cushion divider
    lg.lineStyle(1, 0x2a5080, 0.4);
    lg.moveTo(lx + lw/2, ly + 20); lg.lineTo(lx + lw/2, ly + 54);
    // Sofa back rest
    lg.beginFill(0x2a5080, 0.6);
    lg.lineStyle(0);
    lg.drawRoundedRect(lx + 18, ly + 14, lw - 36, 10, 4);
    lg.endFill();

    // Small side sofa chairs (left/right)
    lg.beginFill(0x3b6ea5, 0.7);
    lg.lineStyle(1, 0x2a5080, 0.7);
    lg.drawRoundedRect(lx + 12, ly + 70, 40, 50, 6);
    lg.drawRoundedRect(lx + lw - 52, ly + 70, 40, 50, 6);
    lg.endFill();

    // TV / screen on bottom wall of lounge
    lg.beginFill(0x111827);
    lg.lineStyle(2, 0x374151, 0.9);
    lg.drawRoundedRect(lx + lw/2 - 36, ly + lh - 26, 72, 18, 3);
    lg.endFill();
    lg.beginFill(0x1e3a5f, 0.9);
    lg.drawRoundedRect(lx + lw/2 - 32, ly + lh - 23, 64, 12, 2);
    lg.endFill();

    container.addChild(lg);

    const tvLabel = new PIXI.Text('📺', { fontSize: 14 });
    tvLabel.x = lx + lw/2 - 8;
    tvLabel.y = ly + lh - 30;
    container.addChild(tvLabel);

    // Plant in lounge corner
    container.addChild(drawPlant(null, lx + lw - 20, ly + 30));
    container.addChild(drawPlant(null, lx + 20, ly + 30));
  }

  app.stage.addChildAt(container, 1);
  return container;
};

// ── Build avatar container ────────────────────────────────────────────────
const makeAvatar = (session, isMe) => {
  const c = new PIXI.Container();
  c.name = session.userId;

  if (isMe) {
    const ring = new PIXI.Graphics();
    ring.name = 'ring';
    ring.lineStyle(2, 0x3b82f6, 0.3);
    ring.drawCircle(0, 0, PROXIMITY_RADIUS);
    c.addChild(ring);
  }

  // Shadow
  const shadow = new PIXI.Graphics();
  shadow.beginFill(0x000000, 0.15);
  shadow.drawEllipse(0, AVATAR_R + 2, AVATAR_R * 0.85, 6);
  shadow.endFill();
  c.addChild(shadow);

  // Body circle
  const circle = new PIXI.Graphics();
  circle.name = 'body';
  const col = hex2n(session.avatarColor);
  circle.beginFill(col);
  circle.lineStyle(isMe ? 3 : 2.5, 0xffffff, isMe ? 1 : 0.85);
  circle.drawCircle(0, 0, AVATAR_R);
  circle.endFill();
  c.addChild(circle);

  // Initials
  const initials = (session.username || '?').slice(0, 2).toUpperCase();
  const initTxt = new PIXI.Text(initials, {
    fontFamily: 'DM Sans, Arial', fontSize: 12, fontWeight: '700', fill: 0xffffff,
  });
  initTxt.name = 'initials';
  initTxt.anchor.set(0.5);
  c.addChild(initTxt);

  // Name pill
  const nameStyle = new PIXI.TextStyle({ fontFamily: 'DM Sans, Arial', fontSize: 12, fontWeight: '600', fill: 0x111827 });
  const nameTxt = new PIXI.Text(session.username, nameStyle);
  nameTxt.name = 'nametag';
  nameTxt.anchor.set(0.5, 0);
  const pillW = nameTxt.width + 16;
  const pillH = 20;
  const pill = new PIXI.Graphics();
  pill.name = 'pill';
  pill.beginFill(0xffffff, 0.9);
  pill.lineStyle(1, 0xe5e7eb, 1);
  pill.drawRoundedRect(-pillW / 2, AVATAR_R + 6, pillW, pillH, 10);
  pill.endFill();
  c.addChild(pill);
  nameTxt.y = AVATAR_R + 6 + (pillH - nameTxt.height) / 2;
  c.addChild(nameTxt);

  // Status dot
  const dot = new PIXI.Graphics();
  dot.name = 'statusdot';
  dot.beginFill(isMe ? 0x22c55e : 0xfbbf24);
  dot.lineStyle(2, 0xffffff);
  dot.drawCircle(AVATAR_R - 6, -AVATAR_R + 6, 6);
  dot.endFill();
  c.addChild(dot);

  c.x = session.position?.x ?? CANVAS_W / 2;
  c.y = session.position?.y ?? CANVAS_H / 2;
  return c;
};

// ── Proximity group bubble ─────────────────────────────────────────────────
const updateProximityBubble = (stage, players, currentUser) => {
  if (!stage) return;
  const old = stage.getChildByName('proxBubble');
  if (old) stage.removeChild(old);
  if (!currentUser) return;

  const myPos = currentUser.position;
  const nearby = players.filter(
    (p) => p.userId !== currentUser.userId && isWithinProximity(myPos, p.position)
  );
  if (nearby.length === 0) return;

  const group = [{ position: myPos, username: currentUser.username }, ...nearby];
  const xs = group.map((p) => p.position.x);
  const ys = group.map((p) => p.position.y);
  const pad = 56;
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  const maxX = Math.max(...xs) + pad;
  const maxY = Math.max(...ys) + pad;

  const nameStr = group.map((p) => `★ ${p.username}`).join('  ');
  const nameTxt = new PIXI.Text(nameStr, {
    fontFamily: 'DM Sans, Arial', fontSize: 11, fontWeight: '600', fill: 0x374151,
  });
  nameTxt.x = minX + 12;
  nameTxt.y = minY - 22;

  const bubble = new PIXI.Graphics();
  bubble.name = 'proxBubble';
  bubble.beginFill(0xfef9c3, 0.6);
  bubble.lineStyle(2, 0xf59e0b, 0.55);
  bubble.drawRoundedRect(minX, minY, maxX - minX, maxY - minY, 22);
  bubble.endFill();
  bubble.addChild(nameTxt);

  stage.addChildAt(bubble, 2);
};

// ── Main component ─────────────────────────────────────────────────────────
const CosmosCanvas = () => {
  const mountRef = useRef(null);
  const appRef = useRef(null);
  const avatarMap = useRef({});

  const { players, currentUser, handRaised, currentReaction } = useCosmosStore();
  const keysRef = useKeyboard();
  const { tick } = useMovement(keysRef);

  // 1. Init PixiJS
  useEffect(() => {
    const parent = mountRef.current;
    if (!parent) return;

    const app = new PIXI.Application({
      width: CANVAS_W, height: CANVAS_H,
      backgroundColor: 0xdfc4a0,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    parent.appendChild(app.view);
    appRef.current = app;

    drawFloor(app);
    drawScene(app);
    app.ticker.add(tick);

    return () => {
      if (app.ticker) app.ticker.remove(tick);
      app.destroy(true, { children: true });
      appRef.current = null;
      if (parent && app.view && parent.contains(app.view)) parent.removeChild(app.view);
    };
  }, []); // eslint-disable-line

  // 2. Sync tick
  useEffect(() => {
    const app = appRef.current;
    if (!app || !app.ticker) return;
    app.ticker.remove(tick);
    app.ticker.add(tick);
    return () => { if (app && app.ticker) app.ticker.remove(tick); };
  }, [tick]);

  // 3. Sync players → avatars + reactions/hand
  useEffect(() => {
    const app = appRef.current;
    if (!app || !app.stage || !currentUser) return;

    const liveIds = new Set(players.map((p) => p.userId));
    const existing = new Set(Object.keys(avatarMap.current));

    for (const uid of existing) {
      if (!liveIds.has(uid)) {
        const c = avatarMap.current[uid];
        if (c) { app.stage.removeChild(c); c.destroy({ children: true }); }
        delete avatarMap.current[uid];
      }
    }

    for (const session of players) {
      const isMe = session.userId === currentUser.userId;
      const srcPos = isMe ? currentUser.position : session.position;

      if (!avatarMap.current[session.userId]) {
        const c = makeAvatar(session, isMe);
        app.stage.addChild(c);
        avatarMap.current[session.userId] = c;
      } else {
        const c = avatarMap.current[session.userId];
        c.x += (srcPos.x - c.x) * (isMe ? 0.5 : 0.25);
        c.y += (srcPos.y - c.y) * (isMe ? 0.5 : 0.25);

        // Show hand raised indicator above avatar
        const existingHand = c.getChildByName('handIcon');
        if (isMe && handRaised) {
          if (!existingHand) {
            const handTxt = new PIXI.Text('✋', { fontSize: 18 });
            handTxt.name = 'handIcon';
            handTxt.anchor.set(0.5);
            handTxt.y = -(AVATAR_R + 22);
            c.addChild(handTxt);
          }
        } else if (existingHand) {
          c.removeChild(existingHand);
          existingHand.destroy();
        }

        // Show reaction bubble
        const existingReact = c.getChildByName('reactionBubble');
        if (isMe && currentReaction) {
          if (!existingReact) {
            const reactTxt = new PIXI.Text(currentReaction, { fontSize: 22 });
            reactTxt.name = 'reactionBubble';
            reactTxt.anchor.set(0.5);
            reactTxt.y = -(AVATAR_R + 40);
            c.addChild(reactTxt);
          }
        } else if (existingReact) {
          c.removeChild(existingReact);
          existingReact.destroy();
        }
      }
    }

    if (currentUser && avatarMap.current[currentUser.userId]) {
      const me = avatarMap.current[currentUser.userId];
      me.x += (currentUser.position.x - me.x) * 0.5;
      me.y += (currentUser.position.y - me.y) * 0.5;
    }

    updateProximityBubble(app.stage, players, currentUser);
  }, [players, currentUser, handRaised, currentReaction]);

  return (
    <div ref={mountRef} className="w-full h-full" style={{ lineHeight: 0 }} />
  );
};

export default CosmosCanvas;
