/**
 * 2D Articulated Rigging & Kinematics Engine for Shadow Theater Characters
 * Normal human anatomy silhouette with realistic joint pivots and smooth movement presets.
 */

import { CharacterPose, LimbAngles } from '../types';

/**
 * Calculates articulated limb angles at a given time for a specified motion preset.
 */
export function calculateLimbAngles(
  pose: CharacterPose,
  time: number,
  poseSpeed = 1.0,
  custom?: Partial<LimbAngles>
): LimbAngles {
  const t = time * poseSpeed;
  const cycle = (t * 2 * Math.PI); // Radians cycle

  // Default base neutral stance
  const base: LimbAngles = {
    head: 0,
    torso: 0,
    leftUpperArm: 15,
    leftForearm: 10,
    rightUpperArm: -15,
    rightForearm: 10,
    leftThigh: -5,
    leftCalf: 5,
    rightThigh: 5,
    rightCalf: 5,
    hipsY: 0,
  };

  switch (pose) {
    case 'idle': {
      // Gentle breathing, subtle head and arm drift
      const breath = Math.sin(t * 1.8);
      const sway = Math.sin(t * 0.9);
      return {
        head: 3 * Math.sin(t * 1.2),
        torso: 1.5 * breath,
        leftUpperArm: 12 + 2 * breath,
        leftForearm: 15 + 3 * sway,
        rightUpperArm: -10 + 2 * breath,
        rightForearm: 12 - 3 * sway,
        leftThigh: -4 + 1 * sway,
        leftCalf: 4,
        rightThigh: 6 - 1 * sway,
        rightCalf: 4,
        hipsY: 1.5 * breath,
        ...custom,
      };
    }

    case 'walking': {
      // Natural walking stride: opposing arms and legs, knee flexion on backswing
      const walkFreq = 2.8;
      const phi = t * walkFreq * Math.PI;
      const legPhase = Math.sin(phi);
      const legPhase2 = Math.sin(phi + Math.PI);

      // Knee bend: bend more when leg is swinging forward or back
      const leftKneeBend = legPhase < 0 ? Math.abs(legPhase) * 45 : 8;
      const rightKneeBend = legPhase2 < 0 ? Math.abs(legPhase2) * 45 : 8;

      // Hip bob (vertical bounce twice per stride)
      const bob = Math.abs(Math.sin(phi)) * 6 - 3;

      return {
        head: Math.sin(phi) * 2 - 1,
        torso: 4 + Math.sin(phi) * 1.5, // Slight forward lean
        leftUpperArm: -legPhase * 28 + 10,
        leftForearm: Math.max(10, -legPhase * 25 + 25),
        rightUpperArm: -legPhase2 * 28 - 10,
        rightForearm: Math.max(10, -legPhase2 * 25 + 25),
        leftThigh: legPhase * 28,
        leftCalf: leftKneeBend,
        rightThigh: legPhase2 * 28,
        rightCalf: rightKneeBend,
        hipsY: bob,
        ...custom,
      };
    }

    case 'running': {
      // Dynamic run: strong forward torso tilt, higher knee drive, vigorous arm pump
      const runFreq = 4.2;
      const phi = t * runFreq * Math.PI;
      const phase1 = Math.sin(phi);
      const phase2 = Math.sin(phi + Math.PI);

      const leftKnee = phase1 < 0 ? Math.abs(phase1) * 70 : 15;
      const rightKnee = phase2 < 0 ? Math.abs(phase2) * 70 : 15;
      const runBob = Math.sin(phi * 2) * 10 - 5;

      return {
        head: 4 + Math.sin(phi) * 3,
        torso: 14 + Math.sin(phi) * 2, // Pronounced forward lean
        leftUpperArm: -phase1 * 55 + 15,
        leftForearm: 60 + phase1 * 20,
        rightUpperArm: -phase2 * 55 - 15,
        rightForearm: 60 + phase2 * 20,
        leftThigh: phase1 * 45,
        leftCalf: leftKnee,
        rightThigh: phase2 * 45,
        rightCalf: rightKnee,
        hipsY: runBob,
        ...custom,
      };
    }

    case 'standing': {
      // Confident, still silhouette
      return {
        head: -2,
        torso: 0,
        leftUpperArm: 8,
        leftForearm: 12,
        rightUpperArm: -8,
        rightForearm: 10,
        leftThigh: -3,
        leftCalf: 3,
        rightThigh: 4,
        rightCalf: 3,
        hipsY: 0,
        ...custom,
      };
    }

    case 'looking_around': {
      // Head scanning the distant horizon, weight shifting
      const look = Math.sin(t * 1.2);
      const shift = Math.sin(t * 0.6);
      return {
        head: look * 18,
        torso: look * 4,
        leftUpperArm: 12 + look * 5,
        leftForearm: 20 + look * 8,
        rightUpperArm: -14 - look * 5,
        rightForearm: 15,
        leftThigh: -5 + shift * 3,
        leftCalf: 4,
        rightThigh: 7 - shift * 3,
        rightCalf: 5,
        hipsY: Math.abs(shift) * 2,
        ...custom,
      };
    }

    case 'raising_hands': {
      // Imploring, praying, or awestruck hands raised toward sky
      const pulse = Math.sin(t * 1.5) * 5;
      return {
        head: -18 + pulse * 0.5, // Looking up at the light
        torso: -4,
        leftUpperArm: -125 + pulse,
        leftForearm: -45 + pulse * 0.5,
        rightUpperArm: -110 + pulse,
        rightForearm: -40 + pulse * 0.5,
        leftThigh: -6,
        leftCalf: 6,
        rightThigh: 8,
        rightCalf: 6,
        hipsY: 0,
        ...custom,
      };
    }

    case 'pointing': {
      // Arm extended pointing into the distance
      const aim = Math.sin(t * 1.5) * 2;
      return {
        head: -4 + aim,
        torso: 5,
        leftUpperArm: -75 + aim, // Extended arm
        leftForearm: -10,
        rightUpperArm: 15,
        rightForearm: 20,
        leftThigh: -12,
        leftCalf: 10,
        rightThigh: 16,
        rightCalf: 8,
        hipsY: 0,
        ...custom,
      };
    }

    case 'kneeling': {
      // Respectful kneeling posture, hands folded or resting on knees
      const breath = Math.sin(t * 1.5) * 1.5;
      return {
        head: 14 + breath,
        torso: 10 + breath * 0.5,
        leftUpperArm: 20,
        leftForearm: 45,
        rightUpperArm: 15,
        rightForearm: 40,
        leftThigh: 85, // Folded thighs
        leftCalf: -95, // Shins flat to ground
        rightThigh: 75,
        rightCalf: -90,
        hipsY: 42, // Lowered hips onto ground
        ...custom,
      };
    }

    case 'falling': {
      // Dramatic tumble/stumble
      const fallT = Math.min(1.0, (t % 3) / 1.5);
      const angle = fallT * 60;
      return {
        head: -20,
        torso: angle,
        leftUpperArm: -60 - angle * 0.5,
        leftForearm: -30,
        rightUpperArm: 40 + angle * 0.5,
        rightForearm: 60,
        leftThigh: -40 - angle * 0.3,
        leftCalf: 60,
        rightThigh: 20 + angle * 0.3,
        rightCalf: 40,
        hipsY: fallT * 35,
        ...custom,
      };
    }

    case 'fighting': {
      // Martial stance with thrust and parry rhythm
      const strikePhase = Math.sin(t * 3.5);
      const strike = Math.max(0, strikePhase);
      return {
        head: -6,
        torso: 10 - strike * 8,
        leftUpperArm: -45 - strike * 40, // Thrust forward
        leftForearm: 10 - strike * 20,
        rightUpperArm: 20 + strike * 15,  // Guard back
        rightForearm: 50,
        leftThigh: -22 - strike * 10,     // Deep combat stance
        leftCalf: 28 + strike * 10,
        rightThigh: 30 + strike * 5,
        rightCalf: 18,
        hipsY: 10 + strike * 4,
        ...custom,
      };
    }

    case 'custom':
    default:
      return {
        ...base,
        ...custom,
      };
  }
}

/**
 * Draws an articulated human silhouette directly to Canvas context.
 * Features realistic human proportions with smooth organic contouring.
 */
export function drawArticulatedCharacter(
  ctx: CanvasRenderingContext2D,
  subtype: string,
  angles: LimbAngles,
  options: {
    color?: string;
    hasStaff?: boolean;
    hasSpear?: boolean;
    hasCape?: boolean;
    hasBow?: boolean;
  } = {}
) {
  const color = options.color || '#09080b';

  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Base human scale: Height is ~180 units from feet to head crown
  // Center of origin is at the feet ground contact (0, 0)
  // Normal standing hips are at y = -90

  const hipsY = -90 + (angles.hipsY || 0);

  // Cape background if traveler/warrior
  if (options.hasCape || subtype === 'traveler' || subtype === 'warrior') {
    ctx.save();
    ctx.translate(0, hipsY - 35);
    ctx.rotate((angles.torso * 0.5 + 5) * (Math.PI / 180));
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.quadraticCurveTo(-22, 50, -32, 95);
    ctx.quadraticCurveTo(-15, 100, 0, 95);
    ctx.quadraticCurveTo(-6, 50, 4, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // --- 1. FAR LEG (Right Leg - drawn behind) ---
  drawLeg(ctx, angles.rightThigh, angles.rightCalf, 4, hipsY, false);

  // --- 2. FAR ARM (Right Arm - drawn behind) ---
  drawArm(ctx, angles.rightUpperArm, angles.rightForearm, 3, hipsY - 42, false);

  // --- 3. TORSO & PELVIS ---
  ctx.save();
  ctx.translate(0, hipsY);
  ctx.rotate((angles.torso || 0) * (Math.PI / 180));

  // Pelvis / Hips
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Torso / Chest / Spine
  ctx.beginPath();
  ctx.moveTo(-9, -2);
  // Waist curve to ribcage
  ctx.bezierCurveTo(-13, -20, -14, -36, -11, -45);
  // Shoulder neck line
  ctx.lineTo(9, -45);
  // Front chest curve
  ctx.bezierCurveTo(13, -32, 11, -18, 9, -2);
  ctx.closePath();
  ctx.fill();

  // Robe / Tunic skirt if applicable
  if (subtype === 'traveler' || subtype === 'elder' || subtype === 'sage') {
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-16, 42);
    ctx.lineTo(14, 42);
    ctx.lineTo(10, 0);
    ctx.closePath();
    ctx.fill();
  }

  // --- 4. HEAD & NECK ---
  const neckX = 0;
  const neckY = -45;
  ctx.save();
  ctx.translate(neckX, neckY);
  ctx.rotate((angles.head || 0) * (Math.PI / 180));

  // Neck
  ctx.beginPath();
  ctx.rect(-4, -8, 8, 9);
  ctx.fill();

  // Head Silhouette (Profile/3/4 view with chin, brow, and nose)
  ctx.save();
  ctx.translate(0, -18);

  ctx.beginPath();
  // Skull crown
  ctx.arc(0, -2, 10, 0, Math.PI * 2);
  ctx.fill();

  // Face profile (brow, nose, chin silhouette)
  ctx.beginPath();
  ctx.moveTo(3, -9);
  ctx.lineTo(9, -3);   // Brow to nose bridge
  ctx.lineTo(12, 0);   // Nose tip
  ctx.lineTo(8, 2);    // Upper lip
  ctx.lineTo(8.5, 5);  // Lower lip & chin
  ctx.lineTo(4, 9);    // Jawline
  ctx.lineTo(-4, 8);   // Jaw to neck
  ctx.closePath();
  ctx.fill();

  // Hair or Headwear details based on subtype
  if (subtype === 'traveler') {
    // Traveler conical hat or hooded cowl
    ctx.beginPath();
    ctx.moveTo(-18, -4);
    ctx.lineTo(0, -18);
    ctx.lineTo(18, -4);
    ctx.quadraticCurveTo(0, -2, -18, -4);
    ctx.fill();
  } else if (subtype === 'warrior') {
    // Warrior combat topknot / helmet
    ctx.beginPath();
    ctx.arc(-2, -14, 4, 0, Math.PI * 2);
    ctx.fill();
    // Helmet crest
    ctx.beginPath();
    ctx.moveTo(-4, -13);
    ctx.lineTo(6, -17);
    ctx.lineTo(4, -11);
    ctx.fill();
  } else if (subtype === 'elder' || subtype === 'sage') {
    // Sage topknot and long beard
    ctx.beginPath();
    ctx.arc(-2, -13, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // Flowing beard
    ctx.beginPath();
    ctx.moveTo(7, 4);
    ctx.quadraticCurveTo(11, 16, 5, 25);
    ctx.quadraticCurveTo(3, 14, 4, 7);
    ctx.closePath();
    ctx.fill();
  } else if (subtype === 'dancer') {
    // Elegant hair bun with ornamental pin
    ctx.beginPath();
    ctx.arc(-8, -10, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-12, -14);
    ctx.lineTo(2, -8);
    ctx.stroke();
  }

  ctx.restore(); // Head
  ctx.restore(); // Neck

  ctx.restore(); // Torso

  // --- 5. NEAR LEG (Left Leg - drawn in front) ---
  drawLeg(ctx, angles.leftThigh, angles.leftCalf, -4, hipsY, true);

  // --- 6. NEAR ARM (Left Arm - drawn in front) ---
  const handPos = drawArm(ctx, angles.leftUpperArm, angles.leftForearm, -4, hipsY - 42, true);

  // Weapon / Prop in hand
  if (options.hasStaff || subtype === 'traveler' || subtype === 'sage') {
    // Walking staff held in hand
    ctx.save();
    ctx.translate(handPos.x, handPos.y);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(3, -55);
    ctx.lineTo(-4, 60);
    ctx.stroke();
    // Staff lantern/knot
    ctx.beginPath();
    ctx.arc(3, -50, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (options.hasSpear || subtype === 'warrior') {
    // Battle spear held in hand
    ctx.save();
    ctx.translate(handPos.x, handPos.y);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(55, -45);
    ctx.lineTo(-45, 40);
    ctx.stroke();
    // Spear tip
    ctx.beginPath();
    ctx.moveTo(55, -45);
    ctx.lineTo(66, -54);
    ctx.lineTo(61, -40);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draws a multi-segmented leg with thigh, knee, calf, ankle, and foot.
 */
function drawLeg(
  ctx: CanvasRenderingContext2D,
  thighAngle: number,
  calfAngle: number,
  hipOffsetX: number,
  hipOffsetY: number,
  isNearLeg: boolean
) {
  ctx.save();
  ctx.translate(hipOffsetX, hipOffsetY);
  ctx.rotate(thighAngle * (Math.PI / 180));

  // Thigh (Hip to Knee: length ~46)
  ctx.beginPath();
  ctx.moveTo(-6, 0);
  ctx.quadraticCurveTo(-7, 24, -4.5, 46);
  ctx.lineTo(4.5, 46);
  ctx.quadraticCurveTo(6, 24, 6, 0);
  ctx.closePath();
  ctx.fill();

  // Knee joint
  ctx.beginPath();
  ctx.arc(0, 46, 5, 0, Math.PI * 2);
  ctx.fill();

  // Calf & Foot (Knee to Ankle: length ~44)
  ctx.save();
  ctx.translate(0, 46);
  ctx.rotate(calfAngle * (Math.PI / 180));

  ctx.beginPath();
  ctx.moveTo(-4.5, 0);
  ctx.quadraticCurveTo(-6.5, 20, -3.5, 44);
  ctx.lineTo(3.5, 44);
  ctx.quadraticCurveTo(4.5, 20, 4.5, 0);
  ctx.closePath();
  ctx.fill();

  // Ankle & Foot
  ctx.beginPath();
  ctx.moveTo(-4, 44);
  ctx.lineTo(-4, 48);
  ctx.lineTo(12, 48); // Toe forward
  ctx.quadraticCurveTo(7, 43, 3, 44);
  ctx.closePath();
  ctx.fill();

  ctx.restore(); // Calf
  ctx.restore(); // Thigh
}

/**
 * Draws a multi-segmented arm with shoulder, upper arm, elbow, forearm, and hand.
 * Returns the final hand tip coordinates.
 */
function drawArm(
  ctx: CanvasRenderingContext2D,
  upperArmAngle: number,
  forearmAngle: number,
  shoulderOffsetX: number,
  shoulderOffsetY: number,
  isNearArm: boolean
): { x: number; y: number } {
  ctx.save();
  ctx.translate(shoulderOffsetX, shoulderOffsetY);
  ctx.rotate(upperArmAngle * (Math.PI / 180));

  // Shoulder & Upper arm (Shoulder to Elbow: length ~34)
  ctx.beginPath();
  ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-4, 0);
  ctx.lineTo(-3, 34);
  ctx.lineTo(3, 34);
  ctx.lineTo(4, 0);
  ctx.closePath();
  ctx.fill();

  // Forearm & Hand (Elbow to Wrist: length ~30)
  ctx.save();
  ctx.translate(0, 34);
  ctx.rotate(forearmAngle * (Math.PI / 180));

  ctx.beginPath();
  ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-3, 0);
  ctx.lineTo(-2, 30);
  ctx.lineTo(2, 30);
  ctx.lineTo(3, 0);
  ctx.closePath();
  ctx.fill();

  // Hand
  ctx.beginPath();
  ctx.arc(0, 32, 3, 0, Math.PI * 2);
  ctx.fill();

  // Calculate approximate coordinate of hand in parent space
  const rad1 = upperArmAngle * (Math.PI / 180);
  const rad2 = (upperArmAngle + forearmAngle) * (Math.PI / 180);

  const elbowX = shoulderOffsetX + Math.sin(rad1) * 34;
  const elbowY = shoulderOffsetY + Math.cos(rad1) * 34;
  const handX = elbowX + Math.sin(rad2) * 32;
  const handY = elbowY + Math.cos(rad2) * 32;

  ctx.restore(); // Forearm
  ctx.restore(); // Upper Arm

  return { x: handX, y: handY };
}

/**
 * Draws an articulated animal silhouette (Horse, Wolf, Deer, Bird).
 */
export function drawArticulatedAnimal(
  ctx: CanvasRenderingContext2D,
  subtype: string,
  time: number,
  color = '#09080b'
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const t = time;

  if (subtype === 'horse') {
    // Majestic galloping/trotting horse
    const trot = t * 6;
    const leg1 = Math.sin(trot) * 25;
    const leg2 = Math.sin(trot + Math.PI) * 25;
    const bodyBob = Math.sin(trot * 2) * 3;

    ctx.save();
    ctx.translate(0, bodyBob);

    // Horse Body / Torso
    ctx.beginPath();
    ctx.ellipse(0, -45, 38, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rump & Chest muscular curves
    ctx.beginPath();
    ctx.arc(-26, -45, 18, 0, Math.PI * 2);
    ctx.arc(24, -48, 17, 0, Math.PI * 2);
    ctx.fill();

    // Neck & Head
    ctx.save();
    ctx.translate(26, -55);
    ctx.rotate(-0.4 + Math.sin(trot) * 0.05);

    ctx.beginPath();
    ctx.moveTo(-10, 10);
    ctx.lineTo(8, -35); // Crest
    ctx.lineTo(24, -28); // Muzzle
    ctx.lineTo(16, -14); // Jaw
    ctx.lineTo(4, 15);  // Throat
    ctx.closePath();
    ctx.fill();

    // Ears
    ctx.beginPath();
    ctx.moveTo(8, -35);
    ctx.lineTo(7, -44);
    ctx.lineTo(12, -34);
    ctx.fill();

    // Mane
    ctx.beginPath();
    ctx.moveTo(-8, 5);
    ctx.quadraticCurveTo(-4, -18, 6, -32);
    ctx.lineTo(2, -28);
    ctx.lineTo(-4, -10);
    ctx.fill();

    ctx.restore(); // Neck

    // Front Legs
    drawAnimalLeg(ctx, 22, -35, leg1 * 0.8, -leg1 * 0.6, 52);
    drawAnimalLeg(ctx, 26, -35, leg2 * 0.8, -leg2 * 0.6, 52);

    // Back Legs
    drawAnimalLeg(ctx, -24, -35, -leg2 * 0.8, leg2 * 0.5, 52);
    drawAnimalLeg(ctx, -28, -35, -leg1 * 0.8, leg1 * 0.5, 52);

    // Tail
    ctx.save();
    ctx.translate(-38, -48);
    ctx.rotate(0.3 + Math.sin(trot) * 0.2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-15, 20, -25, 45);
    ctx.quadraticCurveTo(-15, 30, -5, 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.restore();
  } else if (subtype === 'wolf') {
    // Prowling wild wolf
    const walk = t * 4;
    const leg1 = Math.sin(walk) * 20;
    const leg2 = Math.sin(walk + Math.PI) * 20;

    // Body
    ctx.beginPath();
    ctx.ellipse(0, -30, 28, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head & Muzzle
    ctx.save();
    ctx.translate(24, -36);
    ctx.beginPath();
    ctx.moveTo(-4, 8);
    ctx.lineTo(4, -12); // Brow
    ctx.lineTo(18, -4);  // Snout
    ctx.lineTo(8, 6);   // Chin
    ctx.closePath();
    ctx.fill();

    // Wolf ears
    ctx.beginPath();
    ctx.moveTo(2, -12);
    ctx.lineTo(5, -20);
    ctx.lineTo(8, -10);
    ctx.fill();
    ctx.restore();

    // Legs
    drawAnimalLeg(ctx, 16, -22, leg1, -leg1 * 0.5, 34);
    drawAnimalLeg(ctx, 20, -22, leg2, -leg2 * 0.5, 34);
    drawAnimalLeg(ctx, -16, -22, -leg2, leg2 * 0.5, 34);
    drawAnimalLeg(ctx, -20, -22, -leg1, leg1 * 0.5, 34);

    // Bushy Tail
    ctx.save();
    ctx.translate(-26, -32);
    ctx.rotate(0.5 + Math.sin(walk) * 0.2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-12, 14, -18, 28);
    ctx.quadraticCurveTo(-8, 18, 0, 6);
    ctx.fill();
    ctx.restore();
  } else if (subtype === 'deer' || subtype === 'stag') {
    // Graceful stag with antlers
    const trot = t * 3;
    ctx.beginPath();
    ctx.ellipse(0, -42, 26, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.save();
    ctx.translate(22, -58);
    ctx.beginPath();
    ctx.moveTo(-6, 12);
    ctx.lineTo(6, -18);
    ctx.lineTo(18, -10);
    ctx.lineTo(10, 6);
    ctx.closePath();
    ctx.fill();

    // Majestic branching antlers
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(4, -18);
    ctx.quadraticCurveTo(2, -35, 14, -42);
    ctx.moveTo(3, -26);
    ctx.lineTo(-4, -34);
    ctx.moveTo(8, -32);
    ctx.lineTo(18, -32);
    ctx.stroke();
    ctx.restore();

    // Slender legs
    drawAnimalLeg(ctx, 15, -34, Math.sin(trot) * 15, 0, 48);
    drawAnimalLeg(ctx, 18, -34, -Math.sin(trot) * 15, 0, 48);
    drawAnimalLeg(ctx, -15, -34, -Math.sin(trot) * 15, 0, 48);
    drawAnimalLeg(ctx, -18, -34, Math.sin(trot) * 15, 0, 48);
  } else if (subtype === 'eagle' || subtype === 'bird') {
    // Soaring raptor with flapping silhouette
    const flap = Math.sin(t * 3.5);
    ctx.save();
    ctx.translate(0, -40);

    // Bird body
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hooked beak head
    ctx.beginPath();
    ctx.arc(14, -2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(18, -2);
    ctx.lineTo(24, 1);
    ctx.lineTo(17, 3);
    ctx.fill();

    // Tail feathers
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.lineTo(-26, -6);
    ctx.lineTo(-24, 6);
    ctx.closePath();
    ctx.fill();

    // Spread Wings
    const wingAngle = flap * 0.35;
    ctx.save();
    ctx.rotate(wingAngle);
    ctx.beginPath();
    ctx.moveTo(-4, -4);
    ctx.bezierCurveTo(4, -28, 20, -40, 35, -45);
    ctx.bezierCurveTo(15, -30, -5, -15, -12, -4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.rotate(-wingAngle * 0.8);
    ctx.beginPath();
    ctx.moveTo(-4, 4);
    ctx.bezierCurveTo(4, 28, 20, 40, 35, 45);
    ctx.bezierCurveTo(15, 30, -5, 15, -12, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.restore();
  } else if (subtype === 'buffalo' || subtype === 'tedong') {
    // Powerful Toraja Water Buffalo (Tedong Bonga)
    const walk = t * 1.8;
    const leg1 = Math.sin(walk) * 16;
    const leg2 = Math.sin(walk + Math.PI) * 16;

    // Heavy muscular barrel torso
    ctx.beginPath();
    ctx.ellipse(0, -38, 38, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Powerful shoulder hump
    ctx.beginPath();
    ctx.ellipse(18, -48, 16, 12, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Head and heavy snout
    ctx.save();
    ctx.translate(36, -42);
    ctx.beginPath();
    ctx.moveTo(-6, 8);
    ctx.lineTo(8, -14);
    ctx.lineTo(24, -4);
    ctx.lineTo(20, 10);
    ctx.lineTo(4, 12);
    ctx.closePath();
    ctx.fill();

    // Sweeping Toraja Buffalo Horns (Majestic curved horns)
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(6, -14);
    ctx.bezierCurveTo(4, -36, -12, -48, -26, -44);
    ctx.stroke();

    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(10, -12);
    ctx.bezierCurveTo(12, -34, 0, -46, -16, -42);
    ctx.stroke();
    ctx.restore();

    // Sturdy powerful legs
    drawAnimalLeg(ctx, 22, -24, leg1, -leg1 * 0.4, 40);
    drawAnimalLeg(ctx, 26, -24, leg2, -leg2 * 0.4, 40);
    drawAnimalLeg(ctx, -22, -24, -leg2, leg2 * 0.4, 40);
    drawAnimalLeg(ctx, -26, -24, -leg1, leg1 * 0.4, 40);

    // Tufted Tail
    ctx.save();
    ctx.translate(-36, -36);
    ctx.rotate(0.3 + Math.sin(walk * 1.5) * 0.15);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-10, 16, -12, 34);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(-12, 34, 3, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

function drawAnimalLeg(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  hipRot: number,
  kneeRot: number,
  totalHeight: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(hipRot * (Math.PI / 180));
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, totalHeight * 0.5);
  ctx.stroke();

  ctx.translate(0, totalHeight * 0.5);
  ctx.rotate(kneeRot * (Math.PI / 180));
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, totalHeight * 0.5);
  ctx.lineTo(3, totalHeight * 0.5 + 2); // Hoof/paw
  ctx.stroke();
  ctx.restore();
}
