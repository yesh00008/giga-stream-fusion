import { cn } from "@/lib/utils";

export type BadgeType = 'verified' | 'official' | 'premium' | 'vip' | 'partner' | 'founder' | 'ceo' | 'cofounder' | 'government' | 'organization' | null;

interface VerificationBadgeProps {
  type: BadgeType;
  size?: number;
  className?: string;
}

// Custom SVG badge components - Instagram/Twitter style with sharp rounded edges

// Blue - Organizations
const OrganizationBadgeSVG = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 0L13.5 3.5L17.5 2.5L18.5 6.5L22 8L20 11L22 14L18.5 15.5L17.5 19.5L13.5 18.5L11 22L8.5 18.5L4.5 19.5L3.5 15.5L0 14L2 11L0 8L3.5 6.5L4.5 2.5L8.5 3.5L11 0Z" fill="#1DA1F2"/>
    <path d="M6 11L9.5 14.5L16 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Golden - Government Officials
const GovernmentBadgeSVG = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FFA500" />
      </linearGradient>
    </defs>
    <path d="M11 0L13.5 3.5L17.5 2.5L18.5 6.5L22 8L20 11L22 14L18.5 15.5L17.5 19.5L13.5 18.5L11 22L8.5 18.5L4.5 19.5L3.5 15.5L0 14L2 11L0 8L3.5 6.5L4.5 2.5L8.5 3.5L11 0Z" fill="url(#goldGradient)"/>
    <path d="M6 11L9.5 14.5L16 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Golden - CEO
const CEOBadgeSVG = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldGradientCEO" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FFA500" />
      </linearGradient>
    </defs>
    <path d="M11 0L13.5 3.5L17.5 2.5L18.5 6.5L22 8L20 11L22 14L18.5 15.5L17.5 19.5L13.5 18.5L11 22L8.5 18.5L4.5 19.5L3.5 15.5L0 14L2 11L0 8L3.5 6.5L4.5 2.5L8.5 3.5L11 0Z" fill="url(#goldGradientCEO)"/>
    <path d="M6 11L9.5 14.5L16 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Light Red - Founder
const FounderBadgeSVG = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 0L13.5 3.5L17.5 2.5L18.5 6.5L22 8L20 11L22 14L18.5 15.5L17.5 19.5L13.5 18.5L11 22L8.5 18.5L4.5 19.5L3.5 15.5L0 14L2 11L0 8L3.5 6.5L4.5 2.5L8.5 3.5L11 0Z" fill="#FF6B6B"/>
    <path d="M6 11L9.5 14.5L16 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Light Red - Co-Founder
const CoFounderBadgeSVG = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 0L13.5 3.5L17.5 2.5L18.5 6.5L22 8L20 11L22 14L18.5 15.5L17.5 19.5L13.5 18.5L11 22L8.5 18.5L4.5 19.5L3.5 15.5L0 14L2 11L0 8L3.5 6.5L4.5 2.5L8.5 3.5L11 0Z" fill="#FF6B6B"/>
    <path d="M6 11L9.5 14.5L16 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Legacy badges for backward compatibility
const VerifiedBadgeSVG = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 0L13.5 3.5L17.5 2.5L18.5 6.5L22 8L20 11L22 14L18.5 15.5L17.5 19.5L13.5 18.5L11 22L8.5 18.5L4.5 19.5L3.5 15.5L0 14L2 11L0 8L3.5 6.5L4.5 2.5L8.5 3.5L11 0Z" fill="#1DA1F2"/>
    <path d="M6 11L9.5 14.5L16 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const OfficialBadgeSVG = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 0L13.5 3.5L17.5 2.5L18.5 6.5L22 8L20 11L22 14L18.5 15.5L17.5 19.5L13.5 18.5L11 22L8.5 18.5L4.5 19.5L3.5 15.5L0 14L2 11L0 8L3.5 6.5L4.5 2.5L8.5 3.5L11 0Z" fill="#10B981"/>
    <path d="M6 11L9.5 14.5L16 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PremiumBadgeSVG = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="premiumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FFA500" />
      </linearGradient>
    </defs>
    <path d="M11 0L13.5 3.5L17.5 2.5L18.5 6.5L22 8L20 11L22 14L18.5 15.5L17.5 19.5L13.5 18.5L11 22L8.5 18.5L4.5 19.5L3.5 15.5L0 14L2 11L0 8L3.5 6.5L4.5 2.5L8.5 3.5L11 0Z" fill="url(#premiumGradient)"/>
    <path d="M6 11L9.5 14.5L16 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const VIPBadgeSVG = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 0L13.5 3.5L17.5 2.5L18.5 6.5L22 8L20 11L22 14L18.5 15.5L17.5 19.5L13.5 18.5L11 22L8.5 18.5L4.5 19.5L3.5 15.5L0 14L2 11L0 8L3.5 6.5L4.5 2.5L8.5 3.5L11 0Z" fill="#A855F7"/>
    <path d="M6 11L9.5 14.5L16 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PartnerBadgeSVG = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 0L13.5 3.5L17.5 2.5L18.5 6.5L22 8L20 11L22 14L18.5 15.5L17.5 19.5L13.5 18.5L11 22L8.5 18.5L4.5 19.5L3.5 15.5L0 14L2 11L0 8L3.5 6.5L4.5 2.5L8.5 3.5L11 0Z" fill="#F97316"/>
    <path d="M6 11L9.5 14.5L16 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function VerificationBadge({ type, size = 20, className }: VerificationBadgeProps) {
  if (!type) return null;

  const badges = {
    organization: {
      component: OrganizationBadgeSVG,
      label: 'Verified Organization',
    },
    government: {
      component: GovernmentBadgeSVG,
      label: 'Government Official',
    },
    ceo: {
      component: CEOBadgeSVG,
      label: 'CEO',
    },
    founder: {
      component: FounderBadgeSVG,
      label: 'Founder',
    },
    cofounder: {
      component: CoFounderBadgeSVG,
      label: 'Co-Founder',
    },
    // Legacy badges
    verified: {
      component: VerifiedBadgeSVG,
      label: 'Verified',
    },
    official: {
      component: OfficialBadgeSVG,
      label: 'Official Account',
    },
    premium: {
      component: PremiumBadgeSVG,
      label: 'Premium',
    },
    vip: {
      component: VIPBadgeSVG,
      label: 'VIP',
    },
    partner: {
      component: PartnerBadgeSVG,
      label: 'Partner',
    },
  };

  const badge = badges[type];
  const BadgeComponent = badge.component;

  return (
    <div
      className={cn('inline-flex items-center justify-center', className)}
      title={badge.label}
    >
      <BadgeComponent size={size} />
    </div>
  );
}

// Helper component for displaying badge with username
interface UsernameWithBadgeProps {
  username: string;
  badgeType: BadgeType;
  className?: string;
  badgeSize?: number;
}

export function UsernameWithBadge({ username, badgeType, className, badgeSize = 16 }: UsernameWithBadgeProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span>{username}</span>
      <VerificationBadge type={badgeType} size={badgeSize} />
    </div>
  );
}
