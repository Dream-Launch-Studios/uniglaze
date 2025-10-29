import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#" },
        { label: "Documentation", href: "#docs" },
        { label: "API Reference", href: "#api" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "#api" },
        { label: "Careers", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Press Kit", href: "#" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "#" },
        { label: "Contact Us", href: "#" },
        { label: "Status Page", href: "#" },
        { label: "Security", href: "#" },
      ],
    },
  ];

  const contactInfo = [
    {
      icon: Mail,
      label: "contact@uniglaze.com",
      href: "mailto:contact@uniglaze.com",
    },
    { icon: Phone, label: "+1 (555) 123-4567", href: "tel:+15551234567" },
    { icon: MapPin, label: "Construction District, Mumbai, India", href: "#" },
  ];

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Github, href: "#", label: "GitHub" },
  ];

  return (
    <footer className="bg-foreground text-background" id="contact">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="mb-12 grid gap-12 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/">
              <Image
                src="https://firebasestorage.googleapis.com/v0/b/plypicker-e35d7.appspot.com/o/dualite%2Funiglaze%2Fcompany%20logo.png?alt=media&token=3f10a9bd-1da3-4c61-b8b5-8c3f8e317f36"
                alt="Uniglazeeeeeeeeeeee"
                width={100}
                height={100}
                className="mb-4 h-fit w-fit"
              />
            </Link>

            <p className="text-background/70 mb-6 max-w-sm">
              Streamline your construction glass projects with our comprehensive
              ERP solution designed for the construction industry.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              {contactInfo.map((contact, index) => (
                <a
                  key={index}
                  href={contact.href}
                  className="text-background/70 hover:text-background flex items-center gap-3 transition-colors"
                >
                  <contact.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{contact.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="text-background mb-4 font-semibold">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-background/70 hover:text-background text-sm transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="border-background/20 mb-8 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <h3 className="text-background mb-2 font-semibold">
                Stay Updated
              </h3>
              <p className="text-background/70 text-sm">
                Get the latest updates on new features and construction industry
                insights.
              </p>
            </div>
            <div className="flex w-full gap-3 md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-background/10 border-background/20 text-background placeholder:text-background/50 focus:ring-primary flex-1 rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none md:w-64"
              />
              <Button variant="hero" className="whitespace-nowrap">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-background/20 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-background/70 text-sm">
              © {currentYear} Uniglaze ERP Tool. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="bg-background/10 hover:bg-background/20 rounded-lg p-2 transition-colors"
                >
                  <social.icon className="text-background/70 h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
