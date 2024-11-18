'use client';
import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import { Button, DatePicker, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import { Checkbox } from '@/components/ui/Checkbox';
import { ExportReportIcon, ExportExcelIcon, ExportPDFIcon, ExportWordIcon, CalendarIcon, DropDownIcon } from "@/lib/svg/icons";
import CustomButton from "@/components/ui/CustomButton";

const organization_dropdown_items = [
    "Choose organization",
    "D1",
    "D2",
    "D3",
    "D4",
    "D5",
];

function StandardReports() {

    const [selectOrganization, setSelectOrganization] = useState<string>(organization_dropdown_items[0]);

    const stylesDateInput = {
        inputWrapper: [
            "bg-foreground rounded-full border border-border-grey h-[40px] shadow-none px-4 min-w-[250px] text-[15px]",
        ],
        label: [
            "text-text-primary font-semibold text-[15px]",
        ],
    };

    return (
        <div>
            <header className='mb-6'>
                <h1 className='text-primary font-bold text-xl'>Standard Reports</h1>
                <p className='text-text-secondary font-regular text-sm'>Select the Filter you want to view</p>
            </header>
            <div className='flex justify-evenly gap-20'>
                <div className='flex flex-col items-end'>
                    <div className='py-2 flex text-left flex-row gap-3 items-center'>
                        <div className='font-semibold text-[15px] text-text-primary'>
                            Reports<span className="text-danger ml-1">*</span>
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
                                    <div className='flex items-center'>
                                        <div className='w-[250px] bg-foreground py-2.5 flex items-center gap-3 px-3 rounded-full border border-border-grey'>
                                            <p className='font-normal text-sm text-text-primary'>
                                                {selectOrganization}
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
                                items={organization_dropdown_items.map(item => ({ key: item, label: item }))}
                                onAction={(key) => {
                                    const selected = organization_dropdown_items.find((item) => item === key);
                                    if (selected) {
                                        setSelectOrganization(selected);
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
                            Organization<span className="text-danger ml-1">*</span>
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
                                    <div className='flex items-center'>
                                        <div className='w-[250px] bg-foreground py-2.5 flex items-center gap-3 px-3 rounded-full border border-border-grey'>
                                            <p className='font-normal text-sm text-text-primary'>
                                                {selectOrganization}
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
                                items={organization_dropdown_items.map(item => ({ key: item, label: item }))}
                                onAction={(key) => {
                                    const selected = organization_dropdown_items.find((item) => item === key);
                                    if (selected) {
                                        setSelectOrganization(selected);
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
                            Employee Types<span className="text-danger ml-1">*</span>
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
                                    <div className='flex items-center'>
                                        <div className='w-[250px] bg-foreground py-2.5 flex items-center gap-3 px-3 rounded-full border border-border-grey'>
                                            <p className='font-normal text-sm text-text-primary'>
                                                {selectOrganization}
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
                                items={organization_dropdown_items.map(item => ({ key: item, label: item }))}
                                onAction={(key) => {
                                    const selected = organization_dropdown_items.find((item) => item === key);
                                    if (selected) {
                                        setSelectOrganization(selected);
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
                        <DatePicker 
                            label="From Date" 
                            color='success'
                            labelPlacement="outside-left"
                            dateInputClassNames={stylesDateInput}
                            classNames={{
                                base: "text-text-primary max-w-fit gap-3",
                                selectorButton:"text-primary",
                                calendar:"bg-text-primary font-normal text-sm text-white border-border-grey shadow-searchbar rounded-lg",
                                calendarContent: " text-secondary",
                                input: "text-[15px] text-text-primary",
                            }}
                            selectorIcon={
                                CalendarIcon()
                            }
                        />
                    </div>
                    <div className="py-2.5 flex gap-3 items-center text-sm w-full justify-center">
                          <Checkbox checked
                            className="modal-checkbox outline-none border-[2px] w-4 h-4 border-border-grey font-semibold text-sm text-text-primary"
                          />Include inactive staff
                    </div>
                </div>
                <div className='flex flex-col items-end'>
                    <div className='py-2 flex text-left flex-row gap-3 items-center'>
                        <div className='font-semibold text-[15px] text-text-primary'>
                            Manager<span className="text-danger ml-1">*</span>
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
                                    <div className='flex items-center'>
                                        <div className='w-[250px] bg-foreground py-2.5 flex items-center gap-3 px-3 rounded-full border border-border-grey'>
                                            <p className='font-normal text-sm text-text-primary'>
                                                {selectOrganization}
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
                                items={organization_dropdown_items.map(item => ({ key: item, label: item }))}
                                onAction={(key) => {
                                    const selected = organization_dropdown_items.find((item) => item === key);
                                    if (selected) {
                                        setSelectOrganization(selected);
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
                            Employee<span className="text-danger ml-1">*</span>
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
                                    <div className='flex items-center'>
                                        <div className='w-[250px] bg-foreground py-2.5 flex items-center gap-3 px-3 rounded-full border border-border-grey'>
                                            <p className='font-normal text-sm text-text-primary'>
                                                {selectOrganization}
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
                                items={organization_dropdown_items.map(item => ({ key: item, label: item }))}
                                onAction={(key) => {
                                    const selected = organization_dropdown_items.find((item) => item === key);
                                    if (selected) {
                                        setSelectOrganization(selected);
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
                            Employee Groups
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
                                    <div className='flex items-center'>
                                        <div className='w-[250px] bg-foreground py-2.5 flex items-center gap-3 px-3 rounded-full border border-border-grey'>
                                            <p className='font-normal text-sm text-text-primary'>
                                                {selectOrganization}
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
                                items={organization_dropdown_items.map(item => ({ key: item, label: item }))}
                                onAction={(key) => {
                                    const selected = organization_dropdown_items.find((item) => item === key);
                                    if (selected) {
                                        setSelectOrganization(selected);
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
                        <DatePicker 
                            label="To Date" 
                            color='success'
                            labelPlacement="outside-left"
                            dateInputClassNames={stylesDateInput}
                            classNames={{
                                base: "text-text-primary max-w-fit gap-3",
                                selectorButton:"text-primary",
                                calendar:"bg-text-primary font-normal text-sm text-white border-border-grey shadow-searchbar rounded-lg",
                                calendarContent: " text-secondary",
                                input: "text-[15px] text-text-primary",
                            }}
                            selectorIcon={
                                CalendarIcon()
                            }
                        />
                    </div>
                </div>
            </div>
            <div className="content-footer-actions flex gap-3 items-center text-xs font-bold justify-center my-8 mb-5">
                <CustomButton 
                    variant="primary" 
                    borderRadius="lg" 
                    width = "auto" 
                    height="35px"
                    onClick={() => alert("Download")}
                    btnText='Show report'
                    btnIcon={ExportReportIcon()}
                    className='text-sm'
                />
                <CustomButton 
                    variant="success" 
                    borderRadius="lg" 
                    width = "auto" 
                    height="35px"
                    onClick={() => alert("Download")}
                    btnText='Export to excel'
                    btnIcon={ExportExcelIcon()}
                    className='text-sm'
                />
                <CustomButton 
                    variant="danger" 
                    borderRadius="lg" 
                    width = "auto" 
                    height="35px"
                    onClick={() => alert("Download")}
                    btnText='Export to PDF'
                    btnIcon={ExportPDFIcon()}
                    className='text-sm'
                />
                <CustomButton 
                    variant="primary" 
                    borderRadius="lg" 
                    width = "auto" 
                    height="35px"
                    onClick={() => alert("Download")}
                    btnText='Export to word'
                    btnIcon={ExportWordIcon()}
                    className='text-sm'
                />
            </div>
        </div>
    )
} 

export default StandardReports
