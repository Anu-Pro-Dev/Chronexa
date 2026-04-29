// "use client";

// import React from "react";
// import { CheckCircle } from "lucide-react";
// import {
//   ResponsiveModal,
//   ResponsiveModalContent,
//   ResponsiveModalHeader,
//   ResponsiveModalTitle,
// } from "@/src/components/ui/responsive-modal";
// import { useLanguage } from "@/src/providers/LanguageProvider";

// interface PasswordResetSuccessModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   email?: string;
//   autoCloseDelay?: number;
//   size?: "small" | "medium" | "large" | "extraLarge";
// }

// export default function PasswordResetSuccessModal({
//   open,
//   onOpenChange,
//   email = "support@chronexa.ai",
//   autoCloseDelay = 5000,
//   size = "small",
// }: PasswordResetSuccessModalProps) {
//   const { translations } = useLanguage();
//   const t = translations?.modules?.userManagement || {};

//   React.useEffect(() => {
//     if (open && autoCloseDelay > 0) {
//       const timer = setTimeout(() => onOpenChange(false), autoCloseDelay);
//       return () => clearTimeout(timer);
//     }
//   }, [open, autoCloseDelay, onOpenChange]);

//   return (
//     <ResponsiveModal open={open} onOpenChange={onOpenChange}>
//       <ResponsiveModalContent size={size}>
//         <ResponsiveModalHeader>
//           <ResponsiveModalTitle>
//             {t.password_reset_success_title || "Password Reset Successful"}
//           </ResponsiveModalTitle>
//         </ResponsiveModalHeader>

//         <div className="p-6 flex flex-col items-center gap-5">

//           {/* Icon */}
//           <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center animate-pulse">
//             <CheckCircle size={32} className="text-success" />
//           </div>

//           {/* Description */}
//           <p className="text-center text-text-secondary text-sm">
//             {t.password_reset_success_desc || "A new password has been generated and sent to the user's email."}
//           </p>

//           {/* Email Box */}
//           <div className="w-full p-4 rounded-lg bg-backdrop">
//             <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
//               {t.password_reset_sent_to || "Sent To"} :&ensp;
//               <span className="font-mono text-sm font-regular text-primary lowercase break-words select-all">
//                 {email}
//               </span>
//             </p>
//           </div>

//           {/* Footer note */}
//           <p className="text-center text-xs text-text-secondary">
//             {t.password_reset_footer || "The new password has been sent to the registered email address."}
//           </p>

//         </div>
//       </ResponsiveModalContent>
//     </ResponsiveModal>
//   );
// }
"use client";

import React from "react";
import { CheckCircle } from "lucide-react";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/src/components/ui/responsive-modal";
import { useLanguage } from "@/src/providers/LanguageProvider";

interface PasswordResetSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  login?: string;
  newPassword?: string;
  autoCloseDelay?: number;
  size?: "small" | "medium" | "large" | "extraLarge";
}

export default function PasswordResetSuccessModal({
  open,
  onOpenChange,
  login = "",
  newPassword = "",
  autoCloseDelay = 5000,
  size = "small",
}: PasswordResetSuccessModalProps) {
  const { translations } = useLanguage();
  const t = translations?.modules?.userManagement || {};

  React.useEffect(() => {
    if (open && autoCloseDelay > 0) {
      const timer = setTimeout(() => onOpenChange(false), autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [open, autoCloseDelay, onOpenChange]);

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent size={size}>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>
            {t.password_reset_success_title || "Password Reset Successful"}
          </ResponsiveModalTitle>
        </ResponsiveModalHeader>

        <div className="p-6 flex flex-col items-center gap-5">

          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center animate-pulse">
            <CheckCircle size={32} className="text-success" />
          </div>

          {/* Description */}
          {/* <p className="text-center text-text-secondary text-sm">
            {t.password_reset_success_desc || "A new password has been generated."}
          </p> */}

          {/* Credentials box */}
          <div className="w-full rounded-lg bg-backdrop divide-y divide-border-tertiary overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {t.username || "Username"}
              </span>
              <span className="font-mono text-sm text-primary break-words select-all">
                {login}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {t.new_password || "New Password"}
              </span>
              <span className="font-mono text-sm text-primary select-all">
                {newPassword}
              </span>
            </div>
          </div>

        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}