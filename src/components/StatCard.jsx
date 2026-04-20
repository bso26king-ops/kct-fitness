import { T } from '../theme';
export default function StatCard({ label, value, icon, color, sub }) {
  return (<div style={{background:T.panel,border:`1px solid ${T.line}`,borderRadius:2,padding:'12px 8px',textAlign:'center'}}>{icon&&<div style={{fontSize:18,marginBottom:4}}>{icon}</div>}<div style={{fontSize:18,fontWeight:900,color:color||T.white,lineHeight:1}}>{value}</div>{sub&&<div style={{fontSize:9,color:color||T.whiteDim,marginTop:1}}>{sub}</div>}<div style={{fontSize:7,color:T.whiteDim,letterSpacing:1.5,textTransform:'uppercase',marginTop:4}}>{label}</div></div>);
}
