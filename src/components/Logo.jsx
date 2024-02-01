import Image from 'next/future/image'

import InstantLogo from '@/images/playful_sun.svg'

export function LogoImage(props) {
  return <Image src={InstantLogo} alt="Instant Logo" width={27} {...props} />;
}

export function Logo() {
  return (
    <span className="inline-flex space-x-2">
      <LogoImage />
      <div>
        <span className="font-mono text-lg font-bold lowercase dark:text-white">
          Instant
        </span>
      </div>
    </span>
  );
}
