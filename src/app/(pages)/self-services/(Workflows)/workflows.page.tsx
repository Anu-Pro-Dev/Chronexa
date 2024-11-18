/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { DataTable } from '@/widgets/DataTable.widget'
import React, { useState } from 'react'
import WorkflowsHeader from './Workflows.header'
import AddViewPage from './(AddView)/AddView.page';

function workflowsPage({ col, data, tab, setTab }: { col: any[], data: any[], tab: string, setTab: any }) {

    const [openModelName, setOpenModelName] = useState("");
    const [showActions, setShowActions] = useState(true);

    const CloseAnOtherViewPage = () => {
        setShowActions(true);
        setOpenModelName("");
    }

    return (
        <div>
            <WorkflowsHeader setTab={setTab} tab={tab} setOpenModelName={setOpenModelName} showActions={showActions} setShowActions={setShowActions} CloseAnOtherViewPage={CloseAnOtherViewPage} />
            {
                openModelName === "" ? (
                    <div className="bg-foreground rounded-[20px] mx-6 pb-6 pt-3 px-4">
                        <DataTable columns={col} data={data} tab={tab} searchValue={""} customClasses="" />
                    </div>
                ) : (
                    <div>
                        <AddViewPage CloseAnOtherViewPage={CloseAnOtherViewPage} />
                    </div>
                )
            }
        </div>
    )
}

export default workflowsPage
