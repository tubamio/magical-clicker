// src/App.tsx
import React from 'react'
import MainGame from '/src/ui/pages/MainGame.tsx'

class ErrorBoundary extends React.Component<{children: React.ReactNode},{err?:Error}>{
  constructor(p:any){ super(p); this.state = {} }
  static getDerivedStateFromError(err:Error){ return { err } }
  componentDidCatch(err:Error){ console.error(err) }
  render(){
    if (this.state.err){
      return (
        <div style={{maxWidth:900, margin:'40px auto', padding:16, borderRadius:12, background:'#2a1d3a', color:'#ffeef8'}}>
          <h2>画面エラー</h2>
          <pre style={{whiteSpace:'pre-wrap'}}>{String(this.state.err.stack||this.state.err.message||this.state.err)}</pre>
        </div>
      )
    }
    return this.props.children as any
  }
}

export default function App(){
  return (
    <ErrorBoundary>
      <div className="container">
        <MainGame/>
      </div>
    </ErrorBoundary>
  )
}
