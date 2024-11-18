"use client";

import React from 'react'
import HeaderWeeklySchedule from './header'
import { DataTable } from '@/widgets/DataTable.widget'
import WSAddButtonAction from './(AddButton)/WSAddButtonAction';

function WeeklySchedulePage({ setTab, tab, col, data }: { setTab: (tab: string) => void, tab: string, col: any[], data: any[] }) {

    const [headerCall, setHeaderCall] = React.useState<null | any>(null);

    return (
        <div className="page-container">
            <HeaderWeeklySchedule setTab={setTab} tab={tab} headerCall={headerCall} setHeaderCall={setHeaderCall} />
            {headerCall === "#add" ?
                <WSAddButtonAction setTab={setTab} tab={tab} setHeaderCall={setHeaderCall} /> :
                <div className="bg-foreground rounded-[20px] mx-6 pb-6 pt-3 px-4">
                    <DataTable columns={col} data={data} tab={tab} searchValue={""} customClasses="" />
                </div>
            }

        </div>
    )
}

export default WeeklySchedulePage
