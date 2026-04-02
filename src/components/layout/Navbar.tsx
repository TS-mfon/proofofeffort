import { Link, useLocation } from "react-router-dom";
import { useWallet } from "@/lib/genlayer/WalletProvider";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

function formatAddr(address: string | null) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function Navbar() {
  const { address, isConnected, connectWallet, disconnectWallet, isLoading } = useWallet();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/engagements", label: "Engagements" },
    { to: "/leaderboard", label: "Leaderboard" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-border/50 bg-background/80">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-lg">⚡</span>
            </div>
            <span className="text-lg font-bold font-display gradient-text">Proof of Effort</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isConnected && address && (
              <Link
                to={`/profile/${address}`}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname.startsWith("/profile")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                My Profile
              </Link>
            )}
          </nav>

          {/* Wallet */}
          <div className="hidden md:flex items-center gap-3">
            {isConnected ? (
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50 text-sm font-mono text-muted-foreground">
                  {formatAddr(address)}
                </div>
                <Button variant="ghost" size="icon" onClick={disconnectWallet} className="h-8 w-8">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={connectWallet} disabled={isLoading} size="sm" className="gap-2">
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive(link.to) ? "bg-primary/10 text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border/50">
              {isConnected ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-muted-foreground">{formatAddr(address)}</span>
                  <Button variant="ghost" size="sm" onClick={disconnectWallet}>Disconnect</Button>
                </div>
              ) : (
                <Button onClick={connectWallet} disabled={isLoading} size="sm" className="w-full gap-2">
                  <Wallet className="h-4 w-4" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
