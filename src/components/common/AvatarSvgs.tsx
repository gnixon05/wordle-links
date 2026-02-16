/* eslint-disable react-refresh/only-export-components */
import React from 'react';

// ─── Golf Ball Helpers ───────────────────────────────────────────────
// Every golf ball shares a base: white circle with dimples and a cute face.

function GolfBallBase() {
  return (
    <>
      {/* Shadow */}
      <ellipse cx={50} cy={92} rx={22} ry={5} fill="#ccc" opacity={0.4} />
      {/* Ball body */}
      <circle cx={50} cy={50} r={30} fill="#f5f5f0" stroke="#ccc" strokeWidth={1.2} />
      {/* Dimples */}
      <circle cx={42} cy={38} r={1.8} fill="#ddd" />
      <circle cx={55} cy={35} r={1.8} fill="#ddd" />
      <circle cx={48} cy={45} r={1.6} fill="#ddd" />
      <circle cx={60} cy={44} r={1.6} fill="#ddd" />
      <circle cx={38} cy={50} r={1.5} fill="#ddd" />
      <circle cx={53} cy={52} r={1.5} fill="#ddd" />
      {/* Eyes */}
      <circle cx={43} cy={52} r={2.2} fill="#333" />
      <circle cx={57} cy={52} r={2.2} fill="#333" />
      {/* Eye highlights */}
      <circle cx={44} cy={51} r={0.8} fill="#fff" />
      <circle cx={58} cy={51} r={0.8} fill="#fff" />
      {/* Mouth – a small happy curve */}
      <path d="M46 58 Q50 62 54 58" fill="none" stroke="#333" strokeWidth={1.2} strokeLinecap="round" />
    </>
  );
}

// ─── Penguin Helper ──────────────────────────────────────────────────
// Every penguin shares a round body, white belly, orange beak and feet.

function PenguinBase({ expression }: { expression?: 'happy' | 'focus' | 'frustrated' | 'cool' | 'celebrating' }) {
  const mouthPath = (() => {
    switch (expression) {
      case 'focus':
        return <ellipse cx={50} cy={56} rx={2} ry={1.2} fill="#333" />;
      case 'frustrated':
        return <path d="M46 57 Q50 54 54 57" fill="none" stroke="#333" strokeWidth={1.2} strokeLinecap="round" />;
      case 'cool':
        return <path d="M46 56 Q50 60 54 56" fill="none" stroke="#333" strokeWidth={1.2} strokeLinecap="round" />;
      case 'celebrating':
        return <ellipse cx={50} cy={57} rx={3} ry={2.5} fill="#333" />;
      case 'happy':
      default:
        return <path d="M46 56 Q50 61 54 56" fill="none" stroke="#333" strokeWidth={1.2} strokeLinecap="round" />;
    }
  })();

  return (
    <>
      {/* Shadow */}
      <ellipse cx={50} cy={93} rx={20} ry={4} fill="#999" opacity={0.3} />
      {/* Feet */}
      <ellipse cx={40} cy={90} rx={7} ry={3} fill="#f5a623" stroke="#d4891a" strokeWidth={0.8} />
      <ellipse cx={60} cy={90} rx={7} ry={3} fill="#f5a623" stroke="#d4891a" strokeWidth={0.8} />
      {/* Body */}
      <ellipse cx={50} cy={62} rx={24} ry={30} fill="#1a1a2e" />
      {/* White belly */}
      <ellipse cx={50} cy={65} rx={16} ry={22} fill="#f0f0f0" />
      {/* Head */}
      <circle cx={50} cy={38} r={18} fill="#1a1a2e" />
      {/* Face / white area around eyes */}
      <ellipse cx={50} cy={42} rx={12} ry={9} fill="#f0f0f0" />
      {/* Eyes */}
      {expression !== 'cool' && (
        <>
          <circle cx={44} cy={42} r={2.8} fill="#333" />
          <circle cx={56} cy={42} r={2.8} fill="#333" />
          <circle cx={45} cy={41} r={1} fill="#fff" />
          <circle cx={57} cy={41} r={1} fill="#fff" />
        </>
      )}
      {/* Beak */}
      <path d="M46 48 L50 54 L54 48 Z" fill="#f5a623" stroke="#d4891a" strokeWidth={0.6} />
      {/* Mouth / expression */}
      {mouthPath}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// GOLF BALL AVATARS
// ═══════════════════════════════════════════════════════════════════════

function GolfBallCowboy() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <GolfBallBase />
      {/* Cowboy hat brim */}
      <ellipse cx={50} cy={28} rx={28} ry={6} fill="#8B5E3C" stroke="#6B3F1F" strokeWidth={1} />
      {/* Hat crown */}
      <path d="M34 28 Q34 10 50 8 Q66 10 66 28" fill="#A0704A" stroke="#6B3F1F" strokeWidth={1} />
      {/* Hat band */}
      <rect x={35} y={24} width={30} height={4} rx={1} fill="#6B3F1F" />
      {/* Lasso */}
      <circle cx={78} cy={55} r={8} fill="none" stroke="#C8A96E" strokeWidth={2} />
      <path d="M70 55 Q65 60 62 55" fill="none" stroke="#C8A96E" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

function GolfBallPirate() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <GolfBallBase />
      {/* Eye patch strap */}
      <line x1={30} y1={46} x2={70} y2={46} stroke="#222" strokeWidth={1.8} />
      {/* Eye patch over left eye */}
      <ellipse cx={43} cy={52} rx={5} ry={5} fill="#222" />
      {/* Pirate hat */}
      <path d="M25 30 Q50 5 75 30 Q60 25 50 28 Q40 25 25 30 Z" fill="#222" stroke="#111" strokeWidth={0.8} />
      {/* Skull on hat */}
      <circle cx={50} cy={20} r={4} fill="#fff" />
      <circle cx={48} cy={19} r={0.8} fill="#222" />
      <circle cx={52} cy={19} r={0.8} fill="#222" />
      <rect x={48} y={23} width={4} height={3} rx={0.5} fill="#fff" />
      {/* Crossbones */}
      <line x1={44} y1={24} x2={56} y2={18} stroke="#fff" strokeWidth={1.2} strokeLinecap="round" />
      <line x1={44} y1={18} x2={56} y2={24} stroke="#fff" strokeWidth={1.2} strokeLinecap="round" />
    </svg>
  );
}

function GolfBallWizard() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <GolfBallBase />
      {/* Wizard hat */}
      <path d="M30 35 L50 0 L70 35 Z" fill="#5B3F9E" stroke="#3E2A6E" strokeWidth={1} />
      {/* Hat brim */}
      <ellipse cx={50} cy={35} rx={24} ry={5} fill="#6B4FB5" stroke="#3E2A6E" strokeWidth={0.8} />
      {/* Stars on hat */}
      <polygon points="45,12 46,15 49,15 47,17 48,20 45,18 42,20 43,17 41,15 44,15" fill="#FFD700" />
      <polygon points="58,20 59,22 61,22 59.5,23.5 60,26 58,24.5 56,26 56.5,23.5 55,22 57,22" fill="#FFD700" />
      <circle cx={52} cy={8} r={1.5} fill="#FFD700" />
      {/* Wand */}
      <line x1={72} y1={40} x2={82} y2={65} stroke="#8B6B3D" strokeWidth={2} strokeLinecap="round" />
      {/* Wand tip sparkle */}
      <circle cx={72} cy={40} r={3} fill="#FFD700" opacity={0.8} />
      <circle cx={72} cy={40} r={1.5} fill="#FFF" />
    </svg>
  );
}

function GolfBallNinja() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx={50} cy={92} rx={22} ry={5} fill="#ccc" opacity={0.4} />
      {/* Ball body */}
      <circle cx={50} cy={50} r={30} fill="#f5f5f0" stroke="#ccc" strokeWidth={1.2} />
      {/* Dimples (visible above mask) */}
      <circle cx={42} cy={30} r={1.8} fill="#ddd" />
      <circle cx={55} cy={28} r={1.8} fill="#ddd" />
      {/* Ninja mask – wraps around middle of ball */}
      <path d="M20 42 Q20 38 50 36 Q80 38 80 42 L80 56 Q80 60 50 62 Q20 60 20 56 Z" fill="#2a2a2a" />
      {/* Mask tail flowing to the right */}
      <path d="M75 44 Q85 42 90 35 Q88 38 92 32" fill="none" stroke="#2a2a2a" strokeWidth={4} strokeLinecap="round" />
      <path d="M75 48 Q84 48 88 42" fill="none" stroke="#2a2a2a" strokeWidth={3} strokeLinecap="round" />
      {/* Eyes visible through mask slit */}
      <circle cx={42} cy={48} r={3} fill="#fff" />
      <circle cx={58} cy={48} r={3} fill="#fff" />
      <circle cx={43} cy={48} r={1.8} fill="#333" />
      <circle cx={59} cy={48} r={1.8} fill="#333" />
      {/* Eye highlights */}
      <circle cx={44} cy={47} r={0.6} fill="#fff" />
      <circle cx={60} cy={47} r={0.6} fill="#fff" />
    </svg>
  );
}

function GolfBallAstronaut() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx={50} cy={92} rx={26} ry={5} fill="#ccc" opacity={0.4} />
      {/* Ball body */}
      <circle cx={50} cy={50} r={30} fill="#f5f5f0" stroke="#ccc" strokeWidth={1.2} />
      {/* Dimples */}
      <circle cx={42} cy={38} r={1.8} fill="#ddd" />
      <circle cx={55} cy={35} r={1.8} fill="#ddd" />
      <circle cx={48} cy={45} r={1.6} fill="#ddd" />
      {/* Helmet (glass dome) */}
      <circle cx={50} cy={46} r={34} fill="none" stroke="#b0b0b0" strokeWidth={2.5} />
      <circle cx={50} cy={46} r={34} fill="rgba(180,220,255,0.15)" />
      {/* Helmet rim at bottom */}
      <path d="M18 58 Q18 68 50 70 Q82 68 82 58" fill="none" stroke="#999" strokeWidth={2.5} />
      {/* Visor reflection */}
      <path d="M28 36 Q32 28 42 30" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={2} strokeLinecap="round" />
      {/* Eyes (show through helmet) */}
      <circle cx={43} cy={52} r={2.2} fill="#333" />
      <circle cx={57} cy={52} r={2.2} fill="#333" />
      <circle cx={44} cy={51} r={0.8} fill="#fff" />
      <circle cx={58} cy={51} r={0.8} fill="#fff" />
      {/* Mouth */}
      <path d="M46 58 Q50 62 54 58" fill="none" stroke="#333" strokeWidth={1.2} strokeLinecap="round" />
      {/* Antenna on top */}
      <line x1={50} y1={12} x2={50} y2={4} stroke="#999" strokeWidth={1.5} />
      <circle cx={50} cy={3} r={2} fill="#ff4444" />
    </svg>
  );
}

function GolfBallChef() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <GolfBallBase />
      {/* Chef hat (toque) */}
      <rect x={35} y={20} width={30} height={12} rx={2} fill="#fff" stroke="#ddd" strokeWidth={0.8} />
      {/* Puffy top of toque */}
      <circle cx={42} cy={14} r={9} fill="#fff" stroke="#ddd" strokeWidth={0.8} />
      <circle cx={58} cy={14} r={9} fill="#fff" stroke="#ddd" strokeWidth={0.8} />
      <circle cx={50} cy={10} r={10} fill="#fff" stroke="#ddd" strokeWidth={0.8} />
      {/* Hat band */}
      <rect x={35} y={28} width={30} height={3} rx={1} fill="#e0e0e0" />
      {/* Whisk */}
      <line x1={76} y1={42} x2={80} y2={68} stroke="#aaa" strokeWidth={1.8} strokeLinecap="round" />
      {/* Whisk loops */}
      <ellipse cx={77} cy={40} rx={3} ry={6} fill="none" stroke="#aaa" strokeWidth={1} transform="rotate(-10 77 40)" />
      <ellipse cx={79} cy={40} rx={3} ry={6} fill="none" stroke="#aaa" strokeWidth={1} transform="rotate(5 79 40)" />
      <ellipse cx={75} cy={40} rx={3} ry={6} fill="none" stroke="#aaa" strokeWidth={1} transform="rotate(-20 75 40)" />
    </svg>
  );
}

function GolfBallDetective() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <GolfBallBase />
      {/* Fedora hat brim */}
      <ellipse cx={50} cy={28} rx={28} ry={5} fill="#8B6B3D" stroke="#6B4E2A" strokeWidth={0.8} />
      {/* Fedora crown */}
      <path d="M33 28 Q33 14 50 12 Q67 14 67 28" fill="#A07B4A" stroke="#6B4E2A" strokeWidth={0.8} />
      {/* Hat crease */}
      <path d="M38 20 Q50 24 62 20" fill="none" stroke="#8B6B3D" strokeWidth={1.5} />
      {/* Hat band */}
      <rect x={34} y={25} width={32} height={3} rx={1} fill="#5A3D1A" />
      {/* Magnifying glass handle */}
      <line x1={74} y1={62} x2={82} y2={76} stroke="#8B6B3D" strokeWidth={2.5} strokeLinecap="round" />
      {/* Magnifying glass rim */}
      <circle cx={70} cy={56} r={9} fill="rgba(200,230,255,0.3)" stroke="#8B6B3D" strokeWidth={2} />
      {/* Glass shine */}
      <path d="M64 52 Q66 50 68 52" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1} strokeLinecap="round" />
    </svg>
  );
}

function GolfBallSuperhero() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Cape flowing behind */}
      <path d="M35 50 Q20 55 18 80 Q30 75 40 82 Q45 70 50 68 Q55 70 60 82 Q70 75 82 80 Q80 55 65 50" fill="#e23030" opacity={0.9} />
      <path d="M35 50 Q28 55 22 75" fill="none" stroke="#c42020" strokeWidth={0.8} />
      <path d="M65 50 Q72 55 78 75" fill="none" stroke="#c42020" strokeWidth={0.8} />
      <GolfBallBase />
      {/* Domino mask */}
      <path d="M32 48 Q38 44 43 48 Q47 50 50 50 Q53 50 57 48 Q62 44 68 48 Q62 54 57 52 Q53 50 50 50 Q47 50 43 52 Q38 54 32 48 Z" fill="#e23030" stroke="#c42020" strokeWidth={0.6} />
      {/* Eyes visible through mask */}
      <circle cx={43} cy={50} r={2} fill="#fff" />
      <circle cx={57} cy={50} r={2} fill="#fff" />
      <circle cx={43.5} cy={50} r={1.2} fill="#333" />
      <circle cx={57.5} cy={50} r={1.2} fill="#333" />
    </svg>
  );
}

function GolfBallViking() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <GolfBallBase />
      {/* Viking helmet */}
      <path d="M28 38 Q28 18 50 14 Q72 18 72 38" fill="#888" stroke="#666" strokeWidth={1} />
      {/* Helmet rim */}
      <rect x={27} y={35} width={46} height={5} rx={2} fill="#777" stroke="#555" strokeWidth={0.8} />
      {/* Helmet nose guard */}
      <rect x={48} y={35} width={4} height={14} rx={1} fill="#888" stroke="#666" strokeWidth={0.6} />
      {/* Left horn */}
      <path d="M28 32 Q18 20 14 8 Q20 16 24 28" fill="#E8D88C" stroke="#C4B060" strokeWidth={1} />
      {/* Right horn */}
      <path d="M72 32 Q82 20 86 8 Q80 16 76 28" fill="#E8D88C" stroke="#C4B060" strokeWidth={1} />
      {/* Horn stripes */}
      <path d="M22 24 Q20 22 18 16" fill="none" stroke="#C4B060" strokeWidth={0.8} />
      <path d="M78 24 Q80 22 82 16" fill="none" stroke="#C4B060" strokeWidth={0.8} />
    </svg>
  );
}

function GolfBallCrown() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <GolfBallBase />
      {/* Crown base */}
      <rect x={32} y={24} width={36} height={10} rx={1} fill="#FFD700" stroke="#DAA520" strokeWidth={0.8} />
      {/* Crown points */}
      <path d="M32 24 L30 10 L40 20 L50 6 L60 20 L70 10 L68 24" fill="#FFD700" stroke="#DAA520" strokeWidth={0.8} />
      {/* Jewels on points */}
      <circle cx={30} cy={10} r={2.5} fill="#e23030" stroke="#b01010" strokeWidth={0.5} />
      <circle cx={50} cy={6} r={2.5} fill="#3070e2" stroke="#1050b0" strokeWidth={0.5} />
      <circle cx={70} cy={10} r={2.5} fill="#30e230" stroke="#10b010" strokeWidth={0.5} />
      {/* Jewels on band */}
      <circle cx={42} cy={29} r={2} fill="#e23030" stroke="#b01010" strokeWidth={0.4} />
      <circle cx={50} cy={29} r={2} fill="#3070e2" stroke="#1050b0" strokeWidth={0.4} />
      <circle cx={58} cy={29} r={2} fill="#30e230" stroke="#10b010" strokeWidth={0.4} />
      {/* Crown highlight */}
      <path d="M36 26 L36 22" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
      <path d="M64 26 L64 22" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PENGUIN AVATARS
// ═══════════════════════════════════════════════════════════════════════

function PenguinDriving() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <PenguinBase expression="happy" />
      {/* Left flipper raised holding club */}
      <path d="M26 58 Q16 48 12 32" fill="#1a1a2e" stroke="#111" strokeWidth={1} />
      {/* Right flipper follow-through */}
      <path d="M74 58 Q80 45 78 35" fill="#1a1a2e" stroke="#111" strokeWidth={1} />
      {/* Golf club shaft */}
      <line x1={12} y1={32} x2={85} y2={28} stroke="#aaa" strokeWidth={1.5} strokeLinecap="round" />
      {/* Club head */}
      <rect x={82} y={24} width={8} height={6} rx={1} fill="#555" stroke="#333" strokeWidth={0.6} transform="rotate(10 86 27)" />
      {/* Golf ball flying */}
      <circle cx={92} cy={14} r={3} fill="#f5f5f0" stroke="#ccc" strokeWidth={0.5} />
      {/* Motion lines */}
      <line x1={88} y1={16} x2={84} y2={20} stroke="#ccc" strokeWidth={0.6} strokeLinecap="round" />
      <line x1={90} y1={18} x2={87} y2={22} stroke="#ccc" strokeWidth={0.6} strokeLinecap="round" />
    </svg>
  );
}

function PenguinPutting() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <PenguinBase expression="focus" />
      {/* Left flipper on putter */}
      <path d="M28 60 Q22 65 24 72" fill="#1a1a2e" stroke="#111" strokeWidth={1} />
      {/* Right flipper on putter */}
      <path d="M72 60 Q78 65 76 72" fill="#1a1a2e" stroke="#111" strokeWidth={1} />
      {/* Putter shaft */}
      <line x1={50} y1={55} x2={50} y2={88} stroke="#aaa" strokeWidth={1.5} strokeLinecap="round" />
      {/* Putter head */}
      <rect x={44} y={86} width={12} height={4} rx={1} fill="#888" stroke="#666" strokeWidth={0.5} />
      {/* Golf ball on ground */}
      <circle cx={62} cy={90} r={3} fill="#f5f5f0" stroke="#ccc" strokeWidth={0.5} />
      {/* Focus sweat drop */}
      <path d="M70 34 Q72 30 71 34 Q70 38 70 34" fill="#5BC0EB" />
    </svg>
  );
}

function PenguinCaddie() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <PenguinBase expression="happy" />
      {/* Golf bag strap across body */}
      <line x1={38} y1={36} x2={28} y2={80} stroke="#7A4A2A" strokeWidth={2} />
      {/* Golf bag behind penguin */}
      <rect x={15} y={30} width={14} height={50} rx={4} fill="#3A7D44" stroke="#2A5D34" strokeWidth={1} />
      {/* Bag pocket */}
      <rect x={17} y={60} width={10} height={8} rx={2} fill="#2A5D34" />
      {/* Club heads sticking out of bag */}
      <line x1={19} y1={30} x2={16} y2={18} stroke="#aaa" strokeWidth={1.2} strokeLinecap="round" />
      <line x1={22} y1={30} x2={20} y2={16} stroke="#aaa" strokeWidth={1.2} strokeLinecap="round" />
      <line x1={25} y1={30} x2={26} y2={17} stroke="#aaa" strokeWidth={1.2} strokeLinecap="round" />
      {/* Club heads */}
      <rect x={14} y={15} width={4} height={4} rx={1} fill="#666" />
      <rect x={18} y={13} width={4} height={4} rx={1} fill="#666" />
      <circle cx={26} cy={16} r={2.5} fill="#666" />
      {/* Right flipper waving */}
      <path d="M74 55 Q82 50 84 44" fill="#1a1a2e" stroke="#111" strokeWidth={1} />
    </svg>
  );
}

function PenguinCart() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Golf cart body */}
      <rect x={15} y={50} width={70} height={25} rx={5} fill="#4CAF50" stroke="#388E3C" strokeWidth={1.2} />
      {/* Cart roof */}
      <rect x={18} y={28} width={40} height={4} rx={2} fill="#388E3C" />
      {/* Roof supports */}
      <line x1={22} y1={32} x2={22} y2={50} stroke="#388E3C" strokeWidth={2} />
      <line x1={54} y1={32} x2={54} y2={50} stroke="#388E3C" strokeWidth={2} />
      {/* Cart seat */}
      <rect x={22} y={48} width={34} height={10} rx={3} fill="#555" />
      {/* Wheels */}
      <circle cx={28} cy={78} r={7} fill="#333" stroke="#222" strokeWidth={1} />
      <circle cx={28} cy={78} r={3} fill="#666" />
      <circle cx={72} cy={78} r={7} fill="#333" stroke="#222" strokeWidth={1} />
      <circle cx={72} cy={78} r={3} fill="#666" />
      {/* Steering wheel */}
      <circle cx={50} cy={54} r={4} fill="none" stroke="#222" strokeWidth={1.5} />
      {/* Penguin sitting in cart (small version) */}
      {/* Penguin body visible above cart */}
      <ellipse cx={38} cy={46} rx={12} ry={10} fill="#1a1a2e" />
      <ellipse cx={38} cy={48} rx={8} ry={7} fill="#f0f0f0" />
      {/* Penguin head */}
      <circle cx={38} cy={34} r={10} fill="#1a1a2e" />
      <ellipse cx={38} cy={37} rx={7} ry={5} fill="#f0f0f0" />
      {/* Eyes */}
      <circle cx={35} cy={36} r={1.8} fill="#333" />
      <circle cx={41} cy={36} r={1.8} fill="#333" />
      <circle cx={35.5} cy={35.5} r={0.6} fill="#fff" />
      <circle cx={41.5} cy={35.5} r={0.6} fill="#fff" />
      {/* Beak */}
      <path d="M36 40 L38 44 L40 40 Z" fill="#f5a623" stroke="#d4891a" strokeWidth={0.4} />
      {/* Flippers on steering wheel */}
      <path d="M44 48 Q48 50 50 52" fill="#1a1a2e" stroke="#111" strokeWidth={1} />
      {/* Golf clubs in back */}
      <line x1={72} y1={50} x2={74} y2={30} stroke="#aaa" strokeWidth={1} strokeLinecap="round" />
      <line x1={75} y1={50} x2={78} y2={32} stroke="#aaa" strokeWidth={1} strokeLinecap="round" />
    </svg>
  );
}

function PenguinTrophy() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <PenguinBase expression="celebrating" />
      {/* Left flipper raised */}
      <path d="M28 55 Q18 42 22 32" fill="#1a1a2e" stroke="#111" strokeWidth={1} />
      {/* Right flipper holding trophy up */}
      <path d="M72 55 Q82 42 78 28" fill="#1a1a2e" stroke="#111" strokeWidth={1} />
      {/* Trophy cup */}
      <path d="M68 12 L66 24 Q72 28 78 24 L76 12 Z" fill="#FFD700" stroke="#DAA520" strokeWidth={1} />
      {/* Trophy handles */}
      <path d="M66 16 Q60 16 60 20 Q60 24 66 22" fill="none" stroke="#DAA520" strokeWidth={1.5} />
      <path d="M78 16 Q84 16 84 20 Q84 24 78 22" fill="none" stroke="#DAA520" strokeWidth={1.5} />
      {/* Trophy base */}
      <rect x={69} y={24} width={6} height={3} rx={0.5} fill="#DAA520" />
      <rect x={67} y={27} width={10} height={2} rx={0.5} fill="#DAA520" />
      {/* Trophy shine */}
      <line x1={70} y1={14} x2={70} y2={20} stroke="rgba(255,255,255,0.5)" strokeWidth={1} strokeLinecap="round" />
      {/* Sparkles */}
      <circle cx={62} cy={10} r={1} fill="#FFD700" />
      <circle cx={85} cy={14} r={1} fill="#FFD700" />
      <circle cx={72} cy={6} r={1.2} fill="#FFD700" />
    </svg>
  );
}

function PenguinSunglasses() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <PenguinBase expression="cool" />
      {/* Sunglasses */}
      {/* Left lens */}
      <rect x={34} y={37} width={12} height={9} rx={2} fill="#222" stroke="#111" strokeWidth={0.8} />
      {/* Right lens */}
      <rect x={54} y={37} width={12} height={9} rx={2} fill="#222" stroke="#111" strokeWidth={0.8} />
      {/* Bridge */}
      <path d="M46 41 Q50 39 54 41" fill="none" stroke="#111" strokeWidth={1.2} />
      {/* Arms of glasses */}
      <line x1={34} y1={40} x2={28} y2={38} stroke="#111" strokeWidth={1} />
      <line x1={66} y1={40} x2={72} y2={38} stroke="#111" strokeWidth={1} />
      {/* Lens shine */}
      <line x1={37} y1={39} x2={39} y2={42} stroke="rgba(255,255,255,0.3)" strokeWidth={0.8} strokeLinecap="round" />
      <line x1={57} y1={39} x2={59} y2={42} stroke="rgba(255,255,255,0.3)" strokeWidth={0.8} strokeLinecap="round" />
      {/* Golf club leaning on */}
      <line x1={82} y1={30} x2={78} y2={88} stroke="#aaa" strokeWidth={1.8} strokeLinecap="round" />
      {/* Club head */}
      <rect x={76} y={86} width={8} height={4} rx={1} fill="#888" stroke="#666" strokeWidth={0.5} />
      {/* Right flipper resting on club */}
      <path d="M72 60 Q78 58 80 55" fill="#1a1a2e" stroke="#111" strokeWidth={1} />
    </svg>
  );
}

function PenguinVisor() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <PenguinBase expression="happy" />
      {/* Visor headband */}
      <path d="M32 34 Q50 30 68 34" fill="none" stroke="#e23030" strokeWidth={3} />
      {/* Visor brim */}
      <path d="M32 34 Q30 28 50 26 Q60 27 68 34" fill="#e23030" stroke="#c42020" strokeWidth={0.8} />
      {/* Visor brim underside */}
      <path d="M34 34 Q50 30 66 34" fill="#b01818" opacity={0.3} />
      {/* Left flipper waving */}
      <path d="M28 55 Q16 44 12 36" fill="#1a1a2e" stroke="#111" strokeWidth={1} />
      {/* Flipper tip */}
      <circle cx={12} cy={36} r={1.5} fill="#1a1a2e" />
      {/* Right flipper at side */}
      <path d="M72 58 Q80 62 82 68" fill="#1a1a2e" stroke="#111" strokeWidth={1} />
    </svg>
  );
}

function PenguinCelebrating() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* No shadow — penguin is jumping! */}
      {/* Feet (in air, toes down) */}
      <ellipse cx={40} cy={84} rx={7} ry={3} fill="#f5a623" stroke="#d4891a" strokeWidth={0.8} />
      <ellipse cx={60} cy={84} rx={7} ry={3} fill="#f5a623" stroke="#d4891a" strokeWidth={0.8} />
      {/* Body (moved up for jumping) */}
      <ellipse cx={50} cy={56} rx={24} ry={28} fill="#1a1a2e" />
      {/* White belly */}
      <ellipse cx={50} cy={59} rx={16} ry={20} fill="#f0f0f0" />
      {/* Head */}
      <circle cx={50} cy={30} r={18} fill="#1a1a2e" />
      {/* Face */}
      <ellipse cx={50} cy={34} rx={12} ry={9} fill="#f0f0f0" />
      {/* Happy eyes (closed arcs) */}
      <path d="M40 33 Q44 30 48 33" fill="none" stroke="#333" strokeWidth={1.5} strokeLinecap="round" />
      <path d="M52 33 Q56 30 60 33" fill="none" stroke="#333" strokeWidth={1.5} strokeLinecap="round" />
      {/* Beak */}
      <path d="M46 39 L50 45 L54 39 Z" fill="#f5a623" stroke="#d4891a" strokeWidth={0.6} />
      {/* Open mouth */}
      <ellipse cx={50} cy={47} rx={3} ry={2.5} fill="#333" />
      {/* Left flipper up */}
      <path d="M26 48 Q14 34 10 22" fill="#1a1a2e" stroke="#111" strokeWidth={1} />
      {/* Right flipper up */}
      <path d="M74 48 Q86 34 90 22" fill="#1a1a2e" stroke="#111" strokeWidth={1} />
      {/* Confetti pieces */}
      <rect x={15} y={15} width={4} height={4} rx={0.5} fill="#e23030" transform="rotate(20 17 17)" />
      <rect x={80} y={12} width={4} height={4} rx={0.5} fill="#3070e2" transform="rotate(-15 82 14)" />
      <rect x={25} y={6} width={3} height={5} rx={0.5} fill="#FFD700" transform="rotate(35 26 8)" />
      <rect x={70} y={4} width={3} height={5} rx={0.5} fill="#4CAF50" transform="rotate(-25 71 6)" />
      <circle cx={12} cy={30} r={2} fill="#FF69B4" />
      <circle cx={88} cy={28} r={2} fill="#f5a623" />
      <rect x={50} y={2} width={3} height={4} rx={0.5} fill="#9C27B0" transform="rotate(10 51 4)" />
      <circle cx={40} cy={8} r={1.5} fill="#e23030" />
      <circle cx={62} cy={6} r={1.5} fill="#3070e2" />
    </svg>
  );
}

function PenguinSand() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Sand bunker */}
      <ellipse cx={50} cy={88} rx={44} ry={12} fill="#E8D68C" />
      <ellipse cx={50} cy={86} rx={40} ry={10} fill="#F0E0A0" />
      {/* Sand splash particles */}
      <circle cx={25} cy={60} r={3} fill="#E8D68C" opacity={0.8} />
      <circle cx={18} cy={52} r={2} fill="#E8D68C" opacity={0.6} />
      <circle cx={30} cy={50} r={2.5} fill="#E8D68C" opacity={0.7} />
      <circle cx={75} cy={58} r={3} fill="#E8D68C" opacity={0.8} />
      <circle cx={82} cy={50} r={2} fill="#E8D68C" opacity={0.6} />
      <circle cx={70} cy={48} r={2.5} fill="#E8D68C" opacity={0.7} />
      <circle cx={35} cy={44} r={1.5} fill="#E8D68C" opacity={0.5} />
      <circle cx={65} cy={42} r={1.5} fill="#E8D68C" opacity={0.5} />
      {/* Penguin (slightly sunk in sand) */}
      {/* Feet hidden in sand */}
      {/* Body */}
      <ellipse cx={50} cy={64} rx={22} ry={26} fill="#1a1a2e" />
      {/* White belly */}
      <ellipse cx={50} cy={67} rx={15} ry={19} fill="#f0f0f0" />
      {/* Head */}
      <circle cx={50} cy={40} r={16} fill="#1a1a2e" />
      {/* Face */}
      <ellipse cx={50} cy={44} rx={11} ry={8} fill="#f0f0f0" />
      {/* Frustrated eyes */}
      <circle cx={44} cy={43} r={2.5} fill="#333" />
      <circle cx={56} cy={43} r={2.5} fill="#333" />
      <circle cx={45} cy={42} r={0.9} fill="#fff" />
      <circle cx={57} cy={42} r={0.9} fill="#fff" />
      {/* Angry eyebrows */}
      <line x1={40} y1={38} x2={46} y2={40} stroke="#333" strokeWidth={1.5} strokeLinecap="round" />
      <line x1={60} y1={38} x2={54} y2={40} stroke="#333" strokeWidth={1.5} strokeLinecap="round" />
      {/* Beak */}
      <path d="M46 49 L50 54 L54 49 Z" fill="#f5a623" stroke="#d4891a" strokeWidth={0.5} />
      {/* Frustrated mouth */}
      <path d="M46 57 Q50 55 54 57" fill="none" stroke="#333" strokeWidth={1.2} strokeLinecap="round" />
      {/* Flippers spread in frustration */}
      <path d="M28 58 Q18 52 14 46" fill="#1a1a2e" stroke="#111" strokeWidth={1} />
      <path d="M72 58 Q82 52 86 46" fill="#1a1a2e" stroke="#111" strokeWidth={1} />
      {/* Golf club stuck in sand */}
      <line x1={80} y1={36} x2={76} y2={82} stroke="#aaa" strokeWidth={1.5} strokeLinecap="round" />
      <path d="M74 82 Q72 86 78 86" fill="#888" stroke="#666" strokeWidth={0.5} />
    </svg>
  );
}

function PenguinHoleInOne() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <PenguinBase expression="celebrating" />
      {/* Left flipper up celebrating */}
      <path d="M28 55 Q18 44 14 34" fill="#1a1a2e" stroke="#111" strokeWidth={1} />
      {/* Right flipper pointing at hole */}
      <path d="M72 58 Q80 60 84 62" fill="#1a1a2e" stroke="#111" strokeWidth={1} />
      {/* Green ground */}
      <rect x={68} y={84} width={30} height={14} rx={2} fill="#4CAF50" />
      {/* Golf hole */}
      <ellipse cx={84} cy={86} rx={6} ry={3} fill="#333" />
      {/* Flag pole */}
      <line x1={84} y1={86} x2={84} y2={52} stroke="#aaa" strokeWidth={1.5} strokeLinecap="round" />
      {/* Flag */}
      <path d="M84 52 L96 58 L84 64 Z" fill="#e23030" />
      {/* Ball dropping into hole */}
      <circle cx={84} cy={83} r={3} fill="#f5f5f0" stroke="#ccc" strokeWidth={0.5} />
      {/* Ball motion lines */}
      <path d="M84 76 L84 80" stroke="#ccc" strokeWidth={0.6} strokeLinecap="round" />
      <path d="M80 78 L82 80" stroke="#ccc" strokeWidth={0.6} strokeLinecap="round" />
      <path d="M88 78 L86 80" stroke="#ccc" strokeWidth={0.6} strokeLinecap="round" />
      {/* Sparkle */}
      <circle cx={16} cy={30} r={1.5} fill="#FFD700" />
      <circle cx={22} cy={24} r={1} fill="#FFD700" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// LOOKUP MAP & EXPORT
// ═══════════════════════════════════════════════════════════════════════

const avatarMap: Record<string, Record<string, () => React.ReactElement>> = {
  golfball: {
    cowboy: GolfBallCowboy,
    pirate: GolfBallPirate,
    wizard: GolfBallWizard,
    ninja: GolfBallNinja,
    astronaut: GolfBallAstronaut,
    chef: GolfBallChef,
    detective: GolfBallDetective,
    superhero: GolfBallSuperhero,
    viking: GolfBallViking,
    crown: GolfBallCrown,
  },
  penguin: {
    driving: PenguinDriving,
    putting: PenguinPutting,
    caddie: PenguinCaddie,
    cart: PenguinCart,
    trophy: PenguinTrophy,
    sunglasses: PenguinSunglasses,
    visor: PenguinVisor,
    celebrating: PenguinCelebrating,
    sand: PenguinSand,
    'hole-in-one': PenguinHoleInOne,
  },
};

export function getAvatarSvg(
  category: 'golfball' | 'penguin',
  variant: string
): React.ReactElement | null {
  const categoryMap = avatarMap[category];
  if (!categoryMap) return null;

  const Component = categoryMap[variant];
  if (!Component) return null;

  return <Component />;
}
