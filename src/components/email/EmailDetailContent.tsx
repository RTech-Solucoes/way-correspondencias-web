'use client';

import {useRouter} from "next/navigation";
import EmailDetail from "@/components/email/EmailDetail";
import useEmail from "@/context/email/EmailContext";
import {EmailResponse} from "@/api/email/types";

interface EmailDetailContentProps {
  emailId: string;
  initialData?: EmailResponse | null;
}

export function EmailDetailContent({ emailId, initialData }: EmailDetailContentProps) {
  const router = useRouter();
  const { setSelectedEmail } = useEmail();

  const handleBack = () => {
    setSelectedEmail(null);
    router.push('/email');
  };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <EmailDetail
        emailId={emailId}
        onBack={handleBack}
        initialData={initialData}
      />
    </div>
  );
}
