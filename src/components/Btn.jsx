import { T } from '../theme';
export default function Btn({ children, onClick, v = 'primary', sz = 'md', disabled, full, sx = {} }) {
  const vS = { primary: {background:T.red,color:'#fff',border:'none'}, ghost: {background:'transparent',color:T.white,border:`1px solid ${T.line}`}, danger: {background:T.redDim,color:T.red,border:`1px solid ${T.red}44`} }[v] || {background:T.red,color:'#fff',border:'none'};
  const sS = { sm:{padding:'5px 12px',fontSize:10}, md:{padding:'9px 18px',fontSize:11}, lg:{Padding:'13px 24px',fontSize:13} }[sz] || {padding:'9px 18px',fontSize:11};
  return (<button onClick={onClick} disabled={disabled} style={{...vS,...sS,width:full?'100%':undefined,fontFamily:'inherit',fontWeight:900,textTransform:'uppercase',borderRadius:2,cursor:disabled?'not-allowed':'pointer',opacity:disabled?0.45:1,...sx}}>{children}</button>);
}
