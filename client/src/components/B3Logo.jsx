export default function B3Logo({ size = 32 }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg font-black text-black select-none shrink-0"
      style={{ width: size, height: size, background: 'var(--accent)', fontSize: size * 0.45, letterSpacing: '-1px' }}
    >
      B<sup style={{ fontSize: size * 0.28, verticalAlign: 'super' }}>3</sup>
    </div>
  );
}
