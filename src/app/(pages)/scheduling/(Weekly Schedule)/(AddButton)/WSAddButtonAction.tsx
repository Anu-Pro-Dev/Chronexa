'use client';
import React, { useState } from 'react';
import { Button, DatePicker, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import { CalendarIcon, DropDownIcon } from "@/lib/svg/icons"
import FileInput  from '@/components/ui/FileInput';
import CustomButton from "@/components/ui/CustomButton";

const schedule_dropdown = [
    "Choose Schedule",
    "Normal(07:30 - 15:30)",
    "Friday(07:30 - 12:00)",
    "Day(06:00 - 13:00)",
    "Night(22:00 - 06:00)",
];

const stylesDateInput = {
    inputWrapper: [
        "bg-foreground rounded-full border border-border-grey h-[40px] shadow-none px-4 min-w-[250px] text-[15px]",
    ],
    label: [
        "text-text-primary font-semibold text-[15px]",
    ],
};

function WSAddButtonAction({ setTab, tab, setHeaderCall }: { setTab: any, tab: any, setHeaderCall: any }) {

    const [selectSchedule, setSelectSchedule] = useState<string>(schedule_dropdown[0]);

    const stylesDateInput = {
        inputWrapper: [
            "bg-foreground rounded-full border border-border-grey h-[40px] shadow-none px-4 min-w-[220px] text-[15px]",
        ],
        label: [
            "text-text-primary font-semibold text-[15px]",
        ],
    };

    const handleWeeklyScheduleAddClose = () => {
        setHeaderCall(null)
    };

    return (
        <div className="bg-foreground rounded-[20px] mx-6 p-6">
            <header className='mb-6'>
                <h1 className='text-primary font-bold text-xl'>Schedule for Organization</h1>
                <p className='text-text-secondary font-regular text-sm'>Select the schedule for further process</p>
            </header>
            <div className='tab-container'>
                <div className="tab-content py-5">
                    <div className='flex justify-evenly gap-20'>
                        <div className='flex flex-col items-end'>
                            <div className='py-2 flex text-left flex-row gap-3 items-center'>
                                <DatePicker
                                    label="From Date"
                                    color='success'
                                    labelPlacement="outside-left"
                                    dateInputClassNames={stylesDateInput}
                                    isRequired
                                    classNames={{
                                        base: "text-text-primary max-w-fit gap-3",
                                        selectorButton: "text-text-primary",
                                        calendar: "bg-text-primary font-normal text-sm text-white border-border-grey shadow-searchbar rounded-lg",
                                        calendarContent: " text-secondary",
                                        input: "text-[15px] text-text-primary",
                                    }}
                                    selectorIcon={
                                        CalendarIcon()
                                    }
                                />
                            </div>
                            <div className='py-2 flex text-left flex-row gap-3 items-center'>
                                <div className='font-semibold text-[15px] text-text-primary'>
                                    Schedule<span className="text-danger ml-1">*</span>
                                </div>
                                <Dropdown
                                    placement="bottom-start"
                                    className=""
                                >
                                    <DropdownTrigger>
                                        <Button
                                            disableRipple
                                            isLoading={false}
                                            className="text-sm font-bold p-0 block gap-1 h-auto w-auto"
                                        >
                                            <div className='flex items-center gap-3'>
                                                <div className='w-[220px] bg-foreground py-2.5 flex items-center gap-3 px-3 rounded-full border border-border-grey'>
                                                    <p className='font-normal text-sm text-text-primary'>
                                                        {selectSchedule}
                                                    </p>
                                                    <div className='float-right w-full flex justify-end'>
                                                        <span className="text-text-primary w-5">{DropDownIcon()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        aria-label="Dynamic Actions"
                                        items={schedule_dropdown.map(item => ({ key: item, label: item }))}
                                        onAction={(key) => {
                                            const selected = schedule_dropdown.find((item) => item === key);
                                            if (selected) {
                                                setSelectSchedule(selected);
                                            }
                                        }}
                                        className="p-0 bg-foreground w-full shadow-dropdown rounded-lg overflow-hidden"
                                    >
                                        {(item) => (
                                            <DropdownItem
                                                className={`p-2 text-text-primary hover:text-primary hover:bg-backdrop`}
                                                key={item.key}
                                            >
                                                {item.label}
                                            </DropdownItem>
                                        )}
                                    </DropdownMenu>
                                </Dropdown>
                            </div>
                            <div className='py-2 flex text-left flex-row gap-3 items-center'>
                                <div className='font-semibold text-[15px] text-text-primary'>
                                    Monday
                                </div>
                                <Dropdown
                                    placement="bottom-start"
                                    className=""
                                >
                                    <DropdownTrigger>
                                        <Button
                                            disableRipple
                                            isLoading={false}
                                            className="text-sm font-bold p-0 block gap-1 h-auto w-auto"
                                        >
                                            <div className='flex items-center gap-3'>
                                                <div className='w-[220px] bg-foreground py-2.5 flex items-center gap-3 px-3 rounded-full border border-border-grey'>
                                                    <p className='font-normal text-sm text-text-primary'>
                                                        {selectSchedule}
                                                    </p>
                                                    <div className='float-right w-full flex justify-end'>
                                                        <span className="text-text-primary w-5">{DropDownIcon()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        aria-label="Dynamic Actions"
                                        items={schedule_dropdown.map(item => ({ key: item, label: item }))}
                                        onAction={(key) => {
                                            const selected = schedule_dropdown.find((item) => item === key);
                                            if (selected) {
                                                setSelectSchedule(selected);
                                            }
                                        }}
                                        className="p-0 bg-foreground w-full shadow-dropdown rounded-lg overflow-hidden"
                                    >
                                        {(item) => (
                                            <DropdownItem
                                                className={`p-2 text-text-primary hover:text-primary hover:bg-backdrop`}
                                                key={item.key}
                                            >
                                                {item.label}
                                            </DropdownItem>
                                        )}
                                    </DropdownMenu>
                                </Dropdown>
                            </div>
                            <div className='py-2 flex text-left flex-row gap-3 items-center'>
                                <div className='font-semibold text-[15px] text-text-primary'>
                                    Wednesday
                                </div>
                                <Dropdown
                                    placement="bottom-start"
                                    className=""
                                >
                                    <DropdownTrigger>
                                        <Button
                                            disableRipple
                                            isLoading={false}
                                            className="text-sm font-bold p-0 block gap-1 h-auto w-auto"
                                        >
                                            <div className='flex items-center gap-3'>
                                                <div className='w-[220px] bg-foreground py-2.5 flex items-center gap-3 px-3 rounded-full border border-border-grey'>
                                                    <p className='font-normal text-sm text-text-primary'>
                                                        {selectSchedule}
                                                    </p>
                                                    <div className='float-right w-full flex justify-end'>
                                                        <span className="text-text-primary w-5">{DropDownIcon()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        aria-label="Dynamic Actions"
                                        items={schedule_dropdown.map(item => ({ key: item, label: item }))}
                                        onAction={(key) => {
                                            const selected = schedule_dropdown.find((item) => item === key);
                                            if (selected) {
                                                setSelectSchedule(selected);
                                            }
                                        }}
                                        className="p-0 bg-foreground w-full shadow-dropdown rounded-lg overflow-hidden"
                                    >
                                        {(item) => (
                                            <DropdownItem
                                                className={`p-2 text-text-primary hover:text-primary hover:bg-backdrop`}
                                                key={item.key}
                                            >
                                                {item.label}
                                            </DropdownItem>
                                        )}
                                    </DropdownMenu>
                                </Dropdown>
                            </div>
                            <div className='py-2 flex text-left flex-row gap-3 items-center'>
                                <div className='font-semibold text-[15px] text-text-primary'>
                                    Friday
                                </div>
                                <Dropdown
                                    placement="bottom-start"
                                    className=""
                                >
                                    <DropdownTrigger>
                                        <Button
                                            disableRipple
                                            isLoading={false}
                                            className="text-sm font-bold p-0 block gap-1 h-auto w-auto"
                                        >
                                            <div className='flex items-center gap-3'>
                                                <div className='w-[220px] bg-foreground py-2.5 flex items-center gap-3 px-3 rounded-full border border-border-grey'>
                                                    <p className='font-normal text-sm text-text-primary'>
                                                        {selectSchedule}
                                                    </p>
                                                    <div className='float-right w-full flex justify-end'>
                                                        <span className="text-text-primary w-5">{DropDownIcon()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        aria-label="Dynamic Actions"
                                        items={schedule_dropdown.map(item => ({ key: item, label: item }))}
                                        onAction={(key) => {
                                            const selected = schedule_dropdown.find((item) => item === key);
                                            if (selected) {
                                                setSelectSchedule(selected);
                                            }
                                        }}
                                        className="p-0 bg-foreground w-full shadow-dropdown rounded-lg overflow-hidden"
                                    >
                                        {(item) => (
                                            <DropdownItem
                                                className={`p-2 text-text-primary hover:text-primary hover:bg-backdrop`}
                                                key={item.key}
                                            >
                                                {item.label}
                                            </DropdownItem>
                                        )}
                                    </DropdownMenu>
                                </Dropdown>
                            </div>
                            <FileInput inputLabel={'Attachment'} inputAttr={true} className={'flex-row gap-3 items-center'} buttonClassName={'left-[102px] min-w-[60px]'} labelClassName={'font-semibold text-[15px]'} inputClassName={'w-[220px]'}/>
                        </div>
                        <div className='flex flex-col items-end'>
                        <div className='py-2 flex text-left flex-row gap-3 items-center'>
                                <DatePicker
                                    label="To Date"
                                    color='success'
                                    labelPlacement="outside-left"
                                    dateInputClassNames={stylesDateInput}
                                    classNames={{
                                        base: "text-text-primary max-w-fit gap-3",
                                        selectorButton: "text-text-primary",
                                        calendar: "bg-text-primary font-normal text-sm text-white border-border-grey shadow-searchbar rounded-lg",
                                        calendarContent: " text-secondary",
                                        input: "text-[15px] text-text-primary",
                                    }}
                                    selectorIcon={
                                        CalendarIcon()
                                    }
                                />
                            </div>
                            <div className='py-2 flex text-left flex-row gap-3 items-center'>
                                <div className='font-semibold text-[15px] text-text-primary'>
                                    Sunday
                                </div>
                                <Dropdown
                                    placement="bottom-start"
                                    className=""
                                >
                                    <DropdownTrigger>
                                        <Button
                                            disableRipple
                                            isLoading={false}
                                            className="text-sm font-bold p-0 block gap-1 h-auto w-auto"
                                        >
                                            <div className='flex items-center gap-3'>
                                                <div className='w-[220px] bg-foreground py-2.5 flex items-center gap-3 px-3 rounded-full border border-border-grey'>
                                                    <p className='font-normal text-sm text-text-primary'>
                                                        {selectSchedule}
                                                    </p>
                                                    <div className='float-right w-full flex justify-end'>
                                                        <span className="text-text-primary w-5">{DropDownIcon()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        aria-label="Dynamic Actions"
                                        items={schedule_dropdown.map(item => ({ key: item, label: item }))}
                                        onAction={(key) => {
                                            const selected = schedule_dropdown.find((item) => item === key);
                                            if (selected) {
                                                setSelectSchedule(selected);
                                            }
                                        }}
                                        className="p-0 bg-foreground w-full shadow-dropdown rounded-lg overflow-hidden"
                                    >
                                        {(item) => (
                                            <DropdownItem
                                                className={`p-2 text-text-primary hover:text-primary hover:bg-backdrop`}
                                                key={item.key}
                                            >
                                                {item.label}
                                            </DropdownItem>
                                        )}
                                    </DropdownMenu>
                                </Dropdown>
                            </div>
                            <div className='py-2 flex text-left flex-row gap-3 items-center'>
                                <div className='font-semibold text-[15px] text-text-primary'>
                                    Tuesday
                                </div>
                                <Dropdown
                                    placement="bottom-start"
                                    className=""
                                >
                                    <DropdownTrigger>
                                        <Button
                                            disableRipple
                                            isLoading={false}
                                            className="text-sm font-bold p-0 block gap-1 h-auto w-auto"
                                        >
                                            <div className='flex items-center gap-3'>
                                                <div className='w-[220px] bg-foreground py-2.5 flex items-center gap-3 px-3 rounded-full border border-border-grey'>
                                                    <p className='font-normal text-sm text-text-primary'>
                                                        {selectSchedule}
                                                    </p>
                                                    <div className='float-right w-full flex justify-end'>
                                                        <span className="text-text-primary w-5">{DropDownIcon()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        aria-label="Dynamic Actions"
                                        items={schedule_dropdown.map(item => ({ key: item, label: item }))}
                                        onAction={(key) => {
                                            const selected = schedule_dropdown.find((item) => item === key);
                                            if (selected) {
                                                setSelectSchedule(selected);
                                            }
                                        }}
                                        className="p-0 bg-foreground w-full shadow-dropdown rounded-lg overflow-hidden"
                                    >
                                        {(item) => (
                                            <DropdownItem
                                                className={`p-2 text-text-primary hover:text-primary hover:bg-backdrop`}
                                                key={item.key}
                                            >
                                                {item.label}
                                            </DropdownItem>
                                        )}
                                    </DropdownMenu>
                                </Dropdown>
                            </div>
                            <div className='py-2 flex text-left flex-row gap-3 items-center'>
                                <div className='font-semibold text-[15px] text-text-primary'>
                                    Thursday
                                </div>
                                <Dropdown
                                    placement="bottom-start"
                                    className=""
                                >
                                    <DropdownTrigger>
                                        <Button
                                            disableRipple
                                            isLoading={false}
                                            className="text-sm font-bold p-0 block gap-1 h-auto w-auto"
                                        >
                                            <div className='flex items-center gap-3'>
                                                <div className='w-[220px] bg-foreground py-2.5 flex items-center gap-3 px-3 rounded-full border border-border-grey'>
                                                    <p className='font-normal text-sm text-text-primary'>
                                                        {selectSchedule}
                                                    </p>
                                                    <div className='float-right w-full flex justify-end'>
                                                        <span className="text-text-primary w-5">{DropDownIcon()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        aria-label="Dynamic Actions"
                                        items={schedule_dropdown.map(item => ({ key: item, label: item }))}
                                        onAction={(key) => {
                                            const selected = schedule_dropdown.find((item) => item === key);
                                            if (selected) {
                                                setSelectSchedule(selected);
                                            }
                                        }}
                                        className="p-0 bg-foreground w-full shadow-dropdown rounded-lg overflow-hidden"
                                    >
                                        {(item) => (
                                            <DropdownItem
                                                className={`p-2 text-text-primary hover:text-primary hover:bg-backdrop`}
                                                key={item.key}
                                            >
                                                {item.label}
                                            </DropdownItem>
                                        )}
                                    </DropdownMenu>
                                </Dropdown>
                            </div>
                            <div className='py-2 flex text-left flex-row gap-3 items-center'>
                                <div className='font-semibold text-[15px] text-text-primary'>
                                    Saturday
                                </div>
                                <Dropdown
                                    placement="bottom-start"
                                    className=""
                                >
                                    <DropdownTrigger>
                                        <Button
                                            disableRipple
                                            isLoading={false}
                                            className="text-sm font-bold p-0 block gap-1 h-auto w-auto"
                                        >
                                            <div className='flex items-center gap-3'>
                                                <div className='w-[220px] bg-foreground py-2.5 flex items-center gap-3 px-3 rounded-full border border-border-grey'>
                                                    <p className='font-normal text-sm text-text-primary'>
                                                        {selectSchedule}
                                                    </p>
                                                    <div className='float-right w-full flex justify-end'>
                                                        <span className="text-text-primary w-5">{DropDownIcon()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        aria-label="Dynamic Actions"
                                        items={schedule_dropdown.map(item => ({ key: item, label: item }))}
                                        onAction={(key) => {
                                            const selected = schedule_dropdown.find((item) => item === key);
                                            if (selected) {
                                                setSelectSchedule(selected);
                                            }
                                        }}
                                        className="p-0 bg-foreground w-full shadow-dropdown rounded-lg overflow-hidden"
                                    >
                                        {(item) => (
                                            <DropdownItem
                                                className={`p-2 text-text-primary hover:text-primary hover:bg-backdrop`}
                                                key={item.key}
                                            >
                                                {item.label}
                                            </DropdownItem>
                                        )}
                                    </DropdownMenu>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                    <div className='w-full flex gap-5 justify-end mt-6'>
                        <CustomButton
                            variant="outline"
                            borderRadius="full"
                            width="145px"
                            height="45px"
                            onClick={handleWeeklyScheduleAddClose}
                            btnText='Cancel'
                        />
                        <CustomButton
                            variant="primary"
                            borderRadius="full"
                            width="145px"
                            height="45px"
                            onClick={handleWeeklyScheduleAddClose}
                            btnText='Save'
                        />
                    </div>
                </div>
            </div>
        </div>
    )
} 

export default WSAddButtonAction
