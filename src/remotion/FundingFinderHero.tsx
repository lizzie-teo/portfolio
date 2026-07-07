import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import './style.css';

const pink = '#ec2d7a';
const dark = '#050505';
const neutral = '#f4f1ee';

const loop = (frame: number, fps: number, seconds: number) => {
  return (frame % (fps * seconds)) / (fps * seconds);
};

const wave = (frame: number, fps: number, seconds: number, phase = 0) => {
  return Math.sin((loop(frame, fps, seconds) + phase) * Math.PI * 2);
};

type PanelProps = {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

const GlassPanel: React.FC<PanelProps> = ({className, style, children}) => (
  <div className={`glass-panel ${className ?? ''}`} style={style}>
    {children}
  </div>
);

const LineChart: React.FC<{progress: number}> = ({progress}) => {
  const path = 'M8 155 C42 132 56 142 91 116 C123 92 144 108 174 84 C205 58 226 76 251 46 C276 22 292 36 316 16';
  return (
    <svg viewBox="0 0 330 170" className="chart-svg">
      <path d="M8 155 H320" className="axis" />
      <path d="M8 110 H320" className="axis faint" />
      <path
        d={path}
        className="chart-line"
        style={{strokeDasharray: 430, strokeDashoffset: 430 * (1 - progress)}}
      />
      <circle cx="316" cy="16" r="7" fill={pink} opacity={progress > 0.9 ? 1 : 0} />
    </svg>
  );
};

const BarChart: React.FC<{progress: number}> = ({progress}) => {
  const vals = [24, 38, 52, 48, 70, 84, 108];
  return (
    <div className="bars">
      {vals.map((v, i) => (
        <div key={i} className="bar-wrap">
          <div className="bar" style={{height: v * progress}} />
        </div>
      ))}
    </div>
  );
};

const Donut: React.FC<{progress: number}> = ({progress}) => {
  const deg = 338 * progress;
  return <div className="donut" style={{background: `conic-gradient(${pink} 0deg, ${pink} ${deg}deg, #e8e2df ${deg}deg 360deg)`}}><div>94%</div></div>;
};

const NetworkMap: React.FC<{progress: number}> = ({progress}) => (
  <svg viewBox="0 0 520 240" className="network">
    {Array.from({length: 110}).map((_, i) => {
      const x = 20 + ((i * 43) % 480);
      const y = 20 + ((i * 29) % 190);
      const opacity = 0.12 + (((i * 7) % 10) / 35);
      return <circle key={i} cx={x} cy={y} r="2" fill={dark} opacity={opacity} />;
    })}
    <path d="M62 142 C170 34 260 190 445 70" className="network-line" style={{strokeDasharray: 620, strokeDashoffset: 620 * (1 - progress)}} />
    {[62, 218, 344, 445].map((x, i) => <circle key={i} cx={x} cy={[142, 82, 130, 70][i]} r="6" fill={pink} opacity={0.35 + progress * 0.65} />)}
  </svg>
);

export const FundingFinderHero: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const intro = interpolate(frame, [0, 55], [0, 1], {easing: Easing.out(Easing.cubic), extrapolateRight: 'clamp'});
  const outroReset = interpolate(frame, [durationInFrames - 60, durationInFrames], [1, 0], {easing: Easing.inOut(Easing.cubic), extrapolateLeft: 'clamp'});
  const visible = intro * outroReset;
  const phoneX = wave(frame, fps, 9) * 28;
  const phoneY = wave(frame, fps, 7, 0.25) * 18;
  const rotY = -12 + wave(frame, fps, 10) * 8;
  const rotX = 4 + wave(frame, fps, 8, 0.4) * 3;
  const rotZ = -4 + wave(frame, fps, 12, 0.1) * 2;
  const chartProgress = interpolate(frame, [20, 120], [0, 1], {easing: Easing.out(Easing.cubic), extrapolateRight: 'clamp'});
  const pulse = 0.6 + Math.sin(frame / 18) * 0.18;

  return (
    <AbsoluteFill className="scene" style={{background: neutral}}>
      <div className="soft-grid" />
      <div className="pink-glow" style={{opacity: pulse}} />
      <div className="black-shadow" />

      <div className="stage" style={{transform: `perspective(1400px) rotateX(${wave(frame, fps, 14) * 1.6}deg) rotateY(${wave(frame, fps, 16, 0.2) * 2.2}deg)`}}>
        <GlassPanel className="panel panel-left top" style={{transform: `translate3d(${wave(frame, fps, 8) * 18}px, ${wave(frame, fps, 6, 0.3) * 12}px, -130px) rotateY(16deg) rotateZ(-2deg)`, opacity: visible}}>
          <div className="panel-title">Funding overview</div>
          <div className="small-label">Total funded</div>
          <div className="big-number">$2.4B <span>▲ 23%</span></div>
          <LineChart progress={chartProgress} />
        </GlassPanel>

        <GlassPanel className="panel panel-left bottom" style={{transform: `translate3d(${wave(frame, fps, 10, 0.4) * 14}px, ${wave(frame, fps, 7) * 9}px, -170px) rotateY(19deg) rotateZ(1deg)`, opacity: visible}}>
          <div className="panel-title">Monthly cash flow</div>
          <div className="big-number small">$128,420 <span>▲ 18%</span></div>
          <BarChart progress={chartProgress} />
        </GlassPanel>

        <div className="map-wrap" style={{transform: `translate3d(${wave(frame, fps, 11) * 15}px, ${wave(frame, fps, 9, 0.5) * 10}px, -210px)`, opacity: visible * 0.85}}>
          <NetworkMap progress={chartProgress} />
        </div>

        <GlassPanel className="panel panel-right progress" style={{transform: `translate3d(${wave(frame, fps, 7, 0.2) * 18}px, ${wave(frame, fps, 8, 0.4) * 14}px, -150px) rotateY(-17deg) rotateZ(2deg)`, opacity: visible}}>
          <div className="panel-title">Application progress</div>
          <div className="steps">
            <div><b>🏦</b><span>Bank connected</span></div>
            <i />
            <div><b>📄</b><span>Application</span></div>
            <i />
            <div className="muted"><b>✓</b><span>Get funded</span></div>
          </div>
        </GlassPanel>

        <GlassPanel className="panel panel-right donut-card" style={{transform: `translate3d(${wave(frame, fps, 9, 0.7) * 18}px, ${wave(frame, fps, 7, 0.1) * 12}px, -120px) rotateY(-14deg)`, opacity: visible}}>
          <div className="panel-title">Match rate</div>
          <Donut progress={chartProgress} />
          <div className="legend"><b />Matched <span>94%</span></div>
        </GlassPanel>

        <div
          className="phone-wrap"
          style={{
            opacity: visible,
            transform: `translate3d(${phoneX}px, ${phoneY}px, 80px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${0.92 + intro * 0.08})`,
          }}
        >
          <div className="phone-side" />
          <div className="phone">
            <div className="speaker" />
            <div className="camera" />
            <div className="screen-glass" />
            <Img src={staticFile('assets/funding-finder-screen.png')} className="screen" />
          </div>
          <div className="phone-shadow" />
        </div>
      </div>

      <div className="caption">Fast business funding, matched beautifully.</div>
    </AbsoluteFill>
  );
};
