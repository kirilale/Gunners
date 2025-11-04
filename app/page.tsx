export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-arsenal-red to-arsenal-navy">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4">
            Arsenal Global Fan Platform
          </h1>
          <p className="text-2xl mb-8">
            Unite with Gooners worldwide 🔴⚪
          </p>
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-semibold mb-4">Coming Soon</h2>
            <ul className="text-left space-y-3 text-lg">
              <li>✅ Check in to matches from anywhere in the world</li>
              <li>✅ Earn badges for every match you attend virtually</li>
              <li>✅ See Arsenal fans on a live global map</li>
              <li>✅ Compete on leaderboards and unlock achievements</li>
              <li>✅ Track your lucky charm status</li>
              <li>✅ Make predictions and earn points</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
