import { T } from '../theme';
export default function KCTMark({ size = 48 }) {
  return (<svg width={size} height={size} viewBox="0 0 100 100" fill="none"><polygon points="50,4 96,27 96,73 50,96 4,73 4,27" fill={T.red} /><text x="50" y="60" textAnchor="middle" fill="#fff" style={{font:`900 ${Math.round(size*0.42)}px 'Barlow Condensed',sans-serif`}}>KCT</text></svg>);
}
