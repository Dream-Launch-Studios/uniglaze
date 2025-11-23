"use client";

import { Button } from "@/components/ui/button";
import { APP_PATHS } from "@/config/path.config";
import { signOut, useSession } from "@/lib/auth-client";
import type { Session } from "@/server/auth";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { data: session } = useSession() as { data: Session | null };

  const redirect = useRouter();


  return (
    <nav className="bg-background/80 border-border/50 fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/plypicker-e35d7.appspot.com/o/dualite%2Funiglaze%2Fcompany%20logo.png?alt=media&token=3f10a9bd-1da3-4c61-b8b5-8c3f8e317f36"
              alt="Uniglazeeeeeeeeeeee"
              width={100}
              height={100}
              className="h-fit w-fit"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            {session?.user && (
              <Link
                href="./dashboard"
                className="text-foreground hover:text-primary font-medium transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-4 md:flex">
            {!session?.user ? (
              <Button
                variant="hero"
                onClick={() => {
                  redirect.push(APP_PATHS.LOGIN);
                }}
                className="justify-start rounded-full bg-black p-4"
              >
                Sign In
              </Button>
            ) : (
              <Button variant="hero" onClick={() => void signOut()}>
                Sign Out
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="p-2 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="text-foreground h-6 w-6" />
            ) : (
              <Menu className="text-foreground h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-border/50 border-t py-4 md:hidden">
            <div className="flex flex-col space-y-4">
              <div className="border-border/50 flex flex-col gap-3 border-t pt-4">
                {!session?.user ? (
                  <Button
                    variant="hero"
                    onClick={() => {
                      redirect.push(APP_PATHS.LOGIN);
                    }}
                    className="justify-start rounded-full bg-black p-4"
                  >
                    Sign In
                  </Button>
                ) : (
                  <Button variant="hero" onClick={() => void signOut()}>
                    Sign Out
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
