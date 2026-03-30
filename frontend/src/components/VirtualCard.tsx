
interface VirtualCardProps {
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    type?: 'visa' | 'mastercard' | 'uzcard' | 'humo';
}

const VirtualCard = ({ cardNumber, cardHolder, expiryDate, type = 'visa' }: VirtualCardProps) => {
    return (
        <div className="animate-scale-in" style={{
            width: '100%',
            height: '210px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #6c63ff 0%, #3f37c9 100%)',
            padding: '25px',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }}>
            {/* Gloss effect */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-20%',
                width: '100%',
                height: '200%',
                background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
                transform: 'rotate(25deg)',
                pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
                <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '1px' }}>
                    {type.toUpperCase()}
                </div>
                <div style={{ width: '45px', height: '35px', borderRadius: '6px', background: 'rgba(255,223,0,0.8)', border: '1px solid rgba(0,0,0,0.1)' }} />
            </div>

            <div style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '3px', textAlign: 'center', margin: '20px 0', zIndex: 1 }}>
                {cardNumber}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 1 }}>
                <div>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.8, marginBottom: '4px' }}>Card Holder</div>
                    <div style={{ fontSize: '16px', fontWeight: 500, textTransform: 'uppercase' }}>{cardHolder}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.8, marginBottom: '4px' }}>Expires</div>
                    <div style={{ fontSize: '16px', fontWeight: 500 }}>{expiryDate}</div>
                </div>
            </div>
        </div>
    );
};

export default VirtualCard;
