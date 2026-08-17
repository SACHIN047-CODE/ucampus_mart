export default function ChitkaraLogo({ type = 'full', height = 34, width = 'auto' }) {
  if (type === 'full') {
    return (
      <div
        style={{
          height: `${height}px`,
          width,
          display: 'flex',
          alignItems: 'center',
          fontWeight: 'bold',
          fontSize: `${height * 0.7}px`,
          color: '#e21a22',
          fontFamily: "'Poppins', sans-serif",
          letterSpacing: '-1px',
        }}
      >
        CampusMart
      </div>
    );
  }

  if (type === 'icon') {
    return (
      <div
        style={{
          height: `${height}px`,
          width: `${height}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${height * 0.6}px`,
          fontWeight: 'bold',
          color: 'white',
          backgroundColor: '#e21a22',
          borderRadius: '50%',
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        C
      </div>
    );
  }

  return null;
}
