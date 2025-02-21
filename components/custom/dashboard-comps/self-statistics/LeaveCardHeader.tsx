import Link from "next/link";

export const LeaveCardHeader = ({ page, setPage }:any) => (
    <div className='flex flex-row justify-between p-4'>
        <div className='flex gap-2'>
            <h5 className={`cursor-pointer font-bold text-lg ${page === "Leaves" ? "border-b-[2px] border-primary text-primary" : "text-text-primary"}`} onClick={() => setPage("Leaves")}>Leaves</h5>
            <h5 className='cursor-pointer font-bold text-lg text-text-primary'>/</h5>
            <h5 className={`cursor-pointer font-bold text-lg ${page === "Permissions" ? "border-b-[2px] border-primary text-primary" : "text-text-primary"}`} onClick={() => setPage("Permissions")}>Permissions</h5>
        </div>
        <Link href="/self-services" className='text-primary text-sm font-medium flex items-center justify-center gap-1'>
            Apply
            <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.93496 3.28394L13.1537 7.50269C13.2193 7.56801 13.2713 7.64563 13.3068 7.73109C13.3422 7.81656 13.3605 7.90819 13.3605 8.00073C13.3605 8.09327 13.3422 8.18491 13.3068 8.27037C13.2713 8.35584 13.2193 8.43346 13.1537 8.49878L8.93496 12.7175C8.80287 12.8496 8.62372 12.9238 8.43691 12.9238C8.25011 12.9238 8.07096 12.8496 7.93887 12.7175C7.80678 12.5854 7.73257 12.4063 7.73257 12.2195C7.73257 12.0327 7.80678 11.8535 7.93887 11.7214L10.957 8.70327H2.34375C2.15727 8.70327 1.97843 8.62919 1.84657 8.49733C1.7147 8.36547 1.64063 8.18663 1.64063 8.00015C1.64063 7.81367 1.7147 7.63482 1.84657 7.50296C1.97843 7.3711 2.15727 7.29702 2.34375 7.29702L10.957 7.29702L7.93828 4.27886C7.80619 4.14677 7.73198 3.96762 7.73198 3.78081C7.73198 3.59401 7.80619 3.41486 7.93828 3.28276C8.07037 3.15067 8.24952 3.07647 8.43633 3.07647C8.62313 3.07647 8.80228 3.15067 8.93437 3.28276L8.93496 3.28394Z" fill="#0078D4"/>
            </svg>
        </Link>
    </div>
);