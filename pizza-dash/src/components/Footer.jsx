export default function Footer() {
  return (
    <footer className="bg-pizza-brown text-white mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🍕</span>
              <span className="font-display font-bold text-xl">PizzaDash</span>
            </div>
            <p className="text-brown-200 text-sm leading-relaxed opacity-80">
              Finding the hottest, freshest pizza near you. Powered by real-time location 
              and OpenStreetMap data.
            </p>
          </div>

          {/* Discover */}
          <div>
            <h4 className="font-bold mb-3 text-pizza-orange-light">Discover</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a href="#" className="hover:text-pizza-orange-light transition-colors">Best Pizza Near Me</a></li>
              <li><a href="#" className="hover:text-pizza-orange-light transition-colors">New York Style</a></li>
              <li><a href="#" className="hover:text-pizza-orange-light transition-colors">Chicago Deep Dish</a></li>
              <li><a href="#" className="hover:text-pizza-orange-light transition-colors">Neapolitan</a></li>
              <li><a href="#" className="hover:text-pizza-orange-light transition-colors">Wood-Fired</a></li>
            </ul>
          </div>

          {/* Order On */}
          <div>
            <h4 className="font-bold mb-3 text-pizza-orange-light">Order On</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a href="https://doordash.com" target="_blank" rel="noopener noreferrer" className="hover:text-pizza-orange-light transition-colors">🍕 DoorDash</a></li>
              <li><a href="https://ubereats.com" target="_blank" rel="noopener noreferrer" className="hover:text-pizza-orange-light transition-colors">🚗 Uber Eats</a></li>
              <li><a href="https://grubhub.com" target="_blank" rel="noopener noreferrer" className="hover:text-pizza-orange-light transition-colors">🛵 Grubhub</a></li>
              <li><a href="https://slice.com" target="_blank" rel="noopener noreferrer" className="hover:text-pizza-orange-light transition-colors">🍕 Slice</a></li>
            </ul>
          </div>

          {/* Pizza Guide */}
          <div>
            <h4 className="font-bold mb-3 text-pizza-orange-light">Pizza Guide</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li className="flex items-center gap-2">⭐ 4.5+ = Outstanding</li>
              <li className="flex items-center gap-2">⭐ 4.0+ = Great</li>
              <li className="flex items-center gap-2">⭐ 3.5+ = Good</li>
              <li className="flex items-center gap-2">🚀 Under 30 min = Fast</li>
              <li className="flex items-center gap-2">💸 Free delivery = Save $</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center 
                        justify-between gap-4 text-sm opacity-60">
          <p>© 2026 PizzaDash. Built with ❤️ and powered by OpenStreetMap.</p>
          <p>Pizza place data from <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-100">OpenStreetMap</a> contributors.</p>
        </div>
      </div>
    </footer>
  );
}
