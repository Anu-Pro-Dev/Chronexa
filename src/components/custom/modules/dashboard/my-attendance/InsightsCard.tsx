"use client";
import React, { useMemo } from 'react';
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { useFetchAllEntity } from "@/src/hooks/useFetchAllEntity";
import Link from 'next/link';

interface EmailData {
  id: string;
  subject: string;
  sender: string;
  timestamp: string;
  senderInitials?: string;
}

const stripHtmlAndTruncate = (html: string, maxLength: number = 100): string => {
  if (!html) return '';
  
  const text = html.replace(/<[^>]*>/g, '');
  
  const decoded = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&[a-z]+;/gi, ' ');
  
  const trimmed = decoded.trim().replace(/\s+/g, ' ');
  return trimmed.length > maxLength ? trimmed.substring(0, maxLength) + '...' : trimmed;
};

function InsightsCard() {
    const { translations } = useLanguage();
    const t = translations?.modules?.dashboard || {};
    const { userInfo } = useAuthGuard();

    const { data: emailsResponse } = useFetchAllEntity('ta-emails', {
        endpoint: '/ta-emails/all',
        searchParams: {
            recipient: userInfo?.email || '',
            limit: '2',
            offset: '0',
        },
        enabled: !!userInfo?.email,
    });

    const emailData: EmailData | null = useMemo(() => {
        if (!emailsResponse?.data || emailsResponse.data.length === 0) {
            return null;
        }

        const latestEmail = emailsResponse.data[0];
        
        const recipientEmail = latestEmail.to_text || '';
        const initials = recipientEmail.charAt(0).toUpperCase() || 'N';

        const emailDate = new Date(latestEmail.created_date);
        const formattedTime = emailDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        const formattedDate = emailDate.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        return {
            id: latestEmail.ta_email_id,
            subject: latestEmail.subject_text || 'No Subject',
            sender: stripHtmlAndTruncate(latestEmail.body_text, 100) || 'No message',
            timestamp: `${formattedTime} | ${formattedDate}`,
            senderInitials: initials,
        };
    }, [emailsResponse]);

    return(
        <div className='shadow-card rounded-[10px] bg-accent p-6'>
            <div className='flex flex-row justify-between'>
                <h5 className='text-lg text-text-primary font-bold'>{t?.important}</h5>
                <Link href="/alerts/email" className='text-primary text-sm font-medium flex items-center justify-center gap-1'>
                    {translations?.buttons?.show_all}
                </Link>
            </div> 
            {emailData ? (
                <div className='shadow-searchbar bg-transparent p-2 mt-2 flex gap-4'>
                    <div className="w-12 h-12 rounded-full bg-backdrop flex justify-center items-center flex-shrink-0">
                        <div className="text-primary font-semibold text-sm">{emailData.senderInitials}</div>
                    </div>
                    <div className='flex-1 flex flex-col justify-evenly'>
                        <p className='text-sm font-bold text-text-primary line-clamp-1'>{emailData.subject}</p>
                        <p className='text-xs font-medium text-text-secondary line-clamp-1'>{emailData.sender}</p>
                        <p className='text-xs font-medium text-text-secondary'>{emailData.timestamp}</p>
                    </div>
                </div>
            ) : (
                <div className='shadow-searchbar bg-transparent py-2 mt-2 flex gap-4 items-center'>
                    <div className="w-12 h-12 rounded-full bg-backdrop flex justify-center items-center">
                        <div className="text-primary font-semibold text-sm">—</div>
                    </div>
                    <div className='h-12 w-auto flex flex-col justify-evenly'>
                        <p className='text-sm font-bold text-text-primary'>No emails available</p>
                        <p className='text-xs font-medium text-text-secondary'>Check back later</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default InsightsCard;