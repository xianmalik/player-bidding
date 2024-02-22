import { Fragment, useState } from 'react';

const products = [
  { name: 'Analytics', description: 'Get a better understanding of your traffic', href: '#' },
  { name: 'Engagement', description: 'Speak directly to your customers', href: '#' },
  { name: 'Security', description: 'Your customers’ data will be safe and secure', href: '#' },
  { name: 'Integrations', description: 'Connect with third-party tools', href: '#' },
  { name: 'Automations', description: 'Build strategic funnels that will convert', href: '#' },
]
const callsToAction = [
  { name: 'Watch demo', href: '#' },
  { name: 'Contact sales', href: '#' },
]


export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md mb-4">
    </header>
  )
}