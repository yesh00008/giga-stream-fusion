import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VerificationBadge, BadgeType } from "@/components/VerificationBadge";
import { Shield, Building2, Landmark, Briefcase, Rocket, CheckCircle2 } from "lucide-react";

interface BadgeInfo {
  title: string;
  description: string;
  criteria: string[];
  icon: React.ReactNode;
  color: string;
}

const badgeInfo: Record<Exclude<BadgeType, null>, BadgeInfo> = {
  organization: {
    title: "Organization Verified",
    description: "This account represents an official organization, company, or brand.",
    criteria: [
      "Authentic organization with legal documentation",
      "Active presence and community engagement",
      "Follows platform guidelines and policies"
    ],
    icon: <Building2 size={40} className="text-blue-500" />,
    color: "text-blue-500"
  },
  government: {
    title: "Government Official",
    description: "This account belongs to a verified government official or government organization.",
    criteria: [
      "Confirmed government official or agency",
      "Verified through official government channels",
      "Public service accountability"
    ],
    icon: <Landmark size={40} className="text-yellow-600" />,
    color: "text-yellow-600"
  },
  ceo: {
    title: "CEO Verified",
    description: "This account is verified as a Chief Executive Officer of a notable organization.",
    criteria: [
      "Confirmed CEO position at registered company",
      "Public business records verification",
      "Professional credibility established"
    ],
    icon: <Briefcase size={40} className="text-yellow-600" />,
    color: "text-yellow-600"
  },
  founder: {
    title: "Founder Verified",
    description: "This account belongs to a verified founder of a notable company or project.",
    criteria: [
      "Confirmed founder of registered entity",
      "Significant contribution to industry",
      "Public records of founding"
    ],
    icon: <Rocket size={40} className="text-red-400" />,
    color: "text-red-400"
  },
  cofounder: {
    title: "Co-Founder Verified",
    description: "This account belongs to a verified co-founder of a notable company or project.",
    criteria: [
      "Confirmed co-founder of registered entity",
      "Partnership in notable venture",
      "Public verification of co-founding role"
    ],
    icon: <Rocket size={40} className="text-red-400" />,
    color: "text-red-400"
  },
  verified: {
    title: "Verified Account",
    description: "This account has been verified as authentic and notable.",
    criteria: [
      "Confirmed authentic identity",
      "Public interest or notability",
      "Active and compliant with platform rules"
    ],
    icon: <CheckCircle2 size={40} className="text-green-500" />,
    color: "text-green-500"
  },
  official: {
    title: "Official Account",
    description: "This is an official account representing a public figure or organization.",
    criteria: [
      "Represents official entity or person",
      "Verified documentation provided",
      "Maintains platform standards"
    ],
    icon: <Shield size={40} className="text-purple-500" />,
    color: "text-purple-500"
  },
  premium: {
    title: "Premium Member",
    description: "This account has premium membership status.",
    criteria: [
      "Active premium subscription",
      "Access to exclusive features",
      "Enhanced platform privileges"
    ],
    icon: <Shield size={40} className="text-orange-500" />,
    color: "text-orange-500"
  },
  vip: {
    title: "VIP Member",
    description: "This account has VIP status with exclusive benefits.",
    criteria: [
      "Elite membership tier",
      "Priority support and features",
      "Special community recognition"
    ],
    icon: <Shield size={40} className="text-indigo-500" />,
    color: "text-indigo-500"
  },
  partner: {
    title: "Partner Account",
    description: "This account represents an official platform partner.",
    criteria: [
      "Official partnership agreement",
      "Collaborative relationship with platform",
      "Meets partner program requirements"
    ],
    icon: <Shield size={40} className="text-pink-500" />,
    color: "text-pink-500"
  }
};

interface BadgeInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badgeType: BadgeType;
}

export function BadgeInfoDialog({ open, onOpenChange, badgeType }: BadgeInfoDialogProps) {
  if (!badgeType) return null;
  
  const info = badgeInfo[badgeType];
  if (!info) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <VerificationBadge type={badgeType} size={32} />
            <DialogTitle className="text-xl">{info.title}</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            {info.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              {info.icon}
              <span>Verification Criteria</span>
            </h4>
            <ul className="space-y-2 ml-2">
              {info.criteria.map((criterion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 size={16} className={`mt-0.5 flex-shrink-0 ${info.color}`} />
                  <span>{criterion}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Verified badges are awarded after careful review and cannot be purchased. 
              They help users identify authentic and notable accounts on the platform.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
