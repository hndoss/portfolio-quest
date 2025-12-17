const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    color: '#fff',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '1rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #333',
    borderTop: '3px solid #fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
}

export default function LoadingScreen() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Portfolio Quest</h1>
      <div style={styles.spinner} />
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}
