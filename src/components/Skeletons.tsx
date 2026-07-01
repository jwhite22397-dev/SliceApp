export function CardSkeleton() {
  return (
    <div className="skeleton">
      <div className="sk-media shimmer" />
      <div className="sk-line shimmer" style={{ width: "60%", marginTop: 16 }} />
      <div className="sk-line shimmer" style={{ width: "85%" }} />
      <div className="sk-line shimmer" style={{ width: "40%", marginBottom: 18 }} />
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
