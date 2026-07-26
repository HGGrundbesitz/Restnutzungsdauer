import {ImageResponse} from 'next/og';

export const alt = 'RND Gutachten – Restnutzungsdauer verständlich und objektbezogen';
export const size = {width: 1200, height: 630};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#f3f7fb',
          color: '#0f172a',
          padding: '70px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '2px solid rgba(15,23,42,0.10)',
            borderRadius: '36px',
            padding: '54px',
            background: '#ffffff',
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: '18px'}}>
            <div
              style={{
                width: '58px',
                height: '58px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '18px',
                background: '#0f172a',
                color: '#ffffff',
                fontSize: '28px',
              }}
            >
              R
            </div>
            <div style={{fontSize: '28px', fontWeight: 700}}>RND Gutachten</div>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', maxWidth: '930px'}}>
            <div style={{fontSize: '68px', lineHeight: 1.02, letterSpacing: '-3px', fontWeight: 700}}>
              Restnutzungsdauer verständlich einordnen
            </div>
            <div style={{marginTop: '24px', fontSize: '25px', lineHeight: 1.45, color: '#52647a'}}>
              Kostenlose Ersteinschätzung und objektbezogene Vorbereitung für vermietete Immobilien.
            </div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', color: '#2563eb', fontSize: '20px', fontWeight: 700}}>
            Transparent · unverbindlich · fachlich nachvollziehbar
          </div>
        </div>
      </div>
    ),
    size,
  );
}
