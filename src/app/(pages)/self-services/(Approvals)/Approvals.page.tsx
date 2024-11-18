
import { DataTable } from '@/widgets/DataTable.widget';
import React, { useState } from 'react'
import TabActionApproval from "./(TableTabs)/TabAction";
import ApprovalsHeader from './Approvals.header';

function ApprovalsPage({ col, data, tab, setTab }: { col: any[], data: any[], tab: string, setTab: any }) {
    const [openModelName, setOpenModelName] = React.useState("");
    const [showActions, setShowActions] = React.useState(true);
    const [currentTab, setCurrentTab] = useState<string>('Verification');

    const CloseAnOtherViewPage = () => {
        setShowActions(true);
        setOpenModelName("");
    }

    return (
        <div>
            <ApprovalsHeader setTab={setTab} tab={tab} currentTab={currentTab} />
            <TabActionApproval setCurrentTab={setCurrentTab} currentTab={currentTab} />
        </div>
    )
}

export default ApprovalsPage
